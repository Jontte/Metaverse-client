$(document).ready(battle());
var textCallback = null;
var creatures = ["bulbasaur"];
var opponentId;
(function ($) {
	$.fn.typewriter = function () {
		this.each(function () {
			var $ele = $(this),
				str = $ele.text(),
				progress = 0;
			$ele.text('');
			var timer = setInterval(function () {
				$ele.text(str.substring(0, progress++));
				if ((progress - 1) >= str.length) {
					clearInterval(timer);
					if (textCallback != null){
						console.log("typewriter activated textCallback");
						textCallback();
						textCallback = null;
						$(".game_info").unbind();
					}
				}
			}, 50);
		});
		return this;
	};
})(jQuery);
var callback;

function battle() {
	var audioElement = document.createElement('audio');
	audioElement.setAttribute('src', 'audio/rarewildbattle.mp3');
	audioElement.addEventListener("canplaythrough", function () {
		flash();
		audioElement.play();
		callback = function () {
			opponentId = 1;
			opponent();
			player();
			gameInfo({
				text: ("A wild " + capString(creatures[opponentId - 1]) + " has appeared!"),
				callback: function () {
					throwPokeball(1);
				}
			});
			$("body").addClass("battlefield");
			$(".battle_platform").show();
		};
	});
}
var counter = 25;

function cry(opts) {
	var audioElement = document.createElement('audio');
	audioElement.setAttribute('src', 'audio/cries/' + opts.id + ".wav");
	audioElement.addEventListener("canplaythrough", function () {
		audioElement.play();
		opts.callback();
	});

}

function flash() {
	console.log(counter);
	if ($("body").css("background-color") == "rgb(0, 0, 0)") {
		$("body").css("background-color", "white");
	} else {
		$("body").css("background-color", "black");
	}
	if (counter > 0) {
		counter--;
		setTimeout("flash()", 100);
	} else {
		callback();
	}
}

function gameInfo(opts) {
	if (opts.callAfterShown == true){
		textCallback = opts.callback;
	}
	if ($(".game_info").is("*")) {
		$(".game_info").text(opts.text).typewriter();
	} else {
		$("<div class='game_info'>" + opts.text + "</div>").appendTo("body").typewriter();
	}
	$(".game_info").unbind().click(function(){
		textCallback = null;
		opts.callback();
	});
}

function capString(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function opponent() {
	cry({
		callback: function () {
			$("<img src='images/creatures/" + creatures[opponentId - 1] + "_front.png' />").appendTo("#opponent");
		},
		id: opponentId
	});
}

function player() {
	$("<img src='images/trainer_stand.gif' class='human' />").appendTo("#player");
}

function throwPokeball(id) {
	gameInfo({
		text: capString(creatures[id - 1]) + ", go!",
		callAfterShown: true,
		callback: function () {
			$("#player > img").attr("src", "images/trainer_throw.gif").delay(500).animate({
				left: "-700px"
			}, {
				duration: 1000,
				complete: function () {
					var audioElement = document.createElement('audio');
					audioElement.setAttribute('src', 'audio/pokeball.mp3');
					audioElement.addEventListener("canplaythrough", function () {
						audioElement.play();
						$("<img src='images/creatures/" + creatures[id - 1] + "_back.png' class='creature' />").appendTo("#player");
					});
				}
			});
		}
	});
}