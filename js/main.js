function toggleForms() {
	$("#login, #register").toggle();
	if ($("#register").is(":visible")) {
		World.alertBox({
			title: "Sorry",
			message: 'Registration does not yet actually work.',
			cancel: "OK",
		});
	} else {
		$("#initial_message").html("");
	}
}
function tile(what,x,y,z){
	World.socket.send('{"add-object":["' + what + '",' + x + ',' + y + ',' + z + ']}');
}
function setTitle(tothis) {
	window.setTimeout(function () {
		$(document).attr("title", tothis);
	}, 200);
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
		$("#login input[type=submit], a#reg_toggle").css("display", "none");
		World.loaderBox(undefined, "Logging in...", "Please wait as the server is contacted.")
		// Try logging in!
		var username = $('#username').val();
		var password = $('#password').val();
		if ((username == "") || (password == "")) {
			$("#initial_message").html("Please fill in all fields.");
			return false;
		}
		World.callbacks.login_successful = function () {
			// Save username as cookie
			World.loaderBox(true);
			setCookie('login_username', $('#username').val());
			World.current_user = $("#username").val();
			$("#login input[type=submit], a#reg_toggle").css("display", "inline");
			$('#initial').hide();
			$('#canvas, #toolbar').show();
			$(document).bind("contextmenu", function (e) {
				return false;
			});
			$('#messages').draggable({
				handle: "#messages_handle",
				stop: function () {
					if ($(this).offset().left > ($("body").width() - 50)) {
						$(this).css("left", ($("body").width() - 50) + "px");
					}
					if ($(this).offset().top > ($("body").height() - 50)) {
						$(this).css("top", ($("body").height() - 50) + "px");
					}
					if ($(this).offset().left < -350) {
						$(this).css("left", "-350px");
					}
					if ($(this).offset().top < 0) {
						$(this).css("top", "0px");
					}
				}
			}).resizable({
				handles: "se",
				resize: function () {
					$("#all_messages").css({
						height: ($("#messages").height() - 80) + "px"
					});
					var num;
					if (!$("#console_lines").is(".public, .server, .all")) {
						num = 108;
					} else {
						num = 80;
					}
					$("#console_lines").css({
						height: ($("#messages").height() - num) + "px"
					});
				},
				stop: function () {
					if ($(this).height() > $("body").height()) {
						$(this).css("height", ($("body").height() - 28) + "px");
					}
				}
			});
			$("#tempeditor").draggable({
				handle: "#tempeditor_handle",
				stop: function () {
					if ($(this).offset().left > ($("body").width() - 50)) {
						$(this).css("left", ($("body").width() - 50) + "px");
					}
					if ($(this).offset().top > ($("body").height() - 50)) {
						$(this).css("top", ($("body").height() - 50) + "px");
					}
					if ($(this).offset().left < -350) {
						$(this).css("left", "-350px");
					}
					if ($(this).offset().top < 0) {
						$(this).css("top", "0px");
					}
				}
			});
			$("#tempeditor_width").change(function () {
				$("#tempeditor_image > div > div").css({
					width: ((World.workingTemplate.by + Number($(this).val())) * 16) + "px",
					height: ((World.workingTemplate.by + Number($(this).val()) +  World.workingTemplate.bz * 2) * 8) + "px"
				});
				$("#tempeditor_width_disp").text($(this).val());
				World.workingTemplate.bx = Number($(this).val());
			});
			$("#tempeditor_length").change(function () {
				$("#tempeditor_image > div > div").css({
					width: ((World.workingTemplate.bx + Number($(this).val())) * 16) + "px",
					height: ((World.workingTemplate.bx + Number($(this).val()) +  World.workingTemplate.bz * 2) * 8) + "px"
				});
				$("#tempeditor_length_disp").text($(this).val());
				World.workingTemplate.by = Number($(this).val());
			});
			$("#tempeditor_height").change(function () {
				$("#tempeditor_image > div > div").css({
					height: ((World.workingTemplate.bx + World.workingTemplate.by + Number($(this).val()) * 2) * 8) + "px"
				});
				$("#tempeditor_height_disp").text($(this).val());
				World.workingTemplate.bz = Number($(this).val());
			});
			$("#tempeditor_x").change(function () {
				$("#tempeditor_image > div > div").css("background-position", "-" + ($(this).val() * 32) + "px -" + ($("#tempeditor_y").val() * 32) + "px");
				$("#tempeditor_x_disp").text($(this).val());
				eval("World.workingTemplate.animations" + $("#tempeditor_animation").val() + $("#tempeditor_animation_frame").val() + " = [" + Number($(this).val()) + ", " + Number($("#tempeditor_y").val()) + ", " + Number($("#tempeditor_tick").val()) + "]");
			});
			$("#tempeditor_y").change(function () {
				$("#tempeditor_image > div > div").css("background-position", "-" + ($("#tempeditor_x").val() * 32) + "px -" + ($(this).val() * 32) + "px");
				$("#tempeditor_y_disp").text($(this).val());
				eval("World.workingTemplate.animations" + $("#tempeditor_animation").val() + $("#tempeditor_animation_frame").val() + " = [" + Number($("#tempeditor_x").val()) + ", " + Number($(this).val()) + ", " + Number($("#tempeditor_tick").val()) + "]");
			});
			$("#tempeditor_tick").change(function () {
				$("#tempeditor_tick_disp").text($(this).val());
				eval("World.workingTemplate.animations" + $("#tempeditor_animation").val() + $("#tempeditor_animation_frame").val() + " = [" + Number($("#tempeditor_x").val()) + ", " + Number($("#tempeditor_y").val()) + ", " + Number($(this).val()) + "]");
			});
			$(window).focusin(function () {
				World.isFocused = true;
				World.awayMsgNum = 0;
				setTitle("MetaVerse");
			}).focusout(function () {
				World.isFocused = false;
			})
			var h = $("body").height() - 28;
			var w = $("body").width();
			World.screen_height = h;
			World.screen_width = w;
			$("#canvas").attr("width", w).attr("height", h);
			$(window).resize(function () {
				var h = $("body").height() - 28;
				var w = $("body").width();
				World.screen_height = h;
				World.screen_width = w;
				$("#canvas").attr("width", w).attr("height", h);
			});
		};
		window.onbeforeunload = function () {
			if (!World.logging_out) return "Do you want to log out of MetaVerse?";
		};
		$(document).keydown(function (e) {
			if (((e.keyCode == 38) || (e.keyCode == 40)) && ($("#console_lines, #messages").is(":visible"))) {
				$("#console_lines").focus();
			} else if ((e.keyCode != 13) && (!$("#tempeditor_resource").is(":focus"))) {
				if ($("#pmchat").is(":visible") && (!$("#chat").is(":focus"))) {
					$("#pmchat").focus();
				} else {
					$("#chat").focus();
				}
			} else if ((e.keyCode == 13) && ($(".alert").is(":visible"))) {
				$(".cancel").trigger("click");
				return false;
			}
		});
		World.callbacks.login_failed = function () {
			$("#login input[type=submit], a#reg_toggle").css("display", "inline");
			World.loaderBox(true);
			World.alertBox({
				title: "Oops!",
				message: 'There was an error logging in. Please check your username and password.',
				cancel: "OK",
				cancel_color: "#23D422"
			});
			$('#password').val('');
		};
		World.login({
			username: username,
			password: password
		});
		return false;
	});
	$('#registration-form').submit(function () {
		if (!$("#reg_agree").is(":checked")) {
			$("#initial_message").html("You must agree to the terms.");
			return false;
		}
		// Try registering!
		var username = $('#reg_username').val();
		var password = $('#reg_password').val();
		var password_confirm = $('#reg_confirm').val();
		var email = $('#reg_email').val();

		World.callbacks.registration_successful = function () {
			// Save username as cookie
			setCookie('login_username', $('#reg_username').val());
			$("#username").val($("#reg_username").val());
			$("#login, #register").toggle();
		};
		World.callbacks.registration_failed = function () {
			$("#initial_message").html("There was an error registering.");
		};
		World.register({
			username: username,
			password: password,
			confirm: password_confirm,
			email: email
		});
		return false;
	});

	// Setup chat 
	$('#chat').keypress(function (e) {
		if (e.keyCode == 13) {
			try {
				var string = $("#chat").val();
				if (string.substring(0, 4) == "/pm ") {
					string = string.replace("/pm ", "");
					var messagestr = string.split(" ");
					var user = messagestr[0];
					var message = string.replace(user + " ", "");
					World.sendPM(message, user);
				} else {
					World.sendChat($('#chat').val());
				}
				$('#chat').val('');
			} catch (e) {
				World.log(e);
			} finally {
				return false;
			}
		}
	});
	$('#pmchat').keypress(function (e) {
		if (e.keyCode == 13) {
			try {
				var message = $("#pmchat").val();
				var user = $("#console_lines > span:visible").attr("class").replace("pm ", "").replace(" show", "");
				World.sendPM(message, user);
				$('#pmchat').val('');
			} catch (e) {
				World.log(e);
			} finally {
				return false;
			}
		}
	});
});