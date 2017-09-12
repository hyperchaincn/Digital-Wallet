/**
 * Created by Vampire on 16-6-1.
 * Update by Tyrion on 16/6/2
 */
var express = require('express');
var Transaction = require('../models/transaction').Transaction;
var User = require('../models/Users').Users;
var verify_psw = require('../models/Users').verify_psw;
var Asset = require("../models/asset").Assets;
var ASSET_TYPE = require("../models/asset").ASSET_TYPE;
var TRANSACTION_TYPE = require('../models/transaction').TRANSACTION_TYPE;
var request = require('request');
var GETH_URL = require('../help_utils/geth_level_utils').BASE_URL;
var blockchain_lib = require("../blockchain_lib/lib");
var checkForContractAddress = blockchain_lib.ForContractAddress;
var newAsset = blockchain_lib.newAsset;
var getTimestamp = blockchain_lib.getTimestamp;
var random_16bits = blockchain_lib.random_16bits;
var checkForContractTransaction = blockchain_lib.checkForContractTransaction;
var newTransaction = blockchain_lib.newTransaction;
var issueAsset = blockchain_lib.issueAsset;

var router = new express.Router();

router.get('/',function(req, res){
    console.log(req.query);
    var type = req.query.type;
    var filter = {};
    console.log("user_id:"+req.user.id);
    switch(type){
        case "issue": filter = {
            type:TRANSACTION_TYPE.ISSUE,
            from:req.user.account_addr
        }; break;
        case "receive": filter = {
            type:TRANSACTION_TYPE.TRANSACTION,
            to:req.user.account_addr
        }; break;
        case "transfer": filter = {
            type:TRANSACTION_TYPE.TRANSACTION,
            from:req.user.account_addr
        }; break;
        default:filter = {"$or":[{from:req.user.account_addr},{to:req.user.account_addr}]};
    }
    console.log(filter);
    Transaction.find(filter, null, {sort: [{'_id': -1}]},function(err, transactions){
        if(err) {
            return res.status(500).send({
                "status": "failed",
                "msg": "Something wrong with Server"
            });
        }
        console.log('123');
        if(transactions[0]){
            var tr_list=[];
            //console.log(transactions);
            for (var i=0; i<transactions.length; i++){
                var save_cur = function(cur_tr){
                    Asset.findOne({asset_addr:transactions[i].asset_addr}, function (err,asset) {
                        if(asset){
                            var tr_json={};
                            //console.log(asset);
                            tr_json={
                                status:"ok",
                                msg:"请求成功",
                                asset_name: asset.name,
                                asset_addr: cur_tr.asset_addr,
                                hash: cur_tr.hash,
                                create_time: cur_tr.create_time.toLocaleString(),
                                amount:cur_tr.amount,
                                type: cur_tr.type == TRANSACTION_TYPE.ISSUE?cur_tr.type:(cur_tr.to == req.user.account_addr?"转出":"转入")
                            };
                            var other_party_addr = req.user.account_addr == cur_tr.from?cur_tr.to:cur_tr.from;
                            console.log(other_party_addr);
                            User.findOne({account_addr: other_party_addr},function(err, user){
                                Asset.findOne({asset_addr:cur_tr.asset_addr,type:ASSET_TYPE.ISSUE},function(err,asset){
                                    User.findOne({account_addr:asset.account_addr},function(err,issuer){
                                        if(user){
                                            tr_json.other_party = {
                                                phone: user.phone,
                                                account_addr: user.account_addr
                                            };
                                            tr_list.push(new Object({
                                                status:"ok",
                                                msg:"请求成功",
                                                asset_name: asset.name,
                                                asset_addr: cur_tr.asset_addr,
                                                hash: cur_tr.hash,
                                                create_time: cur_tr.create_time.toLocaleString(),
                                                amount:cur_tr.amount,
                                                type: cur_tr.type == TRANSACTION_TYPE.ISSUE?cur_tr.type:(cur_tr.to == req.user.account_addr?"转入":"转出"),
                                                issuer: {
                                                    account_addr:issuer.account_addr,
                                                    phone:issuer.phone
                                                },
                                                other_party:user?{
                                                    phone: user.phone,
                                                    account_addr: user.account_addr
                                                }:''
                                            }));
                                            if(tr_list.length == transactions.length){
                                                req.tr_list = tr_list;
                                                return res.send({
                                                    data:tr_list
                                                })
                                            }}
                                    });
                                });
                            });
                        }
                    });
                };
                var temp=transactions[i];
                save_cur(new Object(temp));
            }
        }else{
            return res.send({
                status:"ok",
                msg:"无",
                data:[]
            })
        }
    })
});
router.post('/',verify_psw,function(req, res){
    var to = req.body.to;
    var amount = req.body.amount;
    var asset_addr = req.body.asset_addr;
    if(!(to && amount && asset_addr)){
        return res.status(400).send({
            status: "failed",
            msg: "信息提交错误"
        })
    }
    if(to == req.user.account_addr){
        return res.status(400).send({
            status:"failed",
            msg:"无法给自己转账"
        })
    }
    console.log(asset_addr+":"+req.user.account_addr);
    Asset.findOne({asset_addr:asset_addr, account_addr:req.user.account_addr},function(err, asset){
        if (err){
            return res.status(400).send({
                status: "failed",
                msg: err
            })
        } else if(asset){
            if(asset.balance<amount){
                return res.status(403).send({
                    "status": "failed",
                    "msg": "余额不足"
                })
            }
            Asset.findOne({asset_addr:asset_addr,account_addr:to},function(err,to_asset){
                // request.post(
                //     GETH_URL+'/transaction',
                //     {
                //         form: {
                //             from_addr: req.user.account_addr,
                //             to_addr: to,
                //             amount: amount,
                //             assets_code: asset.asset_addr
                //         }
                //     },
                //     function(error,response,body){
                    newTransaction(req.user.account_addr, to, amount, req.user.private_key, asset_addr, function(error, data){
                        console.log('取得响应');
                        console.log("error----------"+err);
                        console.log("body.hash------------"+ data.txHash);
                        if(!error && data.txHash){
                            var new_trsac = new Transaction({
                                hash: data.txHash,
                                from : req.user.account_addr,
                                to: to,
                                amount: amount,
                                asset_addr: asset.asset_addr,
                                create_time: new Date,
                                type: TRANSACTION_TYPE.TRANSACTION
                            });
                            if(to_asset){
                                asset.balance -= amount ;
                                to_asset.balance += amount;
                                User.findOne({account_addr:to},function(err, user){
                                    if(user){
                                        new_trsac.toJson(function(err,json){
                                            json.other_party = {
                                                phone:user.phone,
                                                account_addr:user.account_addr
                                            };
                                            json.type="转出";
                                            asset.save();
                                            to_asset.save();
                                            new_trsac.save();
                                            return res.send({
                                                status: 'ok',
                                                data:json
                                            })
                                        })
                                    }else{
                                        console.log('转出方地址有误');
                                        return res.status(412).send({
                                            status: 'failed',
                                            msg:'收款方地址有误',
                                            data:{}
                                        })
                                    }
                                })
                            }else{
                                //为欲转账的用户创建一个资产
                                var new_asset = new Asset({
                                    name: asset.name,
                                    amount: asset.amount,
                                    balance: amount,
                                    unit: asset.unit,
                                    description: asset.description,
                                    logo: asset.logo,
                                    type: ASSET_TYPE.RECEIVING,
                                    account_addr: to,
                                    create_time: new Date,
                                    asset_addr: asset.asset_addr
                                });
                                asset.balance -= amount ;
                                User.findOne({account_addr:to},function(err, user){
                                    if(user){
                                        new_trsac.toJson(function(err,json){
                                            json.other_party = {
                                                phone:user.phone,
                                                account_addr:user.account_addr
                                            };
                                            new_asset.save();
                                            asset.save();
                                            new_trsac.save();
                                            return res.send({
                                                status: 'ok',
                                                data:json
                                            })
                                        })
                                    }else{
                                        console.log('转出方地址有误');
                                        return res.status(412).send({
                                            status: 'failed',
                                            msg:'收款方地址有误',
                                            data:{}
                                        })
                                    }
                                })
                            }
                        }else{
                            return res.status(412).send({
                                'status': 'failed',
                                'msg': '创建交易失败，请重试',
                                'data': {}
                            })
                        }
                    });
            })
        }
        else{
            return res.send({
                status: "failed",
                msg: "你还未拥有该资产"
            })
        }
    });
});

module.exports = router;
