<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>MetaVerse</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
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
	<script type="text/javascript" src="js/swfobject.js"></script>
	<script type="text/javascript" src="js/web_socket.js"></script>
	<script type="text/javascript">WEB_SOCKET_SWF_LOCATION="WebSocketMain.swf"</script>
</head>
<body>
	<div id="loaderbox">
	    <strong id="boxtitle">Logging In...</strong><br /><br />
    	<div id="loaderprogress"><div id="loaderbar"></div></div><br />
    	<span id="subtext">Please wait as the server is contacted.</span>
	</div>
	<div id="initial">
		<img src="images/logo.gif" alt="MetaVerse" id="logo" /><br />
		<span id="initial_message"></span><br />
		<div id="login">
			<form action="#" id="login-form">
				<input type="text" id="username" placeholder="Username" <? if (isset($_COOKIE['login_username'])){
																			   echo " value='".$_COOKIE['login_username']."'";
																		   } ?> /><br /><br />
				<input type="password" id="password" placeholder="Password" /><br /><br />
				<input type="submit" value="Login" id="login_button" /><br /><br />
				<!--<a href="#" id="reg_toggle" onclick="toggleForms()">Register</a>-->
			</form>
		</div>
		<!--<div id="register">
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
		</div>-->
	</div>
	<div id="viewport">
		<canvas id="canvas">Your browser does not support the HTML5 canvas element</canvas>
		<div id="toolbar">
			<div id="messages_button" onclick="World.showMessageWindow()"></div>
			<div id="tempeditor_button" onclick="World.showTemplateWindow()"></div>
			<input type="text" id="chat" placeholder="Type a message..." tabindex="1" autocomplete="off" />
			<div id="logout_button" onclick="World.logout()"></div>
		</div>
	</div>
	<div id="messages">
		<img src="images/messages_banner.png" id="messages_handle" alt="Messenger" />
		<div id="messages_control">
			<span class="msg_control_selected" id="alltab" onclick="World.switchMessagesTab('all')">All</span>
			<span id="publictab" onclick="World.switchMessagesTab('public')">Public</span>
			<span id="servertab" onclick="World.switchMessagesTab('server')">Server</span>
        </div>
        <div id="all_messages">
        	<div class="all" tabindex="2" id="console_lines"></div>
        	<input type="text" id="pmchat" placeholder="Type a message..." autocomplete="off" />
        </div>
	</div>
	<div id="tempeditor">
		<img src="images/tempeditor_banner.png" id="tempeditor_handle" alt="Template Editor" />
        <div id="tempeditor_content">
        	<select id="template_selector" onchange="World.enumerateTempEditor()">
        		<option disabled>Templates</option>
        	</select>
        	<input type="button" onclick="World.readTemplates()" value="Reload Templates" />
        	<input type="button" onclick="World.saveTemplate()" value="Save" /><br /><br />
        	Resource: <input type="text" id="tempeditor_resource" onkeyup="World.workingTemplate.resource=$(this).val()" /><br />
        	Solid: <input type="checkbox" id="tempeditor_solid" onchange="World.workingTemplate.solid=$(this).is(':checked')" /><br />
        	Width: <input type="range" min="1" max="10" value="1" step="1" id="tempeditor_width" /> <span id="tempeditor_width_disp">1</span><br />
        	Length: <input type="range" min="1" max="10" value="1" step="1" id="tempeditor_length" /> <span id="tempeditor_length_disp">1</span><br />
        	Height: <input type="range" min="1" max="10" value="1" step="1" id="tempeditor_height" /> <span id="tempeditor_height_disp">1</span><br /><br />
        	<strong>Sprite Position:</strong><br />
        	Animation: <select id="tempeditor_animation" onchange="World.enumerateTempEditorAnim()"></select> <input type="button" value="+" onclick="World.addAnimation()" /> <input type="button" value="-" onclick="World.removeAnimation()" /><br />
        	Frame: <select id="tempeditor_animation_frame" onchange="World.enumerateTempEditorAnimFrame()"></select> <input type="button" value="+" onclick="World.addAnimFrame()" /> <input type="button" value="-" onclick="World.removeAnimFrame()" /><br />
        	X: <input type="range" min="0" max="10" value="0" step="1" id="tempeditor_x" /> <span id="tempeditor_x_disp">0</span><br />
        	Y: <input type="range" min="0" max="10" value="0" step="1" id="tempeditor_y" /> <span id="tempeditor_y_disp">0</span><br />
        	Tick: <input type="range" min="1" max="10" value="0" step="1" id="tempeditor_tick" /> <span id="tempeditor_tick_disp">1</span><br />
        	Play <span id="tempeditor_animname"></span> animation: <input type="checkbox" id="tempeditor_playanim" onchange="World.playAnimation()" />
        	<div id="tempeditor_image"><div><div></div></div></div>
        </div>
	</div>
</body>
</html>
