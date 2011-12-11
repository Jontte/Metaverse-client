<?
$version = "In Development";
?>
<!DOCTYPE html>
<html>
<head>
	<title>MetaVerse</title>
	<link rel="stylesheet" type="text/css" href="css/game.css?<? echo time(); ?>" />
	<script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="js/jquery-ui-1.8.16.min.js"></script>
	<script type="text/javascript" src="js/jquery.mousewheel.min.js"></script>
	<script type="text/javascript" src="js/speech_bubble.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/jsbih.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/config.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/linkedlist.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/key.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/proxy.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/proxymanager.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/util.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/game.js?<? echo time(); ?>"></script>
	<script type="text/javascript" src="js/main.js?<? echo time(); ?>"></script>
	<script type="text/javascript">
		function toggleForms(){
			$("#login, #register").toggle();
			if ($("#register").is(":visible")){
				$("#initial_message").html("Registration does not actually work yet.");
			} else {
				$("#initial_message").html("");
			}
		}
	</script>
</head>
<body>
	<div id="initial">
		<img src="images/logo.png" alt="MetaVerse" id="logo" /><br />
		<div id="version"><? echo $version; ?></div><br />
		<span id="initial_message"></span><br /><br />
		<div id="login">
			<form action="#" id="login-form">
				<input type="text" id="username" placeholder="Username" /><br /><br />
				<input type="password" id="password" placeholder="Password" /><br /><br />
				<input type="submit" value="Login" /><br /><br />
				<a href="#" onclick="toggleForms()">Register</a>
			</form>
		</div>
		<div id="register">
			<form action="#" id="registration-form">
				<table>
					<tr>
						<td>Username:&nbsp;&nbsp;&nbsp;</td><td><input type="text" id="reg_username" /></td>
					</tr>
					<tr>
						<td>Password:</td><td><input type="password" id="reg_password" /></td>
					</tr>
					<tr>
						<td>Confirm:</td><td><input type="password" id="reg_confirm" /></td>
					</tr>
					<tr>
						<td>Email:</td><td><input type="email" id="reg_email" /></td>
					</tr>
					<tr>
						<td>Agree to terms:</td><td><input type="checkbox" id="reg_agree" /></td>
					</tr>
				</table><br />
				<input type="submit" value="Submit" /><br /><br />
				<a href="#" onclick="toggleForms()">Back to Login</a>
			</form>
		</div>
	</div>
	<div id="viewport">
		<canvas id="canvas" width="800" height="572" style="display:none;">
		Your browser does not support the HTML5 canvas element</canvas>
		<div id="toolbar">
			<div id="messages_button" onclick="showHistory()"></div>
			<input type="text" id="chat" placeholder="Type a message..." autocomplete="off" />
			<div id="logout_button" onclick="World.logout()"></div>
		</div>
	</div>
	<div id="chat_history">
	<div id="history_handle">Chat History</div>
	<div id="chat_lines"></div>
	</div>
</body>
</html>
