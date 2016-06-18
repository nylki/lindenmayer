/**
 * @fileoverview Implement 'currentTransform' of CanvasRenderingContext2D prototype (polyfill)
 * @author Stefan Goessner (c) 2015
 */

/**
 * extend CanvasRenderingContext2D.prototype by current transformation matrix access.
 */
if (!("currentTransform" in CanvasRenderingContext2D.prototype)) {
/**
 * define property 'currentTransform'
 */
   if ("mozCurrentTransform" in CanvasRenderingContext2D.prototype) {
      Object.defineProperty(CanvasRenderingContext2D.prototype, "currentTransform", {
         get : function() { var m = this.mozCurrentTransform; return {a:m[0],b:m[1],c:m[2],d:m[3],e:m[4],f:m[5]}; },
         set : function(x) { this.mozCurrentTransform = [x.a,x.b,x.c,x.d,x.e,x.f]; },
         enumerable : true,
         configurable : false
      });
   }
   else if ("webkitCurrentTransform" in CanvasRenderingContext2D.prototype) {
      Object.defineProperty(CanvasRenderingContext2D.prototype, "currentTransform", {
         get : function() { return this.webkitCurrentTransform; },
         set : function(x) { this.webkitCurrentTransform = x; },
         enumerable : true,
         configurable : false
      });
   }
   else {  // fully implement it ... hmm ... 'currentTransform', 'save()', 'restore()', 'transform()', 'setTransform()', 'resetTransform()'
      Object.defineProperty(CanvasRenderingContext2D.prototype, "currentTransform", {
         get : function() { return this._t2stack && this._t2stack[this._t2stack.length-1] || {a:1,b:0,c:0,d:1,e:0,f:0}; },
         set : function(x) {
            if (!this._t2stack)
               this._t2stack = [{}];
            this._t2stack[this._t2stack.length-1] = {a:x.a,b:x.b,c:x.c,d:x.d,e:x.e,f:x.f};
         },
         enumerable : true,
         configurable : false
      });
      CanvasRenderingContext2D.prototype.save = function() {
         var save = CanvasRenderingContext2D.prototype.save;
         return function() {
            if (!this._t2stack)
               this._t2stack = [{a:1,b:0,c:0,d:1,e:0,f:0}];
            var t = this._t2stack[this._t2stack.length-1];
            this._t2stack.push(t && {a:t.a,b:t.b,c:t.c,d:t.d,e:t.e,f:t.f});
            save.call(this);
         }
      }();
      CanvasRenderingContext2D.prototype.restore = function() {
         var restore = CanvasRenderingContext2D.prototype.restore;
         return function() {
            if (this._t2stack) this._t2stack.pop();
            restore.call(this);
         }
      }();
      CanvasRenderingContext2D.prototype.transform = function() {
         var transform = CanvasRenderingContext2D.prototype.transform;
         return function(a,b,c,d,e,f) {
            if (!this._t2stack)
               this._t2stack = [{a:1,b:0,c:0,d:1,e:0,f:0}];
            var t = this._t2stack[this._t2stack.length-1], q;
            q = t.a; t.a = a*q+c*t.b,   t.b = b*q+d*t.b;
            q = t.c; t.c = a*q+c*t.d,   t.d = b*q+d*t.d;
            q = t.e; t.e = a*q+c*t.f+e; t.f = b*q+d*t.f+f;
            transform.call(this,a,b,c,d,e,f);
         }
      }();
      CanvasRenderingContext2D.prototype.setTransform = function() {
         var setTransform = CanvasRenderingContext2D.prototype.setTransform;
         return function(a,b,c,d,e,f) {
            if (!this._t2stack)
               this._t2stack = [{}];
            this._t2stack[this._t2stack.length-1] = {a:a,b:b,c:c,d:d,e:e,f:f};
            setTransform.call(this,a,b,c,d,e,f);
         }
      }();
      CanvasRenderingContext2D.prototype.resetTransform = function() {
         var resetTransform = CanvasRenderingContext2D.prototype.resetTransform;
         return function() {
            if (!this._t2stack)
               this._t2stack = [{}];
            this._t2stack[this._t2stack.length-1] = {a:1,b:0,c:0,d:1,e:0,f:0};
            resetTransform && resetTransform.call(this);
         }
      }();
      CanvasRenderingContext2D.prototype.scale = function() {
         var scale = CanvasRenderingContext2D.prototype.scale;
         return function(sx,sy) {
            if (!this._t2stack)
               this._t2stack = [{a:1,b:0,c:0,d:1,e:0,f:0}];
            var t = this._t2stack[this._t2stack.length-1];
            sx = sx || 1;
            sy = sy || sx;
            t.a *= sx; t.c *= sx; t.e *= sx;
            t.b *= sy; t.d *= sy; t.f *= sy;
            scale.call(this,sx,sy);
         }
      }();
      CanvasRenderingContext2D.prototype.rotate = function() {
         var rotate = CanvasRenderingContext2D.prototype.rotate;
         return function(w) {
            if (!this._t2stack)
               this._t2stack = [{a:1,b:0,c:0,d:1,e:0,f:0}];
            var t = this._t2stack[this._t2stack.length-1];
            var sw = w?Math.sin(w):0, cw = w?Math.cos(w):1, q;
            q = t.a; t.a = q*cw-t.b*sw;   t.b = q*sw+t.b*cw;
            q = t.c; t.c = q*cw-t.d*sw;   t.d = q*sw+t.d*cw;
            q = t.e; t.e = q*cw-t.f*sw;   t.f = q*sw+t.f*cw;
            return rotate.call(this,w);
         }
      }();
      CanvasRenderingContext2D.prototype.translate = function() {
         var translate = CanvasRenderingContext2D.prototype.translate;
         return function(x,y) {
            if (!this._t2stack)
               this._t2stack = [{a:1,b:0,c:0,d:1,e:0,f:0}];
            var t = this._t2stack[this._t2stack.length-1];
            t.e += x; t.f += y;
            return translate.call(this,x,y);
         }
      }();
   }
}
