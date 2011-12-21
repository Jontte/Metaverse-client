World = {
	proxymanager: null,
	socket: null,
	camera: {
		x: 0,
		y: 0,
		target: null
	},
	// current camera screen coordinates and target handle or null
	cursor: null,
	current_user: null,
	logging_out: false,
	screen_width: 800,
	screen_height: 600,
	isFocused: true,
	awayMsgNum: 0,
	sampleTemplates: [{
		id: 'guy',
		resource: 'plethora.png',
		bx: 1,
		// width
		by: 1,
		// length
		bz: 2,
		// height
		solid: false,
		animations: {
			'stand-sw': [
				[0, 2, 1]
			],
			'stand-se': [
				[4, 2, 1]
			],
			'stand-nw': [
				[4, 4, 1]
			],
			'stand-ne': [
				[0, 4, 1]
			],
			'walk-sw': [
				[1, 2, 1],
				[2, 2, 1],
				[3, 2, 1]
			],
			'walk-se': [
				[5, 2, 1],
				[6, 2, 1],
				[7, 2, 1]
			],
			'walk-nw': [
				[5, 4, 1],
				[6, 4, 1],
				[7, 4, 1]
			],
			'walk-ne': [
				[1, 4, 1],
				[2, 4, 1],
				[3, 4, 1]
			]
		}
	}],
	workingTemplate: null,

	callbacks: {
		login_successful: null,
		login_failed: null,
		register_successful: null,
		register_failed: null
	},
	preload: {
		images: {},
		completion_counter: 0,
		completion_target: 0
	},
	input_queue: [],
	// received messages are stored here until the system is properly initialized.
	login: function (opts) {
		// pass opts.username, opts.password here.
		var socktype = window.MozWebSocket || window.WebSocket;
		if (!socktype) {
			$("#initial_message").html('You browser does not support WebSockets');
			return;
		}
		var socket = new socktype(Config.socket_service);
		World.socket = socket;
		socket.onmessage = function (evt) {
			// Server sends challenge, we reply with sha1(challenge+pw+challenge)
			var json = JSON.parse(evt.data);
			if ('challenge' in json) {
				var challenge = json.challenge;
				if (challenge.length < 10) {
					if (World.callbacks.login_failed) World.callbacks.login_failed();
					return;
				}
				socket.send(JSON.stringify({
					username: opts.username,
					response: SHA1(challenge + opts.password + challenge)
				}));
			} else if ('success' in json) {
				var success = json.success;
				if (success) {
					socket.onmessage = function (evt) {
						World.input_queue.push(evt);
					};
					socket.onopen = World.onConnect;
					socket.onclose = World.onDisconnect;
					World.init();
					if (World.callbacks.login_successful) World.callbacks.login_successful();
				} else if (World.callbacks.login_failed) World.callbacks.login_failed();
			}
		};
		socket.onopen = function () {
			// 
		};
		socket.onclose = function () {
			// Premature DC?
			if (World.callbacks.login_failed) World.callbacks.login_failed();
		}
	},
	logout: function () {
		World.alertBox({
			title: "Are you sure?",
			message: "Do you really want to logout of MetaVerse?",
			cancel: "Stay",
			cancel_color: "#23D422",
			accept: "Logout",
			accept_color: "red",
			callback: function () {
				World.socket.close();
				World.logging_out = true;
				location.reload(true);
			},
		});
	},
	register: function (opts) {
		// make sure the user has entered the same password twice
		if (opts.password != opts.confirm) return;
		var socktype = window.MozWebSocket || window.WebSocket;
		if (!socktype) {
			$("#initial_message").html('You browser does not support WebSockets');
			return;
		}
		var socket = new socktype(Config.socket_service);
		World.socket = socket;
		socket.onmessage = function (evt) {
			// Server sends challenge, we reply with sha1(challenge + pw + challenge)
			var json = JSON.parse(evt.data);
			if ('challenge' in json) {
				var challenge = json.challenge;
				if (challenge.length < 10) {
					if (World.callbacks.registration_failed) World.callbacks.registration_failed();
					return;
				}
				socket.send(JSON.stringify({
					username: opts.username,
					response: SHA1(challenge + opts.password + challenge),
					email: SHA1(challenge + opts.email + challenge)
				}));
			} else if ('success' in json) {
				var success = json.success;
				if (success) {
					socket.onmessage = function (evt) {
						World.input_queue.push(evt);
					};
					if (World.callbacks.registration_successful) World.callbacks.registration_successful();
				} else if (World.callbacks.registration_failed) World.callbacks.registration_failed();
			}
		};
		socket.onopen = function () {
			// 
		};
		socket.onclose = function () {
			// Premature DC?
			if (World.callbacks.registration_failed) World.callbacks.registration_failed();
		}
	},
	showMessageWindow: function () {
		$('#messages').toggle().css({
			top: "50px",
			left: "200px"
		});
	},
	showTemplateWindow: function () {
		$('#tempeditor').toggle().css({
			top: "50px",
			left: "200px"
		});
		World.readTemplates();
	},
	switchMessagesTab: function (tab) {
		$(".msg_control_selected").removeClass("msg_control_selected");
		$("#" + tab + "tab").addClass("msg_control_selected");
		$("#console_lines > span").removeClass("show");
		if ((tab != "server") && (tab != "public") && (tab != "all")) {
			$("#console_lines").removeClass("server public all").css("height", ($("#messages").height() - 108) + "px");
			$("#console_lines > span." + tab).addClass("show");
			$("#pmchat").css("display", "block");
		} else {
			$("#console_lines").removeClass("server public all").addClass(tab).css("height", ($("#messages").height() - 80) + "px");;
			$("#pmchat").css("display", "none");
		}
	},
	alertBox: function (opts) {
		var title = opts.title;
		var message = opts.message;
		var cancel = opts.cancel;
		var cancel_color = opts.cancel_color;
		var accept = opts.accept;
		var accept_color = opts.accept_color;
		var callback = opts.callback;
		var randomid = Math.floor(Math.random() * 6);
		$("<div class='alert' id='" + randomid + "'><span class='title'>" + title + "</span>" + "<span class='message'>" + message + "</span>" + "<input type='button' class='cancel' value='" + cancel + "' onclick='$(\"div.alert#" + randomid + "\").remove()' /></div>").appendTo("#viewport");
		if (accept != undefined) $("<input type='button' class='accept' value='" + accept + "' />").click(function () {
			$("div.alert#" + randomid).remove();
			callback();
		}).appendTo("div.alert#" + randomid);
		if (cancel_color != undefined) $("div.alert#" + randomid + " > input[type=button].cancel").css("background", cancel_color);
		if (accept_color != undefined) $("div.alert#" + randomid + " > input[type=button].accept").css("background", accept_color);
	},
	init: function () {
		// Schedule image retrieval
		World.queueImage('plethora.png');
		World.startFetch();
	},
	queueImage: function (src) {
		var img = new Image();
		img.onload = function () {
			World.preload.completion_counter++;
			if (World.preload.completion_counter == World.preload.completion_target) {
				World.loadLevel();
			}
		}
		World.preload.completion_target++;
		World.preload.images[src] = img;
	},
	startFetch: function () {
		for (var key in World.preload.images) {
			if (!World.preload.images.hasOwnProperty(key)) continue;
			var value = World.preload.images[key];
			value.src = key; // launches fetch
		}
	},
	readTemplates: function () {
		var templates = World.sampleTemplates;
		$("#template_selector").html("<option disabled>Templates</option>");
		$.each(templates, function (index, item) {
			if (item.id.substring(0, 1) != "_") {
				$("#template_selector").append("<option value='" + item.id + "'>" + item.id + "</option>");
			}
		});
	},
	enumerateTempEditor: function (id) {
		//var template = World.proxymanager.templates[id];
		World.workingTemplate = World.sampleTemplates[0];
		var template = World.workingTemplate;
		World.workingTemplate = template;
		$("#tempeditor_resource").val(template.resource);
		$("#tempeditor_solid").prop("checked", template.solid);
		$("#tempeditor_width").val(template.bx);
		$("#tempeditor_length").val(template.by);
		$("#tempeditor_height").val(template.bz);
		$("#tempeditor_width_disp").text(template.bx);
		$("#tempeditor_length_disp").text(template.by);
		$("#tempeditor_height_disp").text(template.bz);
		var animations = template.animations;
		var firstAnim;
		for (var i in animations) {
			if (animations.hasOwnProperty(i) && typeof (first) !== 'function') {
				firstAnim = animations[i][0];
				break;
			}
		}
		$("#tempeditor_x").val(firstAnim[0]);
		$("#tempeditor_y").val(firstAnim[1]);
		$("#tempeditor_tick").val(firstAnim[2]);
		$("#tempeditor_x_disp").text(firstAnim[0]);
		$("#tempeditor_y_disp").text(firstAnim[1]);
		$("#tempeditor_tick_disp").text(firstAnim[2]);
		$.each(animations, function (name, item) {
			$.each(item, function (index) {
				$("#tempeditor_animation").append("<option value='[\"" + name + "\"][" + index + "]'>" + name + " " + (index + 1) + "</option>");
			});
		});
		$("#tempeditor_image > div > div").css({
			background: "url(" + template.resource + ") no-repeat",
			backgroundPosition: "-" + (firstAnim[0] * 32) + "px -" + (firstAnim[1] * 32) + "px",
			width: (template.bx * 32) + "px",
			height: (template.bz * 32) + "px"
		});
	},
	enumerateTempEditorAnim: function () {
		//var animation = eval("World.proxymanager.templates[$(\"#template_selector\").val()].animations" + $("#tempeditor_animation").val());
		var animation = eval("World.workingTemplate.animations" + $("#tempeditor_animation").val());
		$("#tempeditor_x").val(Number(animation[0]));
		$("#tempeditor_y").val(Number(animation[1]));
		$("#tempeditor_tick").val(Number(animation[2]));
		$("#tempeditor_x_disp").text(animation[0]);
		$("#tempeditor_y_disp").text(animation[1]);
		$("#tempeditor_tick_disp").text(animation[2]);
		$("#tempeditor_image > div > div").css({
			backgroundPosition: "-" + (animation[0] * 32) + "px -" + (animation[1] * 32) + "px",
		});
		var animName = $("#tempeditor_animation").val().substring(2, $("#tempeditor_animation").val().length - 5);
		$("#tempeditor_animname").text(animName);
	},
	saveTemplate: function () {
		var template = World.workingTemplate;
		alert("Here is the JSON object as a string:\n" + JSON.stringify(template) + "\n\nThe template is avaliable via World.workingTemplate");
	},
	animationInfo: {
		animation: null,
		step: 0,
		name: null,
		tickStep: 1
	},
	playAnimation: function () {
		if ($("#tempeditor_playanim").is(":checked")) {
			//World.animationInfo.animation = eval("World.proxymanager.templates[$(\"#template_selector\").val()].animations[\"" + $("#tempeditor_animname").text() + "\"]");
			World.animationInfo.animation = eval("World.workingTemplate.animations[\"" + $("#tempeditor_animname").text() + "\"]");
			World.animationInfo.name = $("#tempeditor_animname").text();
			requestAnimFrame(World.playAnimation);
			$("#tempeditor_animation").val('["' + World.animationInfo.name + '"][' + World.animationInfo.step + ']');
			World.enumerateTempEditorAnim();
			if (World.animationInfo.animation[World.animationInfo.step][2] > World.animationInfo.tickStep){
				World.animationInfo.tickStep++;
			} else if (World.animationInfo.step < (World.animationInfo.animation.length - 1)) {
				World.animationInfo.tickStep = 1;
				World.animationInfo.step++;
			} else {
				World.animationInfo.step = 0;
			}
		} else {
			World.animationInfo = {
				animation: null,
				step: 0,
				name: null,
				tickStep: 1
			};
		}
	},
	loadLevel: function () {
		// Prepare handles and values
		var w = World;
		w.canvas = document.getElementById('canvas');
		w.canvas_ctx = World.canvas.getContext('2d');
		// Create proxymanager
		var manager = new ProxyManager()
		// Add builtin templates
		var templ = manager.addTemplate(['_cursor', 'plethora.png', false, 1, 1, 0, {
			'idle': [[5, 1, 0]]
		}]);
		templ.warp_movement = true; // Force warped movement
		// Add builtin proxys
		World.cursor = manager.addProxy([0, '_cursor', 0, 0, 1]);
		// Start registering key presses
		Key.register(w.canvas);
		// Start main loop
		//	setInterval(w.processFrame, 1000/30);
		requestAnimFrame(w.processFrame, w.canvas);
		// Initialization finished
		World.proxymanager = manager;
		// TODO; potential race condition
		for (var i = 0; i < World.input_queue.length; i++) {
			World.onMessage(World.input_queue[i]);
		}
		World.socket.onmessage = World.onMessage;
	},
	processFrame: function (ms) {
		var w = World;
		var ctx = w.canvas_ctx;
		// draw background
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, w.screen_width, w.screen_height);
		// Update curosr
		w.updateCursor();
		// Update key states
		Key.timestep();
		// Update proxy positions
		w.proxymanager.smooth();
		// Rebuild render graph if needed
		w.proxymanager.rebuildGraph();
		// Get current camera position from camera target, if any
		if (w.camera.target != null) {
			var t = w.camera.target;
			var pos = World2Screen(t.smooth_x, t.smooth_y, t.smooth_z);
			w.camera.x = pos.x;
			w.camera.y = pos.y;
		}
		// Draw proxies
		ctx.save();
		var txt = 'MetaVerse';
		ctx.font = "15px Helvetica, Arial, Verdana, sans-serif";
		ctx.fillStyle = "#000";
		ctx.fillText(txt, 5, 20);
		var offx = w.camera.x;
		var offy = w.camera.y;
		ctx.translate((w.screen_width / 2) - offx, (w.screen_height / 2) - offy);
		w.proxymanager.draw(ctx);
		// Render speech bubbles
		SpeechBubble.updateAll(
		offx - w.screen_width / 2, offy - w.screen_height / 2, offx + w.screen_width / 2, offy + w.screen_height / 2);
		SpeechBubble.uncollideAll();
		SpeechBubble.renderAll(w.canvas_ctx);
		ctx.restore();
		// Request next frame
		requestAnimFrame(w.processFrame, w.canvas);
	},
	cameraMove: function (opts) {
		var w = World;
		if ('x' in opts && 'y' in opts) {
			w.camera.x = opts.x;
			w.camera.y = opts.y;
			w.camera.target = null; // no need to follow them any longer
		} else if ('id' in opts) {
			w.camera.target = w.proxymanager.getProxy(opts.id);
		}
	},
	updateCursor: function () {
		// Set cursor position
		// shoot a ray in the scene, determine where it hit
		var w = World;
		var d = 20;
		var mx = (Key.mouse_x - w.screen_width / 2) + w.camera.x;
		var my = (Key.mouse_y - w.screen_height / 2 - 8) + w.camera.y;
		var baseline = {
			x: ((mx / 2 + my) / 16) - 1 + d,
			y: (((my - mx / 2)) / 16) + d,
			z: d,
		};
		var res = w.proxymanager.bih.intersect({
			return_nodes: true,
			ray: [{
				a: baseline.x,
				b: -1
			}, {
				a: baseline.y,
				b: -1
			}, {
				a: baseline.z,
				b: -1
			}]
		});
		w.cursor.hidden = true;
		if (res.length > 0) {
			var p = res[0].object.o;
			var intersect = res[0].intersect;
			// check if we hit the top..
			var hitpos = {
				x: baseline.x - intersect,
				y: baseline.y - intersect,
				z: baseline.z - intersect,
			};
			if (hitpos.x >= p.x && hitpos.x < p.x + p.template.bx && hitpos.y >= p.y && hitpos.y < p.y + p.template.by && 1 /*Math.abs(hitpos.z-(p.z+p.template.bz)) < 0.001*/ ) {
				hitpos.x = Math.floor(hitpos.x);
				hitpos.y = Math.floor(hitpos.y);
				hitpos.z = Math.floor(hitpos.z);
				w.cursor.hidden = false;
				w.cursor.setPos(hitpos.x, hitpos.y, hitpos.z);
				if (Key.get(MOUSE_LEFT) && Key.changed(MOUSE_LEFT)) {
					// send left mouseclick in world coordinates
					w.send({
						mouse: [0, w.cursor.x, w.cursor.y, w.cursor.z]
					});
				} else if (Key.get(MOUSE_MIDDLE) && Key.changed(MOUSE_MIDDLE)) {
					// send middle mouseclick in world coordinates
					w.send({
						mouse: [1, w.cursor.x, w.cursor.y, w.cursor.z]
					});
				} else if (Key.get(MOUSE_RIGHT) && Key.changed(MOUSE_RIGHT)) {
					// send right mouseclick in world coordinates
					w.send({
						mouse: [2, w.cursor.x, w.cursor.y, w.cursor.z]
					});
				}
			}
		}
	},
	loaderBox: function (done, title, subtext) {
		if (!done) {
			$('#boxtitle').html(title);
			$('#subtext').html(subtext);
			$('#loaderbox').show();
			$('.room').hide();
			$('.map').hide();
			$('#loaderbar').css('background-position', (Number($('#loaderbar').css('background-position').replace('px 0px', '')) + 1) + 'px 0px');
			repeater = setTimeout('World.loaderBox(undefined,"' + title + '","' + subtext + '")', 10);
		} else {
			clearTimeout(repeater);
			$('#loaderbox').hide();
		}
	},
	log: function (msg, type) {
		var e = document.getElementById('console_lines');
		var now = new Date();
		var h = now.getHours();
		var m = now.getMinutes();
		if (m < 10) m = '0' + m;
		var datestring = h + ':' + m;
		$(e).append("<span class='" + type + "'>[" + datestring + '] ' + msg + "</span>");
		if (e.childNodes.length > 100) {
			$(e.childNodes[0]).remove();
		}
		e.scrollTop = e.scrollHeight;
		if (World.isFocused == false) {
			World.awayMsgNum++;
			setTitle("MetaVerse (" + World.awayMsgNum + ")");
		}
	},
	send: function (json) {
		World.socket.send(JSON.stringify(json));
	},
	sendChat: function (message) {
		World.send({
			msg: message
		})
	},
	sendPM: function (message, to) {
		var now = new Date();
		var h = now.getHours();
		var m = now.getMinutes();
		if (m < 10) m = '0' + m;
		var datestring = h + ':' + m;
		World.send({
			msg: message,
			username: to
		});
		var show = "";
		if (!$("#" + to + "tab").is("*")) {
			$("<span id=\"" + to + "tab\" onclick=\"World.switchMessagesTab('" + to + "')\">" + to + "</span> ").appendTo("#messages_control");
		} else if ($("#" + to + "tab").hasClass("msg_control_selected")) {
			show = " show";
		}
		World.log('<strong>' + World.current_user + ':</strong> ' + message, "pm " + to + show);
	},
	onConnect: function () {
		// not called.
	},
	onDisconnect: function () {
		World.logging_out = true;
		location.reload(true);
	},
	onMessage: function (evt) {
		var d = evt.data;
		var w = World;
		// See if data contains something of interest to us
		var json = JSON.parse(d);
		if (typeof (json) != 'object') return;
		if ('cp' in json) {
			// Create-proxies
			var l = json.cp;
			for (var i = 0; i < json.cp.length; i++) {
				World.proxymanager.addProxy(json.cp[i]);
			}
		} else if ('ct' in json) {
			// Create-template
			var l = json.ct;
			for (var i = 0; i < json.ct.length; i++) {
				World.proxymanager.addTemplate(json.ct[i]);
			}
		} else if ('dp' in json) {
			// Delete-proxies
			// If the server decides to delete the current camera target,
			//	set camera target to null
			var l = json.cp;
			for (var i = 0; i < json.dp.length; i++) {
				var id = json.dp[i];
				if (w.camera.target != null && w.camera.target.id == id) {
					w.camera.target = null;
				}
				World.proxymanager.delProxy(id);
			}
		} else if ('oe' in json) {
			// Object-event
			var id = json.oe[0];
			var action = json.oe[1];
			var parameter = json.oe[2];
			if (action == "say") {
				World.proxymanager.speechBubble(id, parameter);
			}
		} else if ('gmesg' in json) {
			// Global-message
			World.log('<strong>Server:</strong> ' + json.gmesg, "server");
		} else if ('pmesg' in json) {
			// private message
			var show = "";
			if (!$("#" + json.username + "tab").is("*")) {
				$("<span id=\"" + json.username + "tab\" onclick=\"World.switchMessagesTab('" + json.username + "')\">" + json.username + "</span> ").appendTo("#messages_control");
			} else if ($("#" + json.username + "tab").hasClass("msg_control_selected")) {
				show = " show";
			}
			World.log('<strong>' + json.username + ':</strong> ' + json.pmesg, "pm " + json.username + show);
			var audioElement = document.createElement('audio');
			audioElement.setAttribute('src', 'audio/mail.mp3');
			audioElement.play();
			if ($("#messages").is(":hidden")) {
				$("#messages_button").addClass("active").bind("click", function () {
					$(this).unbind();
					$(this).removeClass("active");
					document.title = "MetaVerse";
				});
			}
			if (!$("#all_lines").hasClass("pm")) {
				$("#pmtab").addClass("unread").bind("click", function () {
					$(this).unbind();
					$(this).removeClass("unread");
				});
			}
		} else if ('camera' in json) {
			World.cameraMove(json.camera);
		}
	}
}
