
/**
 * Created by Tyrion on 2016/5/25.
 */
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var base64_util = require("../help_utils/base64_util");

var Schema = mongoose.Schema;
var _User = new Schema({
    phone : { type: String, required: true, unique: true },
    password : { type: String, required: true},
    account_addr : { type: String, required: true},
    private_key : {type: String, required: true},
    create_time : { type: Date, default: Date.now },
    assets:{type: Array},
    key: {type: String,required:true,default:"aVeryHardGuessString"}
});
//Password verification
_User.methods.comparePassword = function(password, cb) {
    if(password == this.password){
        return cb(true);
    }
    return cb(false);
};
_User.methods.toJson = function(){
  return {
      phone: this.phone,
      create_time: this.create_time.toLocaleString(),
      account_addr: this.account_addr
  }
};
var Users = mongoose.model('User', _User);


//A middleware to verify User token
/**
 * When use this middleware ,your code should gose like this:
 *    app.get('/something', authToken, function(req, res){
 *    // do something
 *    });
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
var authToken = function(req, res, next) {
    // code goes here
    var authSequence = req.headers['authorization'];
    if(!authSequence){
        return res.status(401).send({
            status: 'failed',
            msg: "Token is required"
        });
    }
    var segments = authSequence.split(' ');
    if (segments.length !== 2) {
        throw new Error('Not enough or too many authorization segments');
    }
    var pass_secret = base64_util.decode(segments[1]).split(":");
    if (pass_secret.length !== 2) {
        throw new Error('Not enough or too many pass_secret segments');
    }
    var token = pass_secret[0];
    if (token) {
        try {
            var decoded = jwt.decode(token, 'jwtTokenSecret');
            // handle token here
            if (decoded.exp <= Date.now()) {
                return res.status(401).send({
                    status: 'failed',
                    msg:'Access token has expired'
                });
            }
            Users.findOne({ _id: decoded.id }, function(err, user) {
                if(err){
                    return res.status(401).send({
                        status: 'failed',
                        msg: "cannot find user,mongo error."
                    });
                }
                if(!user){
                    return res.status(401).send({
                        status: 'failed',
                        msg: "cannot find user"
                    });

                }
                if(decoded.password != user.password){
                    return res.status(401).send({
                        status: 'failed',
                        msg: "token已失效,(token过期，密码修改可能导致这个问题),请重新登陆"
                    })
                }
                req.user = user;
                return next();
            });
        } catch (err) {
            console.log(err);
            return res.status(401).send({
                status: 'failed',
                msg: "cannot find user,catch error"
            });
        }
    } else {
        console.log("6");
        return res.status(401).send({
            status: 'failed',
            msg:"I need a token!"
        });
    }
};
var verify_psw = function(req,res,next){
    // console.log("==========="+req.body);
    var psw = req.body.psw;
    if(psw){
        if(!req.user){
            return res.status(401).send({
                status: "refuse",
                msg: "token错误"
            })
        }
        req.user.comparePassword(psw, function(result){
            if(result){
                return next();
            }else{
                return res.status(401).send({
                    status: "refuse",
                    msg: "请输入正确的密码"
                })
            }
        })
    }else{
        return res.status(401).send({
            status: "refuse",
            msg: "请输入密码"
        })
    }
};
module.exports.authToken = authToken;
module.exports.Users = Users;
module.exports.verify_psw = verify_psw;
