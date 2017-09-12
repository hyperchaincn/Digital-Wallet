/**
 * Created by Vampire on 16-5-27.
 */
var express = require('express');
var Assets = require('../models/asset').Assets;
var Transaction = require("../models/transaction").Transaction;
var ASSET_TYPE = require("../models/asset").ASSET_TYPE;
var verify_psw = require("../models/Users").verify_psw;
var TRANSACTION_TYPE = require("../models/transaction").TRANSACTION_TYPE;
var GETH_URL = require("../help_utils/geth_level_utils").BASE_URL;
var blockchain_lib = require("../blockchain_lib/lib");
var checkForContractAddress = blockchain_lib.ForContractAddress;
var newAsset = blockchain_lib.newAsset;
var getTimestamp = blockchain_lib.getTimestamp;
var random_16bits = blockchain_lib.random_16bits;
var checkForContractTransaction = blockchain_lib.checkForContractTransaction;
var issueAsset = blockchain_lib.issueAsset;

var router = express.Router();
var request = require('request');

router.post('/', verify_psw, function(req, res) {
  console.log(JSON.stringify(req.user))
  var name = req.body.name;
  var unit = req.body.unit;
  var description = req.body.description;

  //check the information
  if(!(name
      // && amount && logo
      && unit && description)){
    return res.status(400).send({
      'status': 'failed',
      'msg': 'please fill all fields!'
    });

    //add fields check codes here

  }
  // request.post(GETH_URL+"/assets",{form:{address:req.user.account_addr}},function(error,response,body){
  newAsset(req.user.account_addr, req.user.private_key, function(error, address){
    if(!error && address){
      var new_asset = new Assets({
        name: name,
        unit: unit,
        description: description,
        logo: "http://fanyi.baidu.com/static/translation/img/header/logo_cbfea26.png",
        account_addr: req.user.account_addr,
        create_time: new Date,
        type: ASSET_TYPE.ISSUE
      });
      new_asset.asset_addr = address;
      new_asset.save();
      return res.send({
        'status': 'ok',
        'msg': 'create new asset ok',
        'data': new_asset.toJson()
      });
    }else{
      return res.status(412).send({
        'status': 'failed',
        'msg': '创建资产失败，请重试',
        'data': {}
      })
    }
  });
});

/*
 var _Asset = new Schema({
 name : { type: String, required: true
 // , unique: true  TODO:资产名可以不唯一
 },
 amount : { type: Number, required: true, default: 0},
 unit : { type: String, required: true},
 description : { type: String, required: true},
 logo : { type: String, required: true},
 account_addr : { type: String, required: true},
 create_time : { type: Date, default: Date.now },
 asset_addr: {type: String, required: true},
 type: {type:String, required:true, default:ASSET_TYPE.ISSUE}
 });
 */
router.get('/', function(req, res){
  var type = req.query.type;
  var asset_addr = req.query.asset_addr;//查询某一特定资产
  if (asset_addr){
    return Assets.findOne({asset_addr: asset_addr, account_addr: req.user.account_addr}, function (err, asset) {
      if(err){
        return res.status(400).send({
          status: "failed",
          msg: "something wrong with query asset"
        })
      }
      if (asset){
        return res.send({
          status: "ok",
          data: asset.toJson()
        })
      }
    })
  }

  var filter = {'account_addr': req.user.account_addr};
  switch(type){
    case "issue": filter['type'] = ASSET_TYPE.ISSUE; break;
      case "receive": filter['type'] = ASSET_TYPE.RECEIVING;break;
    default:break;
  }

  return Assets.find(filter, function(err, assets){
    if(assets[0]==null){
      return res.send({
        data: [],
        status: 'success'
      });
    }else{
      var asset_list = [];
      for (var i =0; i< assets.length; i++){
        asset_list[i] = assets[i].toJson();
      }
      return res.send({
        data: asset_list,
        status: 'ok'
      });
    }
  });
});

//发布资产
router.put('/', verify_psw, function(req, res){
  var asset_addr = req.body.asset_addr;
  var amount = req.body.amount || 0;
  if(!(asset_addr && amount)){
    return res.status(400).send({
      'status': 'failed',
      'msg': '请求数据错误'
    });
  }
  Assets.find({'asset_addr': asset_addr, account_addr:req.user.account_addr}, null, {sort: [{'_id': -1}]}, function (err, assets) {
    if(assets[0]==null){
      return res.status(404).send({
        msg: '资产不存在',
        status: 'failed'
      });
    }else if(assets[0].type!=ASSET_TYPE.ISSUE){
      return res.status(412).send({
        status:"failed",
        msg:"没有发行权"
      })
    }else{
      issueAsset(req.user.account_addr, req.user.private_key, asset_addr, amount, function(error, receipt){
        if(!error && receipt.txHash){
          var new_trsac = new Transaction({
            from: req.user.account_addr,
            to: req.user.account_addr,
            amount: amount,
            create_time: new Date,
            asset_addr: asset_addr,
            type: TRANSACTION_TYPE.ISSUE,
            hash: receipt.txHash
          });
          new_trsac.save(function(err){
            console.log(err);
          });
          assets[0].amount += amount;
          assets[0].balance += amount;
          assets[0].save(function(err){
            console.log(err);
          });
          return res.send({
            status: 'ok',
            msg: "发布成功",
            data: assets[0].toJson()
          });
        }else{
          return res.send({
            'status': 'failed',
            'msg': '发布资产失败，请重试',
            'data': {}
          })
        }
      })
    }
  })
});

module.exports = router;
