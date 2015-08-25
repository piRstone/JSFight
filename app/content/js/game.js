var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

// use player to create, control and draw a fighting stickman
function player() {

    var jumping = false;
    var punching = false;
    var punchleft = true;
    var kicking = false;
    var crouched = false;
    var crouching = false;
    var blocking = false;
    var reverse = false;
    var play = true;
    var specialInUse = false;
    var specialPosition;
    var specialCoolDown = false;

    var baseX;
    var baseY;
    
    var headX;
    var headY;
    
    var neckUpX;
    var neckUpY;
    
    var neckDownX;
    var neckDownY;
    
    var pivotX;
    var pivotY;
    
    var elbowfX;
    var elbowfY;
    
    var elbowsX;
    var elbowsY;
    
    var handfX;
    var handfY;
    
    var handsX;
    var handsY;
    
    var kneefX;
    var kneefY;
    
    var kneesX;
    var kneesY;
    
    var footfX;
    var footfY;
    
    var footsX;
    var footsY;
    
    this.create = function(X, Y, reversed, played){
        reverse = reversed;
        play = played;
        baseX = X;
        baseY = Y;
        
        pivotX = 45;
        pivotY = 120;
        
        neckDownX = 70;
        neckDownY = 50;
        
        neckUpX = 75;
        neckUpY = 40;
        
        headX = 85;
        headY = 22;
        
        elbowfX = 80;
        elbowfY = 80;
        
        handfX = 115;
        handfY = 50;
        
        elbowsX = 70;
        elbowsY = 100;
        
        handsX = 105;
        handsY = 95;
        
        kneefX = 20;
        kneefY = 170;
        
        kneesX = pivotX - Math.cos(250 * Math.PI / 90)*50;
        kneesY = pivotY + Math.sin(250 * Math.PI / 90)*50;
        
        footsX = kneesX - Math.cos(215 * Math.PI / 90 )*50;
        footsY = kneesY + Math.sin(215 * Math.PI / 90 )*50;

        footfX = kneefX - Math.cos(220 * Math.PI / 90) * 45;
        footfY = kneesY + Math.sin(220 * Math.PI / 90) * 45;

        if(play)
            socket.emit("position", baseX);
    }


    this.show = function(){
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'grey';

        if(reverse){

            ctx.beginPath();
            ctx.arc(baseX - headX, baseY + headY, 20, 0, 360);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX - neckUpX, baseY + neckUpY);
            ctx.lineTo(baseX - neckDownX, baseY + neckDownY);
            ctx.lineTo(baseX - pivotX, baseY + pivotY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX - neckDownX, baseY + neckDownY);
            ctx.lineTo(baseX - elbowfX, baseY + elbowfY);
            ctx.lineTo(baseX - handfX, baseY + handfY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX - neckDownX, baseY + neckDownY);
            ctx.lineTo(baseX - elbowsX, baseY + elbowsY);
            ctx.lineTo(baseX - handsX, baseY + handsY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX - pivotX, baseY + pivotY);
            ctx.lineTo(baseX - kneefX, baseY + kneefY);
            ctx.lineTo(baseX - footfX, baseY + footfY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX - pivotX, baseY + pivotY);
            ctx.lineTo(baseX - kneesX, baseY + kneesY);
            ctx.lineTo(baseX - footsX, baseY + footsY);
            ctx.stroke();

            if(specialInUse){
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(specialPosition, 400, 30, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }
        else
        {
            
            ctx.beginPath();
            ctx.arc(baseX + headX, baseY + headY, 20, 0, 360);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX + neckUpX, baseY + neckUpY);
            ctx.lineTo(baseX + neckDownX, baseY + neckDownY);
            ctx.lineTo(baseX + pivotX, baseY + pivotY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX + neckDownX, baseY + neckDownY);
            ctx.lineTo(baseX + elbowfX, baseY + elbowfY);
            ctx.lineTo(baseX + handfX, baseY + handfY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX + neckDownX, baseY + neckDownY);
            ctx.lineTo(baseX + elbowsX, baseY + elbowsY);
            ctx.lineTo(baseX + handsX, baseY + handsY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX + pivotX, baseY + pivotY);
            ctx.lineTo(baseX + kneefX, baseY + kneefY);
            ctx.lineTo(baseX + footfX, baseY + footfY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(baseX + pivotX, baseY + pivotY);
            ctx.lineTo(baseX + kneesX, baseY + kneesY);
            ctx.lineTo(baseX + footsX, baseY + footsY);
            ctx.stroke();

            if(specialInUse){
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(specialPosition, 400, 30, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }
        
    }
    
    this.special = function(){
        if(!blocking && !kicking && !jumping && !specialCoolDown){

            if(play)
                socket.emit("hit", "special");
            specialInUse = true;
            specialCoolDown = true;
            specialPosition = baseX + 100;
            for(var i = 0; i < 30; i ++){
                setTimeout(function(){
                    if(reverse)
                        specialPosition -= 20;
                    else
                        specialPosition += 20;
                }, i * 10);
            }
            setTimeout(function(){
                specialInUse = false;
            }, 300);
            setTimeout(function(){
                specialCoolDown = false;
            }, 20000);
        }
    }

    this.block = function(){
        if(!blocking){
            if(play)
                socket.emit("block", "true");
            blocking = true;
            var evolv = true;
            for(var i = 0; i < 50; i++){
                setTimeout(function(){
                    elbowsY--;
                    elbowsX++;

                    elbowfY--;
                    elbowfX++;
                    if(evolv)
                        handsX++;
                    handsY--;

                    if(evolv)
                        handfX++;
                    handfY--;
                    evolv = !evolv;
                }, i * 2);
            }
        }
    }

    this.unblock = function(){
        if(blocking){
            if(play)
                socket.emit("block", "false");
            var evolv = true;
            for(var i = 0; i < 50; i++){
                setTimeout(function(){
                    elbowsY++;
                    elbowsX--;

                    elbowfY++;
                    elbowfX--;

                    if(evolv)
                        handsX--;
                    handsY++;

                    if(evolv)
                        handfX--;
                    handfY++;
                    evolv = !evolv;
                }, i * 2);
            }
                blocking = false;
        }
    }

    this.kick = function(){
        if(!kicking){
            kicking = true;
            var footsYBase = footsY;
            var footsXBase = footsX;
            var j = 0;
            for (var i = 0; i < 50; i ++) {
                setTimeout(function(){
                    j++;
                    kneesX = pivotX - Math.cos((j/2 + 250) * Math.PI / 90)*50;
                    kneesY = pivotY + Math.sin((j/2 + 250) * Math.PI / 90)*50;

                    footsX = kneesX - Math.cos((j + 215) * Math.PI / 90 )*50;
                    footsY = kneesY + Math.sin((j + 215) * Math.PI / 90 )*50;
                }, i * 3);
            }
            if(play)
                socket.emit("hit", "kick");

            for (var i = 0; i < 50; i ++) {
                setTimeout(function(){
                    j--;
                    kneesX = pivotX - Math.cos((j/2 + 250) * Math.PI / 90)*50;
                    kneesY = pivotY + Math.sin((j/2 + 250) * Math.PI / 90)*50;

                    footsX = kneesX - Math.cos((j + 215) * Math.PI / 90 )*50;
            
                    footsY = kneesY + Math.sin((j + 215) * Math.PI / 90 )*50;
                }, i * 3 + 150);
            }
            
            setTimeout(function(){
                kicking = false;
            }, 1000);
        }
    }

    this.crouch = function(){
        if(!crouched && !jumping){
            if(play)
                socket.emit("crouch", "true");
            crouching = true;
            crouched = true;
            for(var i = 0; i < 50; i++){
                setTimeout(function(){
                    baseY ++;
                    baseX ++;
                    pivotY --;
                    pivotX --;

                    kneesY--;
                    kneesX--;

                    kneefY--;
                    kneefX--;

                    footsY--;
                    footsX--;

                    footfY--;
                    footfX--;

                }, 2 * i);
            }
        }
    }

    this.uncrouch = function(){
        if(crouched){
            if(play)
                socket.emit("crouch", "false");
            crouched = false;
            for(var i = 0; i < 50; i++){
                setTimeout(function(){
                    baseY --;
                    baseX --;
                    pivotY ++;
                    pivotX ++;

                    kneesY++;
                    kneesX++;

                    kneefY++;
                    kneefX++;

                    footsY++;
                    footsX++;

                    footfY++;
                    footfX++;
                }, 2 * i);
            }
            setTimeout(function(){
                crouching = false;
            }, 250);
        }
    }

    this.punch = function(){
        if(!punching && !blocking){
            punching = true;
            if(punchleft){
                punchleft = false;
                for (var i = 0; i < 50; i ++) {
                    setTimeout(function(){
                        elbowsY --;
                        elbowsX ++;
                        handsY --;
                        handsX ++;
                    }, i * 3);
                }

                if(play)
                    socket.emit("hit", "punch");

                for (var i = 0; i < 50; i ++) {
                    setTimeout(function(){
                        elbowsY ++;
                        elbowsX --;
                        handsY ++;
                        handsX --;
                    }, i * 3 + 150);
                }
                setTimeout(function(){
                    punching = false;
                }, 300);
            }
            else{
                punchleft = true;
                var evolv = true;
                for (var i = 0; i < 50; i ++) {
                    setTimeout(function(){
                        elbowfY --;
                        elbowfX ++;
                        handfX ++;
                        if(evolv){
                            handfY --;
                            evolv = false;
                        }
                        else
                            evolv = true;
                    }, i * 3);
                }

                if(play)
                    socket.emit("hit", "punch");

                handfYBase = handfY;
                for (var i = 0; i < 50; i ++) {
                    setTimeout(function(){
                        elbowfY ++;
                        elbowfX --;
                        handfX --;
                        if(evolv){
                            handfY ++;
                            evolv = false;
                        }
                        else
                            evolv = true;
                    }, i * 3 + 150);
                }
                setTimeout(function(){
                    punching = false;
                }, 750);
            }
        }
    }

    this.moveLeft = function(dist, speed){
        
        for(var i = 0; i <= dist; i++){
            setTimeout(function(){
                if(baseX > 0  && (p2.getPosition() - p1.getPosition() >= 250 || baseX == p1.getPosition()))
                    baseX--;
                if(play)
                    socket.emit("position", baseX);
            }, i*speed);
        }
    }
    
    this.moveRight = function(dist, speed){
        
        for(var i = 0; i <= dist; i++){
            setTimeout(function(){
                if(baseX < 700 && (p2.getPosition() - p1.getPosition() >= 250 || baseX == p2.getPosition()))
                    baseX++;
                if(play)
                    socket.emit("position", baseX);
            }, i*speed);
        }
    }
    
    this.setPosition = function(X){
        baseX = X;
    }
    this.getPosition = function(){
        return baseX;
    }

    this.jump = function(){
        if(!jumping && !crouching){
            if(play)
                socket.emit("jump", "");
            jumping = true;
            var j = 0;
            var baseYBase = baseY;
            for(var i = 0; i < 20; i++){
                setTimeout(function(){
                    j++;
                    baseY = baseYBase - 100 * (Math.sqrt(j) / Math.sqrt(20));

                    footsX = kneesX - Math.cos((215 - j) * Math.PI / 90 )*50;
                    footsY = kneesY + Math.sin((215 - j) * Math.PI / 90 )*50;

                    footfX = kneefX - Math.cos((220 + j) * Math.PI / 90) * 45;
                    footfY = kneesY + Math.sin((220 + j) * Math.PI / 90) * 45;
                }, i*16);
            }
            

            for(var i = 0; i <= 20; i++){
                setTimeout(function(){
                    baseY = baseYBase - 100 * (Math.sqrt(j) / Math.sqrt(20));

                    footsX = kneesX - Math.cos((215 - j) * Math.PI / 90 )*50;
                    footsY = kneesY + Math.sin((215 - j) * Math.PI / 90 )*50;

                    footfX = kneefX - Math.cos((220 + j) * Math.PI / 90) * 45;
                    footfY = kneesY + Math.sin((220 + j) * Math.PI / 90) * 45;

                    j--;
                }, i*16 + 360);
            }


            setTimeout(function(){
                jumping = false;
            }, 1000);
        }
    }
}

// use hud to control and draw the head up display for the game
function hud(){
    var hp1 = 100;
    var hp2 = 100;
    var time;
    var printText = false;
    var textToPrint;
    var textSize;
    var textFillColor;
    var textStrokeColor;
    var textPosition;
    var gameEnd = false;

    this.create = function(duration){
        hp1 = 100;
        hp2 = 100;
        time = duration;
    }

    this.getHp1 = function(){
        return hp1;
    }
    this.getHp2 = function(){
        return hp2;
    }

    this.setHp1 = function(hp){
        hp1 = hp;
    }
    this.setHp2 = function(hp){
        hp2 = hp;
    }

    this.go = function(){
        printText = true;
        var j = 0;
        textPosition = 200;
        for(var i = 0; i < 100; i ++){
            setTimeout(function(){
                j ++;
                textToPrint = "3";
                textSize = j * 3 + 10;
                textFillColor = "red";
            }, i * 10);
        }

        for(var i = 0; i < 100; i ++){
            setTimeout(function(){
                j ++;
                textToPrint = "2";
                textSize = j * 3 + 10;
                textFillColor = "yellow";
            }, i * 10 + 1000);
        }

        for(var i = 0; i < 100; i ++){
            setTimeout(function(){
                j ++;
                textToPrint = "1";
                textSize = j * 3 + 10;
                textFillColor = "green";
            }, i * 10 + 2000);
        }

        for(var i = 0; i < 100; i ++){
            setTimeout(function(){
                j ++;
                textToPrint = "GO !";
                textSize = j * 3 + 10;
                textFillColor = "red";
            }, i * 10 + 3000);
        }

        setTimeout(function(){
            textSize = 64;
            textPosition = 60;
        }, 4000);

        for(var i = 0; i < time; i ++){
            setTimeout(function(){
                time --;
                if(!gameEnd)
                    textToPrint = time;
            }, 4000 + i * 1000);
        }

        setTimeout(function(){
			if(!gameEnd)
			{
				socket.emit("timerend", null);
				endGame();
			}
        }, (4 + time) * 1000);
        
        setTimeout(function(){
            j = 0;
        }, 1000);
        setTimeout(function(){
            j = 0;
        }, 2000);
        setTimeout(function(){
            j = 0;
        }, 3000);
    }

    this.win = function(){
        gameEnd = true;
        var j = 0;
        textSize = 16;
        textPosition = 200;
        textFillColor = "green";
        textToPrint = "YOU WIN !";
        for(var i = 0; i < 100; i ++){
            setTimeout(function(){
                j ++;
                textSize = 16 + j;
            }, i * 10);
        }
    }

    this.draw = function(){
        gameEnd = true;
        var j = 0;
        textSize = 16;
        textPosition = 200;
        textFillColor = "yellow";
        textToPrint = "DRAW...";
        for(var i = 0; i < 100; i ++){
            setTimeout(function(){
                j ++;
                textSize = 16 + j;
            }, i * 10);
        }
    }

    this.loose = function(){
        gameEnd = true;
        var j = 0;
        textSize = 16;
        textPosition = 200;
        textFillColor = "red";
        textToPrint = "you loose...";
        for(var i = 0; i < 100; i ++){
            setTimeout(function(){
                j ++;
                textSize = 16 + j;
            }, i * 10);
        }
    }

    this.show = function(){
        if(printText)
        {
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = 2;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 15;
            ctx.shadowBlur = 25;
            ctx.shadowColor = 'grey';
            ctx.fillStyle = textFillColor;
            ctx.strokeStyle = textStrokeColor;
            ctx.font = textSize + "px Arial";
            ctx.textAlign = "center";
            ctx.fillText(textToPrint, 400, textPosition);
            ctx.strokeText(textToPrint, 400, textPosition);
        }

        ctx.lineWidth = 0;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0)";

        ctx.fillStyle = "rgba(" + (255 - hp1 * 2) + ", " + (hp1 * 2) + ", 0, 1)";
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(5, 20);
        ctx.lineTo(5 + 3 * hp1, 20);
        ctx.lineTo(10 + 3 * hp1, 10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(" + (255 - hp2 * 2) + ", " + (hp2 * 2) + ", 0, 1)";
        ctx.beginPath();
        ctx.moveTo(790, 10);
        ctx.lineTo(795, 20);
        ctx.lineTo(795 - 3 * hp2, 20);
        ctx.lineTo(790 - 3 * hp2, 10);
        ctx.closePath();
        ctx.fill();


        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'grey';

        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(5, 20);
        ctx.lineTo(305, 20);
        ctx.lineTo(310, 10);
        ctx.lineTo(10, 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(790, 10);
        ctx.lineTo(795, 20);
        ctx.lineTo(495, 20);
        ctx.lineTo(490, 10);
        ctx.lineTo(790, 10);
        ctx.stroke();
    }
}

// the 2 players
var p1;
var p2;

var gameInterface;


var intervalId;

var you = true;

var jumpS = true;

var render = false;

setInterval(function(){
    if(render)
        printall();
}, 16);
// function to start the game
function startGame(position){
    render = true;

    p1 = new player();
    p2 = new player();

    gameInterface = new hud();

    gameInterface.create(240);
    gameInterface.go();

    if(position == "P1"){
        you = true;
        p1.create(100, 350, false, true);
        p2.create(500, 350, true, false);
    }
    else{
        you = false;
        p1.create(100, 350, false, false);
        p2.create(500, 350, true, true);
    }
    setTimeout(function(){
        if(position == "P1"){

            // main loop, for drawing and control your stickman
            intervalId = setInterval(function(){
                if(map[83])
                    p1.punch();

                if(map[67] || map[40])
                    p1.crouch();
                else
                    p1.uncrouch();

                if(map[70])
                    p1.block();
                else
                    p1.unblock();

                if(map[68] && !map[67] && !map[40])
                    p1.kick();

                if(map[71])
                    p1.special();

                if(map[37] && !map[83] && !map[67] && !map[68] && !map[40])
                    p1.moveLeft(10, 50);
                
                if(map[39] && !map[83] && !map[67] && !map[68] && !map[40])
                    p1.moveRight(10, 50);
                
                if(map[32] || map[38]){
                    p1.jump();
                    jumpS = false
                }
                else
                    jumpS = true;
            }, 16);
        }
        else{

            // main loop, for drawing and control your stickman
            intervalId = setInterval(function(){
                if(map[83])
                    p2.punch();

                if(map[67] || map[40])
                    p2.crouch();
                else
                    p2.uncrouch();

                if(map[70])
                    p2.block();
                else
                    p2.unblock();

                if(map[68] && !map[67] && !map[40])
                    p2.kick();

                if(map[71])
                    p2.special();

                if(map[37] && !map[83] && !map[67] && !map[68] && !map[40])
                    p2.moveLeft(10, 50);
                
                if(map[39] && !map[83] && !map[67] && !map[68] && !map[40])
                    p2.moveRight(10, 50);
                
                if(map[32] || map[38]){
                    p2.jump();
                    jumpS = false
                }
                else
                    jumpS = true;
            }, 16);
        }
    }, 3000);
}

function endGame(){
    setTimeout(function(){
        render = false;
    }, 2000);
    
    clearInterval(intervalId);
}

// listen from the server for second player actions
socket.on("position", function(X){
    if(you)
        p2.setPosition(X);
    else
        p1.setPosition(X);
});

socket.on("hit", function(type){
    switch(type){
        case "punch":
            if(you){
                p2.punch();
            }
            else{
                p1.punch();
            }
        break;

        case "kick":
            if(you){
                p2.kick();
            }
            else{
                p1.kick();
            }
        break;

        case "special":
        if(you)
            p2.special();
        else
            p1.special();
        break;
    }
});

socket.on("jump", function(){
    if(you)
        p2.jump();
    else
        p1.jump();
});

socket.on("block", function(state){
    if(state == "true"){
        if(you)
            p2.block();
        else
            p1.block();
    }
    else{
        if(you)
            p2.unblock();
        else
            p1.unblock();
    }
});

socket.on("crouch", function(state){
    if(state == "true"){
        if(you)
            p2.crouch();
        else
            p1.crouch();
    }
    else{
        if(you)
            p2.uncrouch();
        else
            p1.uncrouch();
    }
});

socket.on("life", function(hp){
    if(you){
        p1.moveLeft(10, 1);
        gameInterface.setHp1(hp);
    }
    else{
        p2.moveRight(10, 1);
        gameInterface.setHp2(hp);
    }
});

socket.on("oponnentlife", function(hp){
    if(you){
        p2.moveRight(10, 1);
        gameInterface.setHp2(hp);
    }
    else{
        p1.moveLeft(10, 1);
        gameInterface.setHp1(hp);
    }
});

socket.on("gameend", function(state){
    console.log(state);
    if(state == "You win !"){
        gameInterface.win();
    }
    else if(state == "Draw !"){
        gameInterface.draw();
    }
    else{
        gameInterface.loose();
    }
    endGame();
});
// end of listening definitions


canvas.tabIndex = 1000;

// map all keys pressed into an array
var map = [];
canvas.onkeydown = canvas.onkeyup = function(e){
    e = e || event;

    map[e.keyCode] = e.type == 'keydown';
}


// function to erase the canvas and draw all element
function printall(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    p1.show();
    p2.show();
    gameInterface.show();
}
