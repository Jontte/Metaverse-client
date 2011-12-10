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
			$('#login-div').hide();
			$('#canvas').show();
			$('#chat-div').show();
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
	$('#chat').submit(function () {
		try {
			World.sendChat($('#message').val());
			$('#message').val('');
		} catch (e) {
			World.log(e);
		} finally {
			return false;
		}
	});
});