var socket = io.connect();

//Envoi le message à l'appui d'enter			
function touche(event) {
	var touche = event.keyCode;
	if(touche == 13) {
		sendMsg();
	}
}

function sendMsg(){
	var m = document.getElementById("m");
	socket.emit('chat message', m.value);
	var SE = /\S+/;
	if(SE.exec(m.value) !== null) {  //Si le champ est différent d'un espace ou vide
		var li = document.createElement("li");
		li.className = "me";
		var msg = "<b>Me</b> : " + m.value;
		li.innerHTML = msg;
		document.getElementById("messages").appendChild(li);

		//Scroll du chat toujours en bas
		var chatWindow = document.getElementById("messagesBox");
		chatWindow.scrollTop = chatWindow.scrollHeight;
	}
	m.value='';
	return false;
};

//Reception et affichage des messages
socket.on('chat message', function(JSONmsg){
	var msgArray = JSON.parse(JSONmsg);
	var li = document.createElement("li");
	var msg = "<b>" + msgArray['username'] + "</b> : " + msgArray['message'];
	li.innerHTML = msg;
	document.getElementById("messages").appendChild(li);

	//Scroll du chat toujours en bas
	var chatWindow = document.getElementById("messagesBox");
	chatWindow.scrollTop = chatWindow.scrollHeight;
});

//Affichage des utilisateur connectés
socket.on('connected users', function(user){
	var userArray = JSON.parse(user);
	function connectedUsers(element, index, userArray) {
		var li = document.createElement("li");
		li.className = "coUsr";
		li.id = userArray[index];
		li.onclick=function(){socket.emit('usrContact', userArray[index])};
		var usr = "<div class='state on'></div> <p class='coUsrName'>" + userArray[index] + "</p>";
		li.innerHTML = usr;
		document.getElementById("coUsers").appendChild(li);
	}
	document.getElementById("coUsers").innerHTML = "";
	userArray.forEach(connectedUsers);
});

var getJSON = function(url, successHandler, errorHandler) {
  	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.responseType = 'json';
	xhr.onload = function() {
		var status = xhr.status;
		if (status == 200) {
			successHandler && successHandler(xhr.response);
		} else {
			errorHandler && errorHandler(status);
		}
	};
	xhr.send();
};

getJSON('/users',function(user) {
	//Affichage du classement du user courant
	var count = 1;
	var tr = document.createElement("tr");
	var usr = "<td>1</td><td>" + user[0].username + "</td><td>" + user[0].win + "</td><td>" + user[0].loses + "</td><td>" + user[0].games + "</td>";
	tr.innerHTML = usr;
	document.getElementById("myRank").appendChild(tr);

	//Affichage du classement général
	function classement(element, index, user){
		var tr = document.createElement("tr");
		var usr = "<td>"+count+"</td><td>" + user[index].username + "</td><td>" + user[index].win + "</td><td>" + user[index].loses + "</td><td>" + user[index].games + "</td>";
		tr.innerHTML = usr;
		document.getElementById("generalRank").appendChild(tr);
		count++;
	}
	user.forEach(classement);

	//Affichages de la liste des users
	function userList(element, index, user){
		var li = document.createElement("li");
		var usr = "<div class='state off'></div> <p>" + user[index].username + "</p>";
		li.innerHTML = usr;
		document.getElementById("users").appendChild(li);
	}
	user.forEach(userList);

}, function(status) { //error detection....
	console.log('getJSON function : something went wrong.');
});

// === Affichage du classement === //
var ranking = document.getElementById("ranking");
var content = document.getElementById("rankContent");

ranking.style.visibility = "hidden";
ranking.style.opacity = 0;

content.style.opacity = 0;
//Affichage du classement
function slideDown() {
	//Obtention de la valeur de la hauteur de ranking
	var rankHeight = document.defaultView.getComputedStyle(ranking,null).getPropertyValue("visibility");

	var intitalHeight = 0;
	var finalHeight = "547px";

	if(rankHeight == "hidden") {
		ranking.style.transition = "visibility .1s .1s";
		ranking.style.visibility = "visible";
		ranking.style.opacity = 1;
		ranking.style.height = finalHeight;
		content.style.opacity = 1;
	} else {
		ranking.style.transition = "visibility .1s .4s";
		ranking.style.visibility = "hidden";
		ranking.style.opacity = 0;
		ranking.style.height = intitalHeight;
		content.style.opacity = 0;
	}
};

//Affichage de la modal de demande de jeu
function openModal(user) {
	el = document.getElementById("modal");
	el.style.visibility = "visible";

	document.getElementById("player").innerHTML = user;
};

function closeModal() {
	el = document.getElementById("modal");
	el.style.visibility = "hidden";
};

//Reception de la demande de jeu
socket.on('usrContact', function(user) {
	openModal(user);
});

//Acceptation de la demande de jeu
function accept() {
	socket.emit('usrValidate', 'accept');
	closeModal();
};

//Refus de jouer
function decline() {
	socket.emit('usrValidate', 'decline');
	closeModal();
};

//Son du jeu
function play() {
	var music = document.getElementById("guile_mp3");
	var but = document.getElementById("muteSound");
	music.load();
	music.loop = true;
	music.volume = 0.1;
	music.play();
	but.style.visibility = "visible";
};

function mute() {
	var but = document.getElementById("muteSound");
	var music = document.getElementById("guile_mp3");
	if(music.muted == false) {
		but.style.background = "url('../img/sound_off.png')";
		music.muted = true;
	} else {
		but.style.background = "url('../img/sound_on.png')";
		music.muted = false;
	}
};

function quickFight() {
	socket.emit('quickBattle');
}

socket.on('gamestart', function(player) {
	var cacheJeu = document.getElementById("cacheJeu");
	cacheJeu.style.visibility = "hidden";
	play();
	startGame(player);
});