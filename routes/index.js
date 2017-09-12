var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
  res.sendfile("./ng_app/index.html");
});

router.get('/login', function (req, res) {
  res.sendfile("./ng_app/views/login.html");
});


router.get('/register', function (req, res) {
  res.sendfile("./ng_app/views/register.html");
});

router.get('/dashboard', function (req, res) {
	res.sendfile("./ng_app/views/dashboard.html");
});

module.exports.router = router;
