/**
 * Created by Vampire on 2016/5/27.
 */
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var base64_util = require("../help_utils/base64_util");

var Schema = mongoose.Schema;

var ASSET_TYPE={
    RECEIVING:"转入",
    ISSUE:"发行"
};
var _Asset = new Schema({
    name : { type: String, required: true
        // , unique: true  TODO:资产名可以不唯一
    },
    amount : { type: Number, required: true, default: 0},
    balance: {type: Number, required: true, default: 0},
    unit : { type: String, required: true},
    description : { type: String, required: true},
    logo : { type: String, required: true},
    account_addr : { type: String, required: true},
    create_time : { type: Date, default: Date.now },
    asset_addr: {type: String, required: true},
    holder: {type: Array},
    type: {type:String, required:true, default:ASSET_TYPE.ISSUE}
});
_Asset.methods.toJson = function(){
  return {
      name: this.name,
      amount: this.amount,
      balance: this.balance,
      unit: this.unit,
      description: this.description,
      logo: this.logo,
      type: this.type,
      account_addr: this.account_addr,
      create_time: this.create_time.toLocaleString(),
      asset_addr: this.asset_addr
  }
};
var Assets = mongoose.model('Asset', _Asset);

module.exports.Assets = Assets;
module.exports.ASSET_TYPE = ASSET_TYPE;
