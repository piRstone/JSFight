var express = require('express');
var router = express.Router();
var UsersCtrl = require('../controllers/usersCtrl.js');

/* GET users listing */
router.get('/', function(req, res, next) {
	UsersCtrl.getUsers(req,res);
});

/* POST users add */
router.post('/register', function(req, res, next) {
	UsersCtrl.setUser(req,res,next);
});

router.delete('/:id', function(req, res, next) {
	UsersCtrl.delUser(res,req);
});

router.post('/connect', function(req, res, next) {
	UsersCtrl.connect(req,res);
});

router.get('/disconnect', function(req, res, next) {
	UsersCtrl.disconnect(req,res);
});
module.exports = router;
