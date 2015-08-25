var User = require('../models/Users.js');
var passwordHash = require('password-hash');
var session = require('express-session');
var sess;
var getUsers = function (req, res){
	User.find().select('username win loses games').sort({win: -1}).exec(function (err, Users) {
	Users.sort(sortArrayByPts);
	if (err) return next(err);
	res.json(Users);
	});
}

var setUser = function (req, res, next){
	var Usr = req.body;
	var SE = /\S+/;
	if(Usr.username != undefined && Usr.password != undefined && Usr.confirmPasswd != undefined)
	{
		if((SE.exec(Usr.username)) !== null && (SE.exec(Usr.password)) !== null )
		{
			if(Usr.password != Usr.confirmPasswd)
			{
				req.session.error = 'Error. The two passwords didn\'t match.';
				res.redirect('/')
			}
			else
			{
				var HashedPassword = passwordHash.generate(req.body.password);
				Usr.password = HashedPassword;
				Usr.win = 0;
				Usr.loses = 0;
				Usr.games = 0;
				User.create(Usr, function (err, post) {
					if (err) 
					{
						req.session.error = 'Error. This username is already used';
						res.redirect('/')
					}
					else
					{
						req.session.username = Usr.username;
						res.redirect('/game'); 
					}
				});
			}
		}
		else res.redirect('/')
	}
	else res.redirect('/')

}

var getUserById = function (req,res){
	User.findById(req.params.id, function (err, post) {
		if (err) return next(err);
		res.json(post);
	});
}

var delUser = function (res,req){
	User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
		if (err) return next(err);
		res.json(post);
	});
}

var connect = function (req, res){
	User.findOne({ 'username':req.body.username},function (err, User) {
		if(User == undefined) 
		{
			req.session.error = 'Connection error. This username doesn\'t exists.';
			res.redirect('/');
		}
		else if(!passwordHash.verify(req.body.password, User.password)) 
		{
			req.session.error = 'Connection error. Please check your username and password.';
			res.redirect('/')
		}
		else
		{
			req.session.username = req.body.username;
			res.redirect('/game'); 
		}
	});
}

var disconnect = function (req,res){
	if(req.session.username != undefined)
	{
		req.session.username = undefined;
		req.session.success = 'You have been disconnected with succes.';
		res.redirect('/');
	}
	else
	{
		req.session.error = 'You are already disconnected...';
		res.redirect('/');
	}
}

exports.getUsers = getUsers;
exports.setUser = setUser;
exports.getUserById = getUserById;
exports.delUser = delUser;
exports.connect = connect;
exports.disconnect = disconnect;

function sortArrayByPts(a, b)
{
	if(a.games == 0) return 1;
	else if(b.games == 0) return -1;
	else return (((b.games+b.win-b.loses) - (a.games+a.win-a.loses)));
}