var SpeechBubble = function (name) {
		this._name = name || null;

		this._target = {
			'x': 0,
			'y': 0
		};
		this._pos = {
			'x': 0,
			'y': 0
		};
		this._renderPos = {
			'x': 0,
			'y': 0
		};
		this._size = {
			'w': 1,
			'h': 1
		};
		this._fontSize = 12;
		this._textMargin = 5;
		this._lineMargin = 2;
		this._shadowRadius = 6;

		this._lines = [];

		this._offset = {
			'x': 0,
			'y': 0
		};

		this._hitEdge = {
			'left': false,
			'right': false,
			'top': false,
			'bottom': false
		};
		this._reRender = false;

		this._canvas = document.createElement('canvas');
		this._context = this._canvas.getContext('2d');

		SpeechBubble.instances.push(this);

		var self = this;
		setTimeout(function () {
			self.update();
			this._reRender = true;
		}, 0);
	};

SpeechBubble.drawShadows = false;

SpeechBubble.instances = [];
SpeechBubble.lineID = 0;

SpeechBubble.updateAll = function (minX, maxX, minY, maxY) {
	for (var i = 0; i < SpeechBubble.instances.length; ++i)
	SpeechBubble.prototype.update.apply(SpeechBubble.instances[i], arguments);
};
SpeechBubble.uncollideAll = function () {
	for (var i = 0; i < SpeechBubble.instances.length; ++i)
	SpeechBubble.prototype.uncollide.apply(SpeechBubble.instances[i], arguments);
};
SpeechBubble.renderAll = function (canvasContext) {
	for (var i = 0; i < SpeechBubble.instances.length; ++i)
	SpeechBubble.prototype.render.apply(SpeechBubble.instances[i], arguments);
};

SpeechBubble._makeGetSet = function (prop) {
	return function (val) {
		if (arguments.length == 1) {
			this[prop] = val;
			return this;
		}
		return this[prop];
	};
};

SpeechBubble.prototype.name = SpeechBubble._makeGetSet('_name');
SpeechBubble.prototype.pos = SpeechBubble._makeGetSet('_pos');
SpeechBubble.prototype.fontSize = SpeechBubble._makeGetSet('_fontSize');
SpeechBubble.prototype.textMargin = SpeechBubble._makeGetSet('_textMargin');
SpeechBubble.prototype.lineMargin = SpeechBubble._makeGetSet('_lineMargin');
SpeechBubble.prototype.shadowRadius = SpeechBubble._makeGetSet('_shadowRadius');

SpeechBubble.prototype.target = function (val) {
	if (arguments.length == 1) {
		var xChanged = this._target.x != val.x;
		this._target = val;
		if (xChanged) {
			this.update();
			if (this._pos.x != this._target.x) this._reRender = true;
		}
		return this;
	}
	return this._target;
};

SpeechBubble.prototype.destroy = function () {
	if (!this || this == window) return this;

	for (var i = 0; i < SpeechBubble.instances.length; ++i) {
		if (SpeechBubble.instances[i] == this) {
			SpeechBubble.instances.splice(i, 1);
			break;
		}
	}

	return this;
};

SpeechBubble.prototype.push = function (line) {
	if (typeof (line) == 'string') {
		line = {
			'id': ++SpeechBubble.lineID,
			'created': (new Date).getTime(),
			'text': line
		};
	}
	this._lines.push(line);

	var self = this;
	setTimeout(function () {
		for (var i = 0; i < self._lines.length; ++i) {
			if (self._lines[i].id == line.id) {
				self._lines.splice(i, 1);
				break;
			}
		}
		self._linesChanged();
	}, 5000);

	this._linesChanged();
};

SpeechBubble.prototype._render = function () {
	if (this._name) {
		this._lines.unshift({
			'id': -(++SpeechBubble.lineID),
			'text': this._name,
			'isName': true
		});
	}

	if (this._lines[0].isName) this._context.font = 'bold ' + this._fontSize + 'px sans-serif';
	else this._context.font = this._fontSize + 'px sans-serif';

	this._size.w = 0;
	for (var i = 0; i < this._lines.length; ++i) {
		var width = this._context.measureText(this._lines[i].text).width;
		if (width > this._size.w) this._size.w = width;

		if (this._lines[i].isName) this._context.font = this._fontSize + 'px sans-serif';
	}
	this._size.w += 10;
	this._size.h = this._lines.length * (this._fontSize + this._lineMargin) + this._textMargin * 2;

	this._canvas.width = this._size.w + this._shadowRadius;
	this._canvas.height = this._size.h + this._shadowRadius + this._textMargin * 2;

	this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

	if (this._lines.length == 0) return;
	this._context.strokeStyle = "#fff";
	this._context.lineWidth = 2;
	this._context.beginPath();
	this._context.moveTo(this._textMargin, 0);
	this._context.lineTo(this._size.w - this._textMargin, 0);
	this._context.arc(this._size.w - this._textMargin, this._textMargin, this._textMargin, -Math.PI / 2, 0);
	this._context.lineTo(this._size.w, this._size.h - this._textMargin);
	this._context.arc(this._size.w - this._textMargin, this._size.h - this._textMargin, this._textMargin, 0, Math.PI / 2);

	var localTargetX = Math.min(this._canvas.width, Math.max(0, this._target.x - this._renderPos.x));

	this._context.lineTo(Math.max(this._textMargin * 4, Math.min(this._size.w - this._textMargin * 2, localTargetX + this._textMargin)), this._size.h);
	this._context.lineTo(localTargetX, this._size.h + this._textMargin * 2);
	this._context.lineTo(Math.min(this._size.w - this._textMargin * 4, Math.max(this._textMargin * 2, localTargetX - this._textMargin)), this._size.h);
	this._context.lineTo(this._textMargin, this._size.h);

	this._context.arc(this._textMargin, this._size.h - this._textMargin, this._textMargin, Math.PI / 2, -Math.PI);
	this._context.lineTo(0, this._textMargin);
	this._context.arc(this._textMargin, this._textMargin, this._textMargin, -Math.PI, -Math.PI / 2);

	if (SpeechBubble.drawShadows) {
		this._context.shadowOffsetX = this._shadowRadius / 2;
		this._context.shadowOffsetY = this._shadowRadius / 2;
		this._context.shadowBlur = this._shadowRadius;
		this._context.shadowColor = '#bbb';
	}

	this._context.fillStyle = '#031D56';
	this._context.fill();

	if (SpeechBubble.drawShadows) {
		this._context.shadowOffsetX = 0;
		this._context.shadowOffsetY = 0;
		this._context.shadowBlur = 0;
		this._context.shadowColor = '#fff';
	}
	this._context.stroke();

	this._offset = {
		'x': 0,
		'y': -(this._size.h + this._textMargin * 2)
	};

	this._context.textBaseline = 'top';

	if (this._lines[0].isName) this._context.font = 'bold ' + this._fontSize + 'px sans-serif';
	else this._context.font = this._fontSize + 'px sans-serif';

	this._context.fillStyle = '#fff';
	for (var i = 0; i < this._lines.length; ++i) {
		this._context.fillText(
		this._lines[i].text, this._textMargin, this._textMargin + (this._fontSize + this._lineMargin) * i, this._size.w - this._textMargin * 2);

		if (this._lines[i].isName) this._context.font = this._fontSize + 'px sans-serif';
	}

	if (this._lines[0] && this._lines[0].isName) this._lines.shift();
};

SpeechBubble.prototype._linesChanged = function () {
	this.update();
	this._reRender = true;
};

SpeechBubble.prototype.update = function (minX, minY, maxX, maxY) {
	this._hitEdge = {
		'left': false,
		'right': false,
		'top': false,
		'bottom': false
	};

	if (arguments.length == 4) {
		minX -= this._offset.x;
		maxX -= this._offset.x + this._size.w;
		minY -= this._offset.y;
		maxY -= this._offset.y + this._size.h;

		if (this._target.x <= minX) {
			this._hitEdge.left = true;
			this._pos.x = minX;
		} else if (this._target.x >= maxX) {
			this._hitEdge.right = true;
			this._pos.x = maxX;
		} else this._pos.x = this._target.x;

		if (this._target.y <= minY) {
			this._hitEdge.top = true;
			this._pos.y = minY;
		} else if (this._target.y >= maxY) {
			this._hitEdge.bottom = true;
			this._pos.y = maxY;
		} else this._pos.y = this._target.y;
	}
};

SpeechBubble.prototype.uncollide = function () {
	for (var i = 0; i < SpeechBubble.instances.length; ++i) {
		var other = SpeechBubble.instances[i];
		if (other == this) continue;

		if (this._hitEdge.left && !other._hitEdge.left) continue;
		if (this._hitEdge.right && !other._hitEdge.right) continue;

		if (
		this._pos.x > other._pos.x + other._size.w || this._pos.x + this._size.w < other._pos.x || this._pos.y > other._pos.y + other._size.h || this._pos.y + this._size.h < other._pos.y) continue;

		if (this._hitEdge.right && other._hitEdge.right) {
			if (this._hitEdge.top) other._pos.y = this._pos.y + this._canvas.height;
			else this._pos.y = other._pos.y - this._canvas.height;
			this._reRender = true;
			continue;
		}

		if (this._pos.x <= other._pos.x) this._pos.x = other._pos.x - this._size.w;


		this._reRender = true;
	}

	var xSpeed = Math.max(0.5, Math.abs(this._pos.x - this._renderPos.x) / 10);
	var ySpeed = Math.max(0.5, Math.abs(this._pos.y - this._renderPos.y) / 10);

	var xMoved = true;
	var yMoved = true;

	if (this._renderPos.x > this._pos.x) this._renderPos.x = Math.max(this._pos.x, this._renderPos.x - xSpeed);
	else if (this._renderPos.x < this._pos.x) this._renderPos.x = Math.min(this._pos.x, this._renderPos.x + xSpeed);
	else xMoved = false;

	if (this._renderPos.y > this._pos.y) this._renderPos.y = Math.max(this._pos.y, this._renderPos.y - ySpeed);
	else if (this._renderPos.y < this._pos.y) this._renderPos.y = Math.min(this._pos.y, this._renderPos.y + ySpeed);
	else yMoved = false;

	if (xMoved) this._reRender = true;
};

SpeechBubble.prototype.render = function (canvasContext) {
	if (this._reRender) {
		this._reRender = false;
		this._render();
	}
	canvasContext.drawImage(this._canvas, this._renderPos.x + this._offset.x, this._renderPos.y + this._offset.y);
};