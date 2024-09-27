var socketIsOpen = false;
var intervalID = 0;

connectWebsocket = function() {
    // Modify this URL to point to the IP address and port where your server is running on
	websocket = new WebSocket(WEBSOCKET_URI);
	websocket.onopen = function(event) {
        document.getElementsByClassName("slider")[0].innerHTML = "<h1>Ready: Awaiting game list from WebSocket...</h1>";
        socketIsOpen = true;
        clearInterval(intervalID);
        intervalID = 0;
    };
	websocket.onclose = function(event) {
        document.getElementsByClassName("slider")[0].innerHTML = "<h1>Closed: Connection to WebSocket closed</h1>";
        socketIsOpen = false;
        if (!intervalID) {
            intervalID = setInterval(connectWebsocket, 5000);
        }
    };
	websocket.onmessage = function(event) {
        var messageObject = JSON.parse(event.data);
        window.onMessage(messageObject);
    };
	websocket.onerror = function(event) {
        document.getElementsByClassName("slider")[0].innerHTML = "<h1>Error: Unable to connect to WebSocket</h1>";
        socketIsOpen = false;
        if (!intervalID) {
            intervalID = setInterval(connectWebsocket, 5000);
        }
    };
};

window.addEventListener("load", function() { 
    if(window.location.search == "?all") {
        document.body.id = 'all';
    } 
    connectWebsocket(); 
}, false);

function onMessage(data) {
    if(data['action'] == "reset") { 
        document.getElementById("nextgame").innerHTML = "1";
        Rotate(1);
        document.getElementById("attempt").innerHTML++;

    } else if(data['action'] == "next") {
        document.getElementById("nextgame").innerHTML++
        next = +document.getElementById("nextgame").innerHTML;
        count = +document.getElementById("count").innerHTML;
        streak = +document.getElementById("streak").innerHTML

        if(next <= count)
            Rotate(next);

        if(streak < next)
            document.getElementById("streak").innerHTML = next -1;

    } else if(data['action'] == "setgames") {
        i = 1;
        document.getElementsByClassName("stats")[0].style.display = "flex"; 
        document.getElementsByClassName("slider")[0].innerHTML = "";
        count = data['games'].length;
        document.getElementById("count").innerHTML = count;
        data['games'].forEach(game => {
            game = JSON.parse(game);
            card = '<div id="game'+i+'" class="slide slide--active" data-slide="'+i+'">\
                    <img src="'+game.image+'"/>\
                    <p class="title">'+game.name+'</p>\
                    <p class="number"><sup>'+i+'</sup>&frasl;<sub>'+count+'</sub></p>\
                    </div>'
            document.getElementsByClassName("slider")[0].innerHTML += card;
            i++;
        });
        Rotate(1);
    }

    if (data.hasOwnProperty('currentgame')) {
        document.getElementById("nextgame").innerHTML = data['currentgame'];
        Rotate(data['currentgame']);
    }

    if (data.hasOwnProperty('attempts')) {
        document.getElementById("attempt").innerHTML = data['attempts'];
    }

    if (data.hasOwnProperty('streak')) {
        document.getElementById("streak").innerHTML = data['streak'];
    }
}

function Rotate(num) {
    var current = 'game' + num;
    var next = 'game' + (+num + 1);
    var prev = 'game' + (+num - 1);

    Array.from(document.querySelectorAll('.slide')).forEach(function(el) { 
        el.classList.remove('next');
        el.classList.remove('prev');
        el.classList.remove('slide--active');
    });
   
    var el = document.getElementById(current)
    el.classList.add("slide--active");
    
    if(num != 1) {
        var el = document.getElementById(prev)
        el.classList.add("prev");
    }

    if(num != +document.getElementById("count").innerHTML) {
      var el = document.getElementById(next)
      el.classList.add("next");
    }
}