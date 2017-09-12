/**
 * Created by Vampire on 2016/5/27.
 */
var mongoose = require('mongoose');
var ASSET_TYPE = require('./asset').ASSET_TYPE;
var Asset = require('./asset').Assets;
var Users = require('./Users').Users;

var Schema = mongoose.Schema;

var TRANSACTION_TYPE={
    TRANSACTION:"交易",
    ISSUE:"发行"
};
var _Transaction = new Schema({
    hash: { type: String, required: true, unique:true},
    from : { type: String, required: true, default:"null"},
    amount : { type: Number, required: true, default: 0},
    to : { type: String, required: true, default:"null"},
    asset_addr : { type: String, required: true},
    create_time : { type: Date, default: Date.now },
    type : {type :String, required: true, default: TRANSACTION_TYPE.TRANSACTION}
});

_Transaction.methods.toJson = function(callback){
    var tr = this;
    Asset.findOne({asset_addr:this.asset_addr,type:ASSET_TYPE.ISSUE}, function (err, origin_asset) {
        Asset.findOne({asset_addr: tr.asset_addr},function(err,asset){
            Users.findOne({account_addr:origin_asset.account_addr},function(err,issuer){

                callback(err,{
                    hash:tr.hash,
                    from: tr.from,
                    amount: tr.amount,
                    to: tr.to,
                    asset_addr: tr.assets_addr,
                    asset_name: asset?asset.name:"无",
                    issuer: issuer?{
                        phone:issuer.phone,
                        account_addr:issuer.account_addr
                    }:{},
                    create_time: tr.create_time.toLocaleString()
                });
            })
        })
    });
};
var Transaction = mongoose.model('Transaction', _Transaction);

module.exports.Transaction = Transaction;
module.exports.TRANSACTION_TYPE = TRANSACTION_TYPE;
