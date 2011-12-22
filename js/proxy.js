function Template() {}

Template.prototype = {
	id: '',
	resource: '',
	// bounding box size
	bx: 0,
	by: 0,
	bz: 0,
	animations: {},
	solid: false,
	persistent: false, 
	readFrom: function (json) {
		this.id = json[0];
		this.resource = json[1];
		this.solid = json[2];
		this.persistent = json[3]
		this.bx = json[4];
		this.by = json[5];
		this.bz = json[6];
		this.animations = {};
		for (var key in json[7]){
			if(!json[7].hasOwnProperty(key))
				continue;
			var o = json[7][key];
			var t = this.animations[key] = [];
			for(var i = 0; i < o.length; i++)
				t.push([o[i][0],o[i][1],o[i][2]]);
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
	// Current animation parameters
	anim_current: null,
	anim_frame: 0,
	anim_tickcounter: 0,
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
	},
	advanceAnimation: function() {
		// Increase tick counter by one, switch frames as needed
		if(this.template == null)
			return;
		if(this.template.animations.length == 0)
			return;
		if(this.anim_current == null)
		{
			for(var key in this.template.animations)
			{
				if(!this.template.animations.hasOwnProperty(key))
					continue;
				if(this.template.animations[key].length == 0)
					continue;
				this.anim_current = key;
				break;
			}
			if(this.anim_current == null)
				return;
		}
		if(this.template.animations[this.anim_current].length == 0)
			return;
		var anims = this.template.animations;
		if(		++this.anim_tickcounter >= 
				anims[this.anim_current][this.anim_frame][2]) // Duration of current frame
		{
			this.anim_tickcounter = 0;
			if(++this.anim_frame >= anims[this.anim_current].length)
				this.anim_frame = 0;
		}
	}
}
