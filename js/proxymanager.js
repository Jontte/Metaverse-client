// Takes care of sorting known proxies by their rendering order.
// Draws them


function ProxyManager() {
	this.proxies = new LinkedList();
	this.bih = new jsBIH(3);
	this.proxies_id = {};
	this.templates = {};
}

ProxyManager.prototype.getProxy = function(id) {
	// This function will return a known proxy by id or null if it does not exist
	// Remember that once the proxy is deleted the returned handle should not be stored any lonegr
	if(id in this.proxies_id)
	{
		return this.proxies_id[id];
	}
	return null;
}

ProxyManager.prototype.addProxy = function (json) {
	var id = json[0];

	var proxy = null;
	var new_object = false;
	if (id in this.proxies_id && id != 0) {
		// known object!
		proxy = this.proxies_id[id];
		proxy.readFrom(json);
	} else {
		// adding a new object
		proxy = new Proxy();
		proxy.readFrom(json);
		// dual handle
		this.proxies.push_front(proxy);
		if (id != 0) this.proxies_id[proxy.id] = proxy;

		// since it's a new object, we don't need any smoothing
		proxy.smooth_x = proxy.x;
		proxy.smooth_y = proxy.y;
		proxy.smooth_z = proxy.z;

		new_object = true;
	}

	// Set template handle..
	var t = proxy.template_id;
	if (t in this.templates) {
		proxy.template = this.templates[t];
		proxy.src = World.preload.images[proxy.template.resource];
	} else {
		// unknown template referenced! (fatal)
		proxy.template_id = '';
		proxy.template = new Template();
	}

	if (new_object && (proxy.template.solid == true)) {
		// solid objects are stored in a the BIH
		p = proxy;
		t = p.template;
		this.bih.insert({
			intervals: [{
				a: p.x,
				b: t.bx
			}, {
				a: p.y,
				b: t.by
			}, {
				a: p.z,
				b: t.bz
			}],
			object: p
		});
	}

	if (new_object) {
		// Add speech bubble and callback..
		if ('label' in proxy.ext) {
			proxy.bubble = new SpeechBubble(proxy.ext.label);
		}
		proxy.addCallback('label', function (p, old, value) {
			if (p.bubble == null) p.bubble = new SpeechBubble(value);
			else p.bubble.name(value)
		});
	}
	return proxy;
}
ProxyManager.prototype.delProxy = function (id) {
	var node = this.proxies.front();
	if(id in this.proxies_id)
	{
		delete this.proxies_id[id];
	}
	while (node != null) {
		var p = node.get();
		if (p.id == id) {
			if (p.template.solid) {
				// remove solid object from the BIH
				var t = p.template;
				var objs = this.bih.remove({
					optimized_remove: true,
					intervals: [{
						a: p.x,
						b: t.bx
					}, {
						a: p.y,
						b: t.by
					}, {
						a: p.z,
						b: t.bz
					}],
					object: p
				});
			}
			if (p.bubble) p.bubble.destroy();
			node = node.erase();
			return;
		}
		node = node.next;
	}
}
ProxyManager.prototype.addTemplate = function (json) {
	var template_id = json[0];
	if (template_id in this.templates) {
		// known template updated.
		var t = this.templates[template_id];
		t.readFrom(json);
		return t;
	} else {
		var p = new Template();
		p.readFrom(json);
		this.templates[template_id] = p;
		return p;
	}
}
ProxyManager.prototype.smooth = function () {
	var node = this.proxies.front();
	while (node != null) {
		var p = node.get();

		if (p.template.solid || ('warp_movement' in p.template)) {
			// warp
			if (p.smooth_x != p.x || p.smooth_y != p.y || p.smooth_z != p.z) p.dirty = true;

			p.smooth_x = p.x;
			p.smooth_y = p.y;
			p.smooth_z = p.z;
		} else {
			// exponential
			var d = 0.20;
			var dif = [p.smooth_x, p.smooth_y, p.smooth_z];
			p.smooth_x = p.smooth_x * (1 - d) + p.x * d;
			p.smooth_y = p.smooth_y * (1 - d) + p.y * d;
			p.smooth_z = p.smooth_z * (1 - d) + p.z * d;
			if (p.smooth_x != dif[0] || p.smooth_y != dif[1] || p.smooth_z != dif[2]) p.dirty = true;
		}

		node = node.next;
	}
}
ProxyManager.prototype.draw = function (dest) {
	var w = World;
	dest.font = '12px sans-serif;';
	var node = this.proxies.front();
	while (node != null) {
		var p = node.get();

		if (p.hidden) {
			node = node.next;
			continue;
		}

		var target = Cuboid2Screen(
		p.smooth_x, p.smooth_y, p.smooth_z, p.template.bx, p.template.by, p.template.bz);

		var tile_x = 0;
		var tile_y = 0;

		if (p.template.tiles.length == 0) {
			node = node.next;
			continue;
		}
		tile_x = p.template.tiles[0][0];
		tile_y = p.template.tiles[0][1];
		dest.drawImage(
		p.src, 32 * tile_x, 32 * tile_y, target.w, target.h, target.x, target.y, target.w, target.h);

		if (p.bubble) {
			p.bubble.target({
				x: target.x + target.w / 2,
				y: target.y
			});
		}

		node = node.next;
	}
}
ProxyManager.prototype.rebuildGraph = function () {
/*
		1. remove dirty objects from this.proxies
		2. insert them just before the first object that wants it before them
		*/
	var erased = [];
	var node = this.proxies.front();
	while (node != null) {
		var p = node.get();
		if (p.dirty) {
			erased.push(p);
			node = node.erase();
			p.dirty = false;
		} else node = node.next;
	}

	// Insert objects from 'erased' into tactical positions..
	// TODO: O(n^2) ?
	for (var i = 0; i < erased.length; i++) {
		var node = this.proxies.front();
		var done = false;
		var prev = null;
		while (node != null) {
			var result = this.depthSort(node.get(), erased[i]);
			if (result == false) {
				node.insert(erased[i]);
				done = true;
				break;
			}
			prev = node;
			node = node.next;
		}
		if (node == null && !done) {
			if (prev != null) prev.insert_after(erased[i]);
			else this.proxies.push_front(erased[i]);
		}
	}
}

ProxyManager.prototype.depthSort = function (a, b) {
/*
		This function is the root of the render graph builder.
		It answers the following question:
		"Is a behind b?" or "Should a be rendered before b?"
		Returns null when don't care
	*/

	// grab a few handles first
	var ax = a.smooth_x;
	var ay = a.smooth_y;
	var az = a.smooth_z;
	var bx = b.smooth_x;
	var by = b.smooth_y;
	var bz = b.smooth_z;
	var abx = a.template.bx;
	var aby = a.template.by;
	var abz = a.template.bz;
	var bbx = b.template.bx;
	var bby = b.template.by;
	var bbz = b.template.bz;

	// check diagonals..
	var mx = (abx + bbx) / 2;
	var my = (aby + bby) / 2;
	var mz = (abz + bbz) / 2;

	// avoid rounding errors
	var eps = 0.1;

	var p1a = ax >= bx + bbx - eps;
	var p2a = ay >= by + bby - eps;
	var p3a = az >= bz + bbz - eps;

	var p1b = bx >= ax + abx - eps;
	var p2b = by >= ay + aby - eps;
	var p3b = bz >= az + abz - eps;

	// we always prefer nulls where possible since adding unnecessary 
	// connections to the rendering graph can potentially make 
	// calculation much more complicated and expensive
	//if(p1a&&p2b)return null;
	//if(p2a&&p1b)return null;
	//	if(p3b)
	//		if(p2b||p1b)return null;
	//if(p3a)
	//	if(p2b||p1b)return null;
	if (p3a) return false;
	if (p3b) return true;
	if (p1a) return false;
	if (p1b) return true;
	if (p2a) return false;
	if (p2b) return true;

	// If the objects penetrate just a little, we may still be able to do something...
	// calculate box of penetration.. 
	var bbx1 = ax;
	var bby1 = ay;
	var bbz1 = az;
	var bbx2 = ax + abx;
	var bby2 = ay + aby;
	var bbz2 = az + abz;

	if (bx > bbx1) bbx1 = bx;
	if (by > bby1) bby1 = by;
	if (bz > bbz1) bbz1 = bz;

	if (bx + bbx < bbx2) bbx2 = bx + bbx;
	if (by + bby < bby2) bby2 = by + bby;
	if (bz + bbz < bbz2) bbz2 = bz + bbz;

	// select dimension that penerates least => sort by that dim
	var bbx = bbx2 - bbx1;
	var bby = bby2 - bby1;
	var bbz = bbz2 - bbz1;

	if (bbz < bby && bbz < bbx) {
		return az < bz;
	} else if (bbx < bby) {
		return ax < bx;
	} else {
		return ay < by;
	}
}

ProxyManager.prototype.speechBubble = function (id, message) {
	if (id in this.proxies_id) {
		var p = this.proxies_id[id];
		// If the given object also has a label, use the log
		if ('label' in p.ext) {
			World.log('<strong>' + p.ext['label'] + ':</strong> ' + message, "public");
		}

		if (p.bubble == null) p.bubble = new SpeechBubble(('label' in p.ext) ? p.ext.label : null);
		p.bubble.push(message);
	}
}