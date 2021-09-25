const dao = require('../dao/dao')();

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.send('ok!');
});

module.exports = router;
