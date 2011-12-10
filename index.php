<!doctype html>
<html>
<head>
	<title>MMO</title>
	<script src="jquery-1.7.1.min.js"></script>
	<script src="jquery.mousewheel.min.js"></script>
	<script src="speech_bubble.js"></script>
	<script src="jsbih.js"></script>
	<script src="config.js"></script>
	<script src="linkedlist.js"></script>
	<script src="key.js"></script>
	<script src="proxy.js"></script>
	<script src="proxymanager.js"></script>
	<script src="util.js"></script>
	<script src="game.js"></script>
	<script src="main.js"></script>
</head>
<body>
	<canvas id="canvas" width="640" height="480" style="display:none;">
		Your browser does not support the HTML5 canvas element
	</canvas>
	<br>
	<div id="login-div">
		<form action="#" id="login-form">
		<label>Username</label>
		<input type="text" id="username" placeholder="Username"></input>
		<br>
		<label>Password</label>
		<input type="password" id="password" placeholder="password" value="kissa"></input>
		<br>
		<input type="submit">
		</form>
	</div>
	<div id="chat-div" style="display:none;">
		<form action="#" id="formi">
			Chat: 
			<input type="text" id="message" size="30"></input>
			<input id="send" type="submit" value="Send"></input>
		</form>
		<hr>
		<pre>
		<div style="border: 1px black solid; height: 200px; overflow: auto;" id="messagebox"></div>
		</pre>
	</div>
</body>
</html>
