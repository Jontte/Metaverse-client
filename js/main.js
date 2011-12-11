function showHistory(){
	$('#messagebox').toggle().css({top:"50px",left:"200px"});
}
$(function () {

	// Make sure the browser supports websockets...
	if (!window.MozWebSocket && !window.WebSocket) {
		alert('Your browser does not support WebSockets.');

		return;
	}

	// Load username from cookie...
	var last_username = getCookie('login_username');
	if (last_username && last_username.length > 1) {
		$('#username').val(last_username);
		$('#password').focus();
	} else {
		$('#username').focus();
	}
	$('#login-form').submit(function () {
		// Try logging in!
		var username = $('#username').val();
		var password = $('#password').val();

		World.callbacks.login_successful = function () {
			// Save username as cookie
			setCookie('login_username', $('#username').val());
			$('#login').hide();
			$('#canvas, #toolbar').show();
			$('#messagebox').draggable({
				stop: function(){
					if ($(this).offset().left > 750){
						$(this).css("left","750px");
					}
					if ($(this).offset().top > 550){
						$(this).css("top","550px");
					}
					if ($(this).offset().left < -350){
						$(this).css("left","-350px");
					}
					if ($(this).offset().top < -150){
						$(this).css("top","-150px");
					}
				}
			});
		};
		World.callbacks.login_failed = function () {
			alert('Invalid username or password, please try again');
			$('#password').val('');
		};
		World.login({
			username: username,
			password: password
		});

		return false;
	});

	// Setup chat 
	$('#chat').keypress(function (e) {
		if (e.keyCode == 13){
			try {
				World.sendChat($('#chat').val());
				$('#chat').val('');
			} catch (e) {
				World.log(e);
			} finally {
				return false;
			}
		}
	});
});