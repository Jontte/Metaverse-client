<?
$version = "v0.0.1";
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
</head>
<body>
	<div id="login">
		<img src="images/logo.png" alt="MetaVerse" /><br />
		<div id="version"><? echo $version; ?></div><br />
		<form action="#" id="login-form">
			<input type="text" id="username" placeholder="Username" /><br /><br />
			<input type="password" id="password" placeholder="Password" value="kissa" /><br /><br />
			<input type="submit" value="Login" />
		</form>
	</div>
	<div id="viewport">
		<canvas id="canvas" width="800" height="572" style="display:none;">
		Your browser does not support the HTML5 canvas element</canvas>
		<div id="toolbar">
			<div id="history_button" onclick="showHistory()"></div>
			<input type="text" id="chat" placeholder="Type a message..." autocomplete="off" />
		</div>
	</div>
	<div id="messagebox"></div>
</body>
</html>
