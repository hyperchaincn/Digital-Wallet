/**
 * Created by tyrion on 16-5-26.
 */
var express = require('express');
var Users = require('../models/Users').Users;
var authToken = require('../models/Users').authToken;
var jwt = require('jwt-simple');
var request = require('request');
var router = express.Router();
var crypto = require('crypto');
var ethereumUtil = require('ethereumjs-util');
var secp256k1 = require('secp256k1');
var GETH_URL = require('../help_utils/geth_level_utils').BASE_URL;
var bcconf = require('../blockchain_lib/conf')

var options = { 
    method: 'POST',
    url: 'https://api.hyperchain.cn/v1/token/gtoken',
    formData:
    {
        client_id: bcconf.client_id,
        client_secret: bcconf.client_secret,
        phone: bcconf.phone,
        password: bcconf.password
    }
};

router.post('/user', function (req, res) {
    console.log(typeof req.body);
    var phone = req.body.phone;
    var password = req.body.password;
    console.log(req.body.phone);
    console.log(req.body.password);
    if(!(req.body.phone && req.body.password)){
        return res.status(400).send({
            "status": "failed",
            "msg": "账号和密码不为空"
        });
    }
    Users.findOne({"phone":phone},function(err, user){
        //若未查询到，user为null，避免在回调中使用user.something
        console.log(err);
        console.log("find user:"+user);
        if(err){
            return res.status(500).send({
                "status": "failed",
                "msg": "Something wrong with Server"
            });
        }
        if(user){
            return res.status(403).send({
                "status": "failed",
                "msg": "用户:"+phone+" 已被注册."
            });
        }
        var new_user = new Users({
            "phone": phone,
            "password":  password,
            "create_time": new Date
        });

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
            console.log(body['token_type'])
            var obj = JSON.parse(body)
            var accessToken = obj['access_token'];
        // newKey = getNewKey()
        request({
                url: "https://api.hyperchain.cn" + "/v1/dev/account/create" ,
                method: "GET",
                json: true,
                headers: {
                    "Accept": "Accept: text/html",
                    "Authorization": accessToken
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var privatekey;
                    do {
                        privatekey = crypto.randomBytes(32);
                    } while (!secp256k1.privateKeyVerify(privatekey));
                    var publicKey = ethereumUtil.privateToPublic(privatekey).toString('hex');
                    var address = "0x" + ethereumUtil.privateToAddress(privatekey).toString('hex');
                    console.log(body)
                    console.log(body.address)
                    address = body.address;
                    // return {
                    //     "address": address,
                    //     "privateKey" : privatekey.toString('hex'),
                    //     "publicKey" : publicKey
                    // }
                    nextStep(address,privatekey)
                } else {
                    console.log(response.statusCode);
                }
            });
        });
        function nextStep(address,privatekey) {
            new_user.account_addr = address;
            new_user.private_key = privatekey;
            new_user.save(function(err){
                if (!err){
                    console.log("4");
                    var token = jwt.encode({
                        id: new_user.id,
                        phone: new_user.phone,
                        password: new_user.password,
                        exp: Date.now()+1000*60*60*24*365*10 //10year
                    }, "jwtTokenSecret");
                    var json_user=new_user.toJson();
                    json_user.token = token;
                    return res.send({
                        "status":"ok",
                        "msg":"创建成功",
                        "data": json_user
                    });
                } else {
                    return res.status(403).send({
                        "status":"failed",
                        "msg":err
                    });
                }

            });
        }
    });
});


router.get('/user',authToken, function(req, res){
    console.log("req.body:"+req.body);
    console.log("req.header:"+req.headers);
    console.log("req.query:"+req.query);
    res.send({
        data: req.user.toJson(),
        status: "ok"
    })
});
module.exports = router;
