/**
 * Created by Tyrion on 2016/6/8.
 */
var express = require('express');
var Users = require('../models/Users').Users;
var authToken = require('../models/Users').authToken;
var veryfy_psw = require('../models/Users').verify_psw;
var jwt = require('jwt-simple');
var router = express.Router();

router.put('/',authToken,veryfy_psw,function(req,res){
    var new_psw = req.body.new_psw;
    if(!new_psw){
        return res.status(400).send({
            status:"failed",
            msg:"请输入新密码"
        })
    }else{
        req.user.password = new_psw;
        var token = jwt.encode({
            id: req.user.id,
            phone: req.user.phone,
            password: req.user.password,
            exp: Date.now()+1000*60*60*24*365*10 //10year
        }, "jwtTokenSecret");
        req.user.save();
        return res.send({
            status: "ok",
            msg: "密码修改成功",
            token:token
        })
    }
});

module.exports = router;