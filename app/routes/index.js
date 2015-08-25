var express = require('express');
var router = express.Router();
var session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.error == undefined && req.session.success == undefined)
	{
		res.render('index.ejs', { error: '', success:'' });
	}
	else if(req.session.success == undefined)
	{
		var errormsg = req.session.error;
		req.session.error = undefined;
		res.render('index.ejs', { error: errormsg, success: '' });
	}
	else if(req.session.error == undefined)
	{
		var successmsg = req.session.success;
		req.session.success = undefined;
		res.render('index.ejs', { error:'', success: successmsg });
	}
	else
	{
		var errormsg = req.session.error;
		var successmsg = req.session.success;
		req.session.success = undefined;
		req.session.error = undefined;
		res.render('index.ejs', { error: errormsg, success: successmsg });
	}
});


router.get('/game', function(req,res,next) {
	var username;
	var sess = req.session;
	if(sess.username != undefined) 
	{
		nickname = req.session.username
		res.render('game.ejs', { username: nickname} );
	}
	else res.redirect('/');
});

module.exports = router;
