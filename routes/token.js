/**
 * Created by Tyrion on 2016/5/25.
 */
var express = require('express');
var router = express.Router();
var Users = require('../models/Users').Users;
var jwt = require('jwt-simple');
var app = require('../app');

router.post('/token', function (req, res) {
    //TODO validate req.body.username and req.body.password
    //if is invalid, return 401
    console.log(req.body.phone);
    console.log(req.body.password);
    Users.findOne({"phone":req.body.phone},function(err, user){
        if(!user){
            return res.status(404).send({
                "status": "failed",
                "msg": "no such user"
            })
        }
        user.comparePassword(req.body.password,function(is_match){
            if(is_match){
                console.log('enter if');
                console.log("ready to run jwt.sign");
                var token = jwt.encode({
                    id: user.id,
                    phone: user.phone,
                    password: user.password,
                    exp: Date.now()+1000*60*60*24*365*10 //10year
                }, "jwtTokenSecret");
                res.send({ token: token });
            }else{
                console.log('enter else');
                res.status(401).send({
                    "status": "failed",
                    "msg": "Wrong password,authenticate failed"
                })
            }
        })
    });
});

module.exports = router;