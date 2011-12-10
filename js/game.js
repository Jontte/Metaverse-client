World = {
	proxymanager: null,
	socket: null,
	cursor: null,

	callbacks: {
		login_successful: null,
		login_failed: null
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
			alert('You browser does not support WebSockets');
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

	loadLevel: function () {
		// Prepare handles and values
		var w = World;
		w.canvas = document.getElementById('canvas');
		w.canvas_ctx = World.canvas.getContext('2d');

		w.screen_width = 800;
		w.screen_height = 580;

		// Create proxymanager
		var manager = new ProxyManager()

		// Add builtin templates
		manager.addTemplate(['_cursor', 'plethora.png', false, 0, 1, 1, 0, [
			[5, 1]
		]]);

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
		ctx.fillStyle = 'rgb(127,160,255)';
		ctx.fillRect(0, 0, w.screen_width, w.screen_height);

		var txt = 'Cursor at (' + Key.mouse_x + ', ' + Key.mouse_y + ')';
		ctx.strokeText(txt, 0, 20);

		// Update curosr
		w.updateCursor();

		// Update key states
		Key.timestep();

		// Update proxy positions
		w.proxymanager.smooth();

		// Rebuild render graph if needed
		w.proxymanager.rebuildGraph();

		// Draw proxies
		ctx.save();
		ctx.translate(w.screen_width / 2, w.screen_height / 2);
		w.proxymanager.draw(ctx);
		ctx.restore();

		// Request next frame
		requestAnimFrame(w.processFrame, w.canvas);
	},
	updateCursor: function () {
		// Set cursor position
		// shoot a ray in the scene, determine where it hit
		var w = World;
		var d = 20;
		var mx = Key.mouse_x - w.screen_width / 2;
		var my = Key.mouse_y - w.screen_height / 2 - 8;
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
					// send mouseclick in world coordinates
					w.send({
						mouse: [w.cursor.x, w.cursor.y, w.cursor.z]
					});
				}
			}
		}
	},
	log: function (msg) {
		var e = document.getElementById('messagebox');

		var now = new Date();
		var h = now.getHours();
		var m = now.getMinutes();
		var s = now.getSeconds();
		if (m < 10) m = '0' + m;
		if (s < 10) s = '0' + s;
		var datestring = h + ':' + m + ':' + s;

		$(e).append(document.createTextNode(datestring + ' ' + msg + '\n'));
		if (e.childNodes.length > 100) {
			$(e.childNodes[0]).remove();
		}
		e.scrollTop = e.scrollHeight;
	},
	send: function (json) {
		World.socket.send(JSON.stringify(json));
	},
	sendChat: function (message) {
		World.send({
			msg: message
		})
	},
	onConnect: function () {
		// not called.
	},
	onDisconnect: function () {
		World.log('*** Connection lost ***');
	},
	onMessage: function (evt) {
		var d = evt.data;
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
			// Delete-proxy
			var l = json.cp;
			for (var i = 0; i < json.dp.length; i++) {
				World.proxymanager.delProxy(json.dp[i]);
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
			World.log('<Server> ' + json.gmesg);
		}
	}

}