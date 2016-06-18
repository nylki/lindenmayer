/**
 * Polyfill for HTML5 CanvasRenderingContext2D.currentTransform[Inverse].
 * Matt <mabananatt@supermatty.com>, 2012-2013.
 * Please remove the yellow, tasty fruit from my email address in order to contact me.
 *
 * I, the author of this code, grant any entity the right to use this work
 * for any purpose and in any way, without any conditions or restrictions of any kind,
 * unless such conditions or restrictions are required by law.
 *
 * Notwithstanding the above, I would greatly appreciate it if you were to:
 * - Notify me of your use of this code, if any; and/or
 * - Contribute any changes which you may make back to me.
 *
 * There are no warranties as to the operation or failure to operate of this code,
 * nor of its fitness for any particular purpose.
 * 
 * Patches, bugfixes, enhancements, use stories etc are welcome - please email me.
 */
(function() {
	var vendorPrefixes = ['moz', 'webkit', 'khtml', 'o', 'ms'],
		i,
		identityMatrix = [1, 0, 0, 1, 0, 0],
		canvas,
		context,
		canvasProto,
		contextProto,
		originalGetContext, originalSave, originalRestore, originalRotate,
		originalScale, originalTranslate, originalTransform,
		originalSetTransform, originalResetTransform,
		getPrototypeOf, defineProperty;
	/*
	debug('Object.getPrototypeOf: ', Object.getPrototypeOf);
	debug('Object.defineProperty: ', Object.defineProperty);
	debug('__defineGetter__: ', __defineGetter__);
	debug('__defineSetter__: ', __defineSetter__);
	*/
	canvas = document.createElement('canvas');
	if (canvas && canvas.getContext) {
		context = canvas.getContext("2d");
	} else {
		context = undefined;
	}
	if (!context) {
		return; // Silently do nothing if <canvas> 2D context unavailable
	}
	// This would be a polyfill for Object.getPrototypeOf,
	// except that extending Object.prototype is Evil.
	if (Object.getPrototypeOf) {
		getPrototypeOf = Object.getPrototypeOf;
	} else {
		getPrototypeOf = function() {
			return this.__proto__ || this.constructor.prototype;
		};
	}
	// Another would-be polyfill, for Object.defineProperty.
	// This only handles the 'accessor descriptor' case, not the 'data descriptor' case.
	if (Object.defineProperty) {
		// NOTE: IE8 has this method, but it only works on DOM objects attached to the DOM tree.
		// But IE8 doesn't support <canvas>, so we're stuffed anyway and should have bailed earlier.
		defineProperty = Object.defineProperty;
	} else if (Object.__defineGetter__ && Object.__defineSetter__) {
		// Old Mozilla property API
		defineProperty = function(name, descriptor) {
			if (descriptor.get) {
				this.__defineGetter__(name, descriptor.get);
			}
			if (descriptor.set) {
				this.__defineSetter__(name, descriptor.set);
			}
		};
	} else {
		// NOTE: IE6-7 have an 'onpropertychange' event, but they also don't support <canvas>,
		// so it's useless for our purposes, and again we should have bailed earlier.
		defineProperty = undefined;
	}
	canvasProto = getPrototypeOf(canvas) || HTMLCanvasElement;
	contextProto = getPrototypeOf(context) || CanvasRenderingContext2D;
	// Separate polyfills for potentially missing Canvas context methods
	if (!('resetTransform' in contextProto)) {
		contextProto.resetTransform = function() {
			this.setTransform.apply(this, identityMatrix.concat());
		};
	}
	if ('currentTransform' in contextProto && 'currentTransformInverse' in contextProto) {
		return; // Already have the two properties; no polyfill required
	}
	// If we have defineProperty, and if the browser has prefixed <foo>CurrentTransform[Inverse] properties,
	// add renamed non-prefixed properties mirroring them.
	for (i = 0; i < vendorPrefixes.length; i++) {
		if (defineProperty && !('currentTransform' in contextProto) && ((vendorPrefixes[i] + 'CurrentTransform') in contextProto)) {
			defineProperty(contextProto, 'currentTransform', {
				get: function() {
					return this[vendorPrefixes[i] + 'CurrentTransform'];
				},
				set: function(newMatrix) {
					this.setTransform.apply(this, newMatrix);
				},
				configurable: false,
				enumerable: false
			});
			defineProperty(contextProto, 'currentTransformInverse', {
				get: function() {
					return this[vendorPrefixes[i] + 'CurrentTransformInverse'];
				},
				// No setter for inverse matrix
				configurable: false,
				enumerable: false
			});
			return; // We're done at this point.
		}
	}
	// If we get here, we still don't have currentTransform[Inverse] properties
	// (not even prefixed ones), so we need to track the CTM ourselves.
	/*
	debug('currentTransform in contextProto: ', ('currentTransform' in contextProto));
	debug('currentTransformInverse in contextProto: ', ('currentTransformInverse' in contextProto));
	*/
	if (!('currentTransform' in contextProto) || !('currentTransformInverse' in contextProto)) {
		// Saved values of over-ridden Canvas methods
		originalGetContext = canvasProto.getContext;
		// Saved values of over-ridden Context methods
		originalSave      = contextProto.save;
		originalRestore   = contextProto.restore;
		originalRotate    = contextProto.rotate;
		originalScale     = contextProto.scale;
		originalTranslate = contextProto.translate;
		originalTransform = contextProto.transform;
		originalSetTransform = context.setTransform;
		originalResetTransform = contextProto.resetTransform;
		// Over-ride the Canvas factory method that creates Contexts to create decorated ones
		canvasProto.getContext = function() {
			// Workaround: older browsers do not accept 'arguments' as second parameter of Function.apply
			var context = originalGetContext.apply(this, Array.prototype.slice.call(arguments, 0));
			if (Object.defineProperty) {
				// Using Object.defineProperty rather than simple assignment in order to hide these 'private' data
				Object.defineProperty(context, '_transformMatrix', {
					configurable: false,
					enumerable: false,
					value: identityMatrix.concat(),
					writable: true
				});
				Object.defineProperty(context, '_transformStack', {
					configurable: false,
					enumerable: false,
					value: [],
					writable: true
				});
			} else {
				// Object.defineProperty unavailable; fall back to simple assignment.
				// TODO: Could avoid littering the context by storing these in a private (closed-over)
				// hash keyed by context. However JS gives no easy way to associate a unique ID with each context.
				context._transformMatrix = identityMatrix.concat();
				context._transformStack = [];
			}
			return context;
		};
		// Over-ride each Context method that modifies the transform matrix
		contextProto.save = function() {
			this._transformStack.push(this._transformMatrix.concat()); // shallow copy
			return originalSave.apply(this, Array.prototype.slice.call(arguments, 0));
		};
		contextProto.restore = function() {
			var mtx = this._transformStack.pop();
			if (mtx) {
				this._transformMatrix = mtx;
			}
			return originalRestore.apply(this, Array.prototype.slice.call(arguments, 0));
		};
		contextProto.translate = function(x, y) {
			this._transformMatrix[4] += this._transformMatrix[0] * x + this._transformMatrix[2] * y;
			this._transformMatrix[5] += this._transformMatrix[1] * x + this._transformMatrix[3] * y;
			return originalTranslate.apply(this, Array.prototype.slice.call(arguments, 0));
		};
		contextProto.scale = function(x, y) {
			this._transformMatrix[0] *= x;
			this._transformMatrix[1] *= x;
			this._transformMatrix[2] *= y;
			this._transformMatrix[3] *= y;
			return originalScale.apply(this, Array.prototype.slice.call(arguments, 0));
		};
		contextProto.rotate = function(angle) {
			var c = Math.cos(angle), s = Math.sin(angle);
			this._transformMatrix = [
				this._transformMatrix[0] *  c + this._transformMatrix[2] * s,
				this._transformMatrix[1] *  c + this._transformMatrix[3] * s,
				this._transformMatrix[0] * -s + this._transformMatrix[2] * c,
				this._transformMatrix[1] * -s + this._transformMatrix[3] * c,
				this._transformMatrix[4],
				this._transformMatrix[5]
			];
			return originalRotate.apply(this, Array.prototype.slice.call(arguments, 0));
		};
		contextProto.transform = function(a, b, c, d, e, f) {
			this._transformMatrix = [
				this._transformMatrix[0] * a + this._transformMatrix[2] * b,
				this._transformMatrix[1] * a + this._transformMatrix[3] * b,
				this._transformMatrix[0] * c + this._transformMatrix[2] * d,
				this._transformMatrix[1] * c + this._transformMatrix[3] * d,
				this._transformMatrix[0] * e + this._transformMatrix[2] * f + this._transformMatrix[4],
				this._transformMatrix[1] * e + this._transformMatrix[3] * f + this._transformMatrix[5]
			];
			return originalTransform.apply(this, Array.prototype.slice.call(arguments, 0));
		};
		contextProto.setTransform = function(a, b, c, d, e, f) {
			this._transformMatrix = [ a, b, c, d, e, f];
			return originalSetTransform.apply(this, Array.prototype.slice.call(arguments, 0));
		};
		contextProto.resetTransform = function() {
			this._transformMatrix = identityMatrix.concat();
			return originalResetTransform.apply(this, Array.prototype.slice.call(arguments, 0));
		};
	}
	if (defineProperty && !('currentTransform' in contextProto)) {
		defineProperty(contextProto, 'currentTransform', {
			get: function() {
				return this._transformMatrix;
			},
			set: function(newMatrix) {
				this.setTransform.apply(this, newMatrix);
			},
			configurable: false,
			enumerable: true
		});
	}
	if (defineProperty && !('currentTransformInverse' in contextProto)) {
		defineProperty(contextProto, 'currentTransformInverse', {
			get: function() {
				var a = this._transformMatrix[0], b = this._transformMatrix[1],
					c = this._transformMatrix[2], d = this._transformMatrix[3],
					e = this._transformMatrix[4], f = this._transformMatrix[5],
					ad_minus_bc = a * d - b * c,
					bc_minus_ad = b * c - a * d;
				return [
					d / ad_minus_bc, b / bc_minus_ad,
					c / bc_minus_ad, a / ad_minus_bc,
					(d * e - c * f) / bc_minus_ad, (b * e - a * f) / ad_minus_bc
				];
			},
			configurable: false,
			enumerable: true
		});
	}
})();
