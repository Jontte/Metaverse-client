<<<<<<< HEAD
function Template() {}

Template.prototype = {
	id: '',
	resource: '',
	// bounding box size
	bx: 0,
	by: 0,
	bz: 0,
	tiles: [],
	solid: false,
	readFrom: function (json) {
		this.id = json[0];
		this.resource = json[1];
		this.solid = json[2];
		this.bx = json[3];
		this.by = json[4];
		this.bz = json[5];
		this.tiles = [];
		for (var i = 0; i < json[6].length; i++) {
			this.tiles.push([json[6][i][0], json[6][i][1]]);
		}
	}
}

function Proxy() {
	this.ext = {};
	this.ext_cb = {};
}

Proxy.prototype = {
	// Position
	x: 0,
	y: 0,
	z: 0,
	// Position used for rendering
	smooth_x: 0,
	smooth_y: 0,
	smooth_z: 0,
	// Template string
	template_id: '',
	// Template handle
	template: null,
	// Network-unique id
	id: 0,
	// dirty shape, needs render graph rebuild
	dirty: true,
	// extended parameters
	ext: {},
	// extended parameter change callbacks
	ext_cb: {},
	// hidden?
	hidden: false,
	// speech bubble
	bubble: null,
	// Serialization
	readFrom: function (json) {
		function read_extended(obj) {
			for (var key in obj) {
				if (!obj.hasOwnProperty(key)) continue;
				var old = (key in this.ext) ? this.ext[key] : "";
				this.ext[key] = obj[key];
				// If the param was changed, call callbacks
				if (old != obj[key] && (key in this.ext_cb)) {
					var cbs = this.ext_cb[key];
					for (var i = 0; i < cbs.length; i++)
					cbs[i](this, old, obj[key]);
				}
			}
		}
		this.id = json[0];
		if (typeof (json[1]) == 'string') {
			var newtemplate = json[1];
			if (this.template_id != newtemplate) {
				this.dirty = true;
				this.template = null;
				this.template_id = json[1];
			}
			this.setPos(json[2], json[3], json[4]);
			if (json.length > 5 && typeof (json[5]) == 'object') read_extended.call(this, json[5]);
		} else read_extended.call(this, json[1]);
	},
	setPos: function (tx, ty, tz) {
		if (this.x != tx) {
			this.x = tx;
			this.dirty = true;
		}
		if (this.y != ty) {
			this.y = ty;
			this.dirty = true;
		}
		if (this.z != tz) {
			this.z = tz;
			this.dirty = true;
		}
	},
	addCallback: function (param, cb) {
		if (param in this.ext_cb) this.ext_cb[param].push(cb);
		else this.ext_cb[param] = [cb];
	}
}
=======
function Template() {}

Template.prototype = {
	id: '',
	resource: '',
	// bounding box size
	bx: 0,
	by: 0,
	bz: 0,
	tiles: [],
	solid: false,
	readFrom: function (json) {
		this.id = json[0];
		this.resource = json[1];
		this.solid = json[2];
		this.bx = json[3];
		this.by = json[4];
		this.bz = json[5];
		this.tiles = [];
		for (var i = 0; i < json[6].length; i++) {
			this.tiles.push([json[6][i][0], json[6][i][1]]);
		}
	}
}

function Proxy() {
	this.ext = {};
	this.ext_cb = {};
}

Proxy.prototype = {
	// Position
	x: 0,
	y: 0,
	z: 0,
	// Position used for rendering
	smooth_x: 0,
	smooth_y: 0,
	smooth_z: 0,
	// Template string
	template_id: '',
	// Template handle
	template: null,
	// Network-unique id
	id: 0,
	// dirty shape, needs render graph rebuild
	dirty: true,
	// extended parameters
	ext: {},
	// extended parameter change callbacks
	ext_cb: {},
	// hidden?
	hidden: false,
	// speech bubble
	bubble: null,
	// Serialization
	readFrom: function (json) {
		function read_extended(obj) {
			for (var key in obj) {
				if (!obj.hasOwnProperty(key)) continue;
				var old = (key in this.ext) ? this.ext[key] : "";
				this.ext[key] = obj[key];
				// If the param was changed, call callbacks
				if (old != obj[key] && (key in this.ext_cb)) {
					var cbs = this.ext_cb[key];
					for (var i = 0; i < cbs.length; i++)
					cbs[i](this, old, obj[key]);
				}
			}
		}
		this.id = json[0];
		if (typeof (json[1]) == 'string') {
			var newtemplate = json[1];
			if (this.template_id != newtemplate) {
				this.dirty = true;
				this.template = null;
				this.template_id = json[1];
			}
			this.setPos(json[2], json[3], json[4]);
			if (json.length > 5 && typeof (json[5]) == 'object') read_extended.call(this, json[5]);
		} else read_extended.call(this, json[1]);
	},
	setPos: function (tx, ty, tz) {
		if (this.x != tx) {
			this.x = tx;
			this.dirty = true;
		}
		if (this.y != ty) {
			this.y = ty;
			this.dirty = true;
		}
		if (this.z != tz) {
			this.z = tz;
			this.dirty = true;
		}
	},
	addCallback: function (param, cb) {
		if (param in this.ext_cb) this.ext_cb[param].push(cb);
		else this.ext_cb[param] = [cb];
	}
}
<<<<<<< HEAD
>>>>>>> d230e531831fb9fa4319dd63dfde5657fda5a396
=======
>>>>>>> d230e531831fb9fa4319dd63dfde5657fda5a396
