var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./app/routes/index');
var users = require('./app/routes/users');
var User = require('./app/models/Users.js');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var usrTab = new Array();


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/JSFight', function(err) {
    if(err) {
        console.log('MongoDB connection error :', err);
    } else {
        console.log('MongoDB connection successful!');
    }
});


// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon
//app.use(favicon(__dirname + '/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app/content')));

var Session = session({ secret: 'JSFightSecret', resave: true, saveUninitialized: true });

io.use(function(socket, next) {
    Session(socket.request, socket.request.res, next);
});

app.use(Session);
  
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// socket.IO Code //
io.on('connection', function(socket){
	var isAlreadyConnected = false;
	var usr = socket.request.session.username;
	console.log(usr+' connected to socket.IO');
	
	isAlreadyConnected = usrTab.some ( function(el,index,array){
		if(el != undefined && usr != undefined)	
		{
			if(el.valueOf() == usr.valueOf()) 
			{
				return true;
			}
		}
		return false;
	});
	if(isAlreadyConnected == true || usr == undefined)
	{
		isAlreadyConnected = false;
		if(usr == undefined)
		{
			console.log(usr+ ' user got disconnected.');
			var array = { username : 'System', message : '<span style="color:#ff0000;font-weight:bold;">Hi, you went back to this page without being connected. Reconnect to be able to play.<span>'};
		}
		else
		{
			console.log(usr+ ' was already connected and got disconnected.');
			var array = { username : 'System', message : '<span style="color:#ff0000;font-weight:bold;">Hi '+usr+', Multiple game connections aren\'t supported. Close any other game pages and try again.<span>'};
		}
		var json = JSON.stringify(array);
		socket.emit('chat message', json);
		socket.disconnect();
	}
	else
	{
		usrTab.push(usr);
		io.emit('connected users',JSON.stringify(usrTab));
		socket.request.session.crouchState = false;
		socket.request.session.jumpState = false;
		socket.request.session.blockState = false;
		socket.request.session.isPlaying = false;
		socket.request.session.opdisconnect = false;
		socket.on('chat message', function(msg){
			var SE = /\S+/;
			if((SE.exec(msg)) !== null && usr != undefined) {
				console.log('Message de '+usr);
				var array = { username : usr, message : msg};
				var json = JSON.stringify(array);
				socket.broadcast.emit('chat message', json);
			}
		});
		socket.on('disconnect', function(){
			usrTab.forEach( function(el,index,array){
				if(el != undefined && usr != undefined)	
				{
					if(el.valueOf() == usr.valueOf()) 
					{
						console.log(usr+' disconnected');
						var removed = usrTab.splice(index,1);
						io.emit('connected users',JSON.stringify(usrTab));
					}
				}
			});
		});		
		socket.on('usrContact', function(sockReq){
			usrContact(sockReq);
		});
		socket.on('quickBattle',function(){
			var YourWins = 0;
			var SmallerWinsDifference = -1;
			var OpponentNick;
			var AssyncCallsLeft = 0;
			User.findOne({ 'username': usr }, function (err, findUsr) {
				if (err) {}
				else
				{
					YourWins = findUsr.win;
					Object.keys(io.engine.clients).forEach( function (el,array,index) {
						if (io.sockets.connected[el]!= undefined) {
							AssyncCallsLeft++;
							User.findOne({ 'username': io.sockets.connected[el].request.session.username }, function (err, findUsr) {
								if (err) 
								{
									AssyncCallsLeft--;
									if (AssyncCallsLeft == 0) usrContact(OpponentNick);
								}
								else
								{
									if (usr != findUsr.username)
									{
										var ptsdiff = YourWins - findUsr.win;
										if(ptsdiff < 0) ptsdiff = ptsdiff * -1;
										if(ptsdiff < SmallerWinsDifference || SmallerWinsDifference == -1) 
										{
											SmallerWinsDifference = ptsdiff;
											OpponentNick = findUsr.username;
										}
									}
									AssyncCallsLeft--;
									if (AssyncCallsLeft == 0) 
									{
										usrContact(OpponentNick);
									}
								}
							});
						}				
					});
				}
			});
		});
		socket.on('usrValidate', function(sockReq){
			var opponentid = socket.request.session.opponentsocketid;
			if(sockReq == 'decline')
			{
				if(io.sockets.connected[opponentid] != undefined)
				{
					var array = { username : 'System', message : '<span style="color:red;font-weight:bold">Sorry, but '+ usr +' rejected your request.</span>'};
					var json = JSON.stringify(array);
					io.sockets.connected[opponentid].emit('chat message', json);
				}
				var array = { username : 'System', message : '<span style="color:green;font-weight:bold">You rejected this request.</span>'};
				var json = JSON.stringify(array);
				socket.emit('chat message', json);
			}
			else if(io.sockets.connected[opponentid] == undefined)
			{
				var array = { username : 'System', message : '<span style="color:red;font-weight:bold">Sorry, but the user you tried to play with has been disconnected.</span>'};
				var json = JSON.stringify(array);
				socket.emit('chat message', json);
			}
			else if(io.sockets.connected[opponentid].request.session.opponentsocketid != socket.id)
			{
				var array = { username : 'System', message : '<span style="color:red;font-weight:bold">Sorry, but the user already requested to play with someone else.</span>'};
				var json = JSON.stringify(array);
				socket.emit('chat message', json);
			}
			else
			{
				var array = { username : 'System', message : '<span style="color:green;font-weight:bold">'+ usr +' accepted your request. Good luck ! ;)</span>'};
				var json = JSON.stringify(array);
				io.sockets.connected[opponentid].emit('chat message', json);
				var array = { username : 'System', message : '<span style="color:green;font-weight:bold">You accepted '+ io.sockets.connected[opponentid].request.session.username +' request. Good luck ! ;) </span>'};
				var json = JSON.stringify(array);
				socket.emit('chat message', json);
				io.sockets.connected[opponentid].emit('gamestart', 'P1');
				io.sockets.connected[opponentid].request.session.isPlaying = true;
				socket.emit('gamestart', 'P2');
				socket.request.session.isPlaying = true;
				socket.request.session.life=100;
				io.sockets.connected[opponentid].request.session.life=100;
			}
		});
		socket.on('position', function(position){
			var opponentid = socket.request.session.opponentsocketid;
			if(io.sockets.connected[opponentid] == undefined)
			{
				setTimeout(function(){
					socket.request.session.opdisconnect = true;
				},5);
				if(socket.request.session.opdisconnect == false)
				{
					oponnentDisconnected();
				}
				setTimeout(function(){
					socket.request.session.opdisconnect = false;
				},1000);
			}
			else
			{
				socket.request.session.position = position;
				io.sockets.connected[opponentid].emit('position',position);
			}
		});
		socket.on('hit', function(hit){
			console.log('hit');
			var opponentid = socket.request.session.opponentsocketid;
			if(io.sockets.connected[opponentid] == undefined)
			{
				oponnentDisconnected();
			}
			else
			{
				io.sockets.connected[opponentid].emit('hit',hit);
				setTimeout(function(){
					var SpaceBetween = socket.request.session.position - io.sockets.connected[opponentid].request.session.position;
					if(SpaceBetween <0) SpaceBetween = SpaceBetween * -1;
					if(hit == 'punch' && SpaceBetween<261)
					{
						if(io.sockets.connected[opponentid].request.session.blockState  == false && io.sockets.connected[opponentid].request.session.crouchState == false)
						{
							io.sockets.connected[opponentid].request.session.life = io.sockets.connected[opponentid].request.session.life -5;
							gestLife(opponentid);
						}
					}
					else if(hit == 'kick' && SpaceBetween<261)
					{
						if(io.sockets.connected[opponentid].request.session.jumpState == false)
						{
							io.sockets.connected[opponentid].request.session.life = io.sockets.connected[opponentid].request.session.life -10;
							gestLife(opponentid);
						}
					}
					else if(hit == 'special')
					{
						if(io.sockets.connected[opponentid].request.session.jumpState == false && io.sockets.connected[opponentid].request.session.crouchState == false)
						{
							io.sockets.connected[opponentid].request.session.life = io.sockets.connected[opponentid].request.session.life -20;
							gestLife(opponentid);
						}
					}
				},150);
			}
		});
		socket.on('crouch',function(crouchState){
			var opponentid = socket.request.session.opponentsocketid;
			if(io.sockets.connected[opponentid] == undefined)
			{
				oponnentDisconnected();
			}
			else
			{
				if(crouchState == 'true')
				{
					socket.request.session.crouchState = true;
					io.sockets.connected[opponentid].emit('crouch','true');
				}
				else
				{
					socket.request.session.crouchState = false;
					io.sockets.connected[opponentid].emit('crouch','false');
				}
			}
		});
		socket.on('block',function(blockState){
			var opponentid = socket.request.session.opponentsocketid;
			if(io.sockets.connected[opponentid] == undefined)
			{
				oponnentDisconnected();
			}
			else
			{
				if(blockState == 'true')
				{
					socket.request.session.blockState = true;
					io.sockets.connected[opponentid].emit('block','true');
				}
				else
				{
					socket.request.session.blockState = false;
					io.sockets.connected[opponentid].emit('block','false');
				}
			}
		});
		socket.on('jump',function(jumpState){
			var opponentid = socket.request.session.opponentsocketid;
			if(io.sockets.connected[opponentid] == undefined)
			{
				oponnentDisconnected();
			}
			else
			{
				io.sockets.connected[opponentid].emit('jump','');
				socket.request.session.jumpState = true;
				setTimeout(function(){
					socket.request.session.jumpState = false;
				},720);
			}
		});
		socket.on('timerend',function(){
			var opponentid = socket.request.session.opponentsocketid;
			if(io.sockets.connected[opponentid] == undefined)
			{
				oponnentDisconnected();
			}
			else
			{
				if(io.sockets.connected[opponentid].request.session.timerend == undefined)
				{
					socket.request.session.timerend = true;
					if(io.sockets.connected[opponentid].request.session.life > socket.request.session.life)
					{
						io.sockets.connected[opponentid].emit('gameend','You win !');
						socket.emit('gameend','You lose !');
						recBDD(io.sockets.connected[opponentid].request.session.username,socket.request.session.username);
						setTimeout(function(){
							clearVars(opponentid);
						},1000);
					}
					else if(socket.request.session.life > io.sockets.connected[opponentid].request.session.life)
					{
						io.sockets.connected[opponentid].emit('gameend','You lose !');
						socket.emit('gameend','You win !');
						recBDD(socket.request.session.username,io.sockets.connected[opponentid].request.session.username);
						setTimeout(function(){
							clearVars(opponentid);
						},1000);
					}
					else
					{
						io.sockets.connected[opponentid].emit('gameend','Draw !');
						socket.emit('gameend','Draw !');
						recBDDdraw(io.sockets.connected[opponentid].request.session.username,socket.request.session.username);
						setTimeout(function(){
							clearVars(opponentid);
						},1000);
					}
				}
			}
		});
	}
	console.log('Connected users : '+usrTab);
	
	var recBDD = function(winner,loser) {
		User.findOneAndUpdate({username: winner} , {$inc: { games : 1, win : 1}}).exec();
		User.findOneAndUpdate({username: loser} , {$inc: { games : 1, loses : 1}}).exec();
	}
	
	var recBDDdraw = function(user1,user2) {
		User.findOneAndUpdate({username: user1} , {$inc: { games : 1}}).exec();
		User.findOneAndUpdate({username: user2} , {$inc: { games : 1}}).exec();
	}
	
	var gestLife = function(opponentid)
	{
		io.sockets.connected[opponentid].emit('life',io.sockets.connected[opponentid].request.session.life);
		io.sockets.connected[opponentid].emit('oponnentlife',socket.request.session.life);
		socket.emit('life',socket.request.session.life);
		socket.emit('oponnentlife',io.sockets.connected[opponentid].request.session.life);
		if(io.sockets.connected[opponentid].request.session.life <1)
		{
			io.sockets.connected[opponentid].emit('gameend','You lose !');
			socket.emit('gameend','You win !');
			recBDD(socket.request.session.username,io.sockets.connected[opponentid].request.session.username);
			setTimeout(function(){
				clearVars(opponentid);
			},1000);
		}
		else if(socket.request.session.life <1)
		{
			io.sockets.connected[opponentid].emit('gameend','You win !');
			socket.emit('gameend','You lose !');
			recBDD(io.sockets.connected[opponentid].request.session.username,socket.request.session.username);
			setTimeout(function(){
				clearVars(opponentid);
			},1000);
		}
	}
	
	var clearVars = function(opponentid)
	{
		console.log('ClaerVars');
		if(io.sockets.connected[opponentid] != undefined)
		{
			io.sockets.connected[opponentid].request.session.life = 100;
			io.sockets.connected[opponentid].request.session.crouchState = false;
			io.sockets.connected[opponentid].request.session.jumpState = false;
			io.sockets.connected[opponentid].request.session.blockState = false;
			io.sockets.connected[opponentid].request.session.isPlaying = false;
			io.sockets.connected[opponentid].request.session.opponentsocketid = undefined;
			io.sockets.connected[opponentid].request.session.timerend = undefined;
		}
		socket.request.session.life = 100;
		socket.request.session.crouchState = false;
		socket.request.session.jumpState = false;
		socket.request.session.blockState = false;
		socket.request.session.isPlaying = false;
		socket.request.session.opponentsocketid = undefined;
		socket.request.session.timerend = undefined;
	}
	
	var oponnentDisconnected = function()
	{
		
		var array = { username : 'System', message : '<span style="color:red;font-weight:bold">Sorry, but the user you tried to play with has been disconnected.</span>'};
		var json = JSON.stringify(array);
		socket.emit('chat message', json);
		socket.emit('gameend','You win !');
	}
	
	var usrContact = function(sockReq){
		if(socket.request.session.isPlaying == true){
			var array = { username : 'System', message : '<span style="color:red;font-weight:bold;">You cannot request a game when you are already playing.</span>'};
			var json = JSON.stringify(array);
			socket.emit('chat message', json);
		}
		else
		{
			Object.keys(io.engine.clients).some( function(el,index,array){
				if (io.sockets.connected[el]!= undefined && sockReq != undefined) {
					if(io.sockets.connected[el].request.session.username == sockReq)
					{
						if(io.sockets.connected[el].request.session.username == socket.request.session.username)
						{
							var array = { username : 'System', message : '<span style="color:red;font-weight:bold;">You cannot play versus yourself.</span>'};
							var json = JSON.stringify(array);
							socket.emit('chat message', json);
							return true;
						}
						else
						{
							if(io.sockets.connected[el].request.session.isPlaying == false)
							{
								socket.request.session.opponentsocketid = el;
								io.sockets.connected[el].request.session.opponentsocketid = socket.id;							
								io.sockets.connected[el].emit('usrContact', socket.request.session.username);
								var array = { username : 'System', message : '<span style="color:green;font-weight:bold">Your game request to '+io.sockets.connected[el].request.session.username+' has been sent. The game will start if he accept.</span>'};
								var json = JSON.stringify(array);
								socket.emit('chat message', json);
								return true;
							}
							else
							{
								var array = { username : 'System', message : '<span style="color:red;font-weight:bold">Your game request to '+io.sockets.connected[el].request.session.username+' has not been sent because he is already playing.</span>'};
								var json = JSON.stringify(array);
								socket.emit('chat message', json);
							}
						}
					}
				}
				return false;
			});
		}
	}
});

///////////////////

http.listen(3000);
module.exports = app;

