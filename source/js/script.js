var $$ = mdui.$;

/* Gotop */
$$(function () {
  $$(window).on('scroll', function (e) {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop !== 0) {
      $$('#gotop').removeClass('mdui-fab-hide');
    } else {
      $$('#gotop').addClass('mdui-fab-hide');
    }
  });
  $$('#gotop').on('click', function (e) {
    (function animateScroll() {
      var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop !== 0) {
        window.requestAnimationFrame(animateScroll);
        window.scrollTo(0, scrollTop - (scrollTop / 5));
      }
    })();
  });
});

/* Dark Mode */
$$.fn.extend({
  longPress: function (fn) {
    var $this = this;
    for (var i = 0; i < $this.length; i++) {
      (function (target) {
        var timeout;
        var start = function (event) {
          timeout = setTimeout(function () {
            fn(event);
          }, 500);
        };
        var end = function (event) {
          clearTimeout(timeout);
        };
        target.addEventListener('mousedown', start, false);
        target.addEventListener('mouseup', end, false);
        target.addEventListener('touchstart', start, false);
        target.addEventListener('touchend', end, false);
      })($this[i]);
    }
  }
});
$$(function () {
  $$('#header').longPress(function (e) {
    if (!window.matchMedia || !window.matchMedia('(prefers-color-scheme: dark)').matches) {
      if ($$('body').hasClass('mdui-theme-layout-dark')) {
        $$('body').removeClass('mdui-theme-layout-dark');
        localStorage.removeItem('mdui-theme-layout-dark');
      } else {
        $$('body').addClass('mdui-theme-layout-dark');
        localStorage.setItem('mdui-theme-layout-dark', true);
      }
    }
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (e.matches) {
      $$('body').addClass('mdui-theme-layout-dark');
    } else {
      $$('body').removeClass('mdui-theme-layout-dark');
    }
    localStorage.removeItem('mdui-theme-layout-dark');
  });
  var tab = new mdui.Tab('#donate .mdui-tab');
  $$('#donate').on('opened.mdui.dialog', function (e) {
    tab.handleUpdate();
  });
});

/* Drawer State */
$$(function () {
  $$('#sidebar').on('open.mdui.drawer', function (e) {
    localStorage.removeItem('mdui-drawer-close');
  });
  $$('#sidebar').on('close.mdui.drawer', function (e) {
    localStorage.setItem('mdui-drawer-close', true);
  });
});

/* Sidebar Collapse Item State */
$$(function () {
  $$('.mdui-collapse-item').eq(0).on('close.mdui.collapse', function (e) {
    localStorage.removeItem('mdui-collapse-item-0');
  });
  $$('.mdui-collapse-item').eq(0).on('open.mdui.collapse', function (e) {
    localStorage.setItem('mdui-collapse-item-0', true);
  });
  $$('.mdui-collapse-item').eq(1).on('close.mdui.collapse', function (e) {
    localStorage.removeItem('mdui-collapse-item-1');
  });
  $$('.mdui-collapse-item').eq(1).on('open.mdui.collapse', function (e) {
    localStorage.setItem('mdui-collapse-item-1', true);
  });
  $$('.mdui-collapse-item').eq(2).on('close.mdui.collapse', function (e) {
    localStorage.removeItem('mdui-collapse-item-2');
  });
  $$('.mdui-collapse-item').eq(2).on('open.mdui.collapse', function (e) {
    localStorage.setItem('mdui-collapse-item-2', true);
  });
  $$('.mdui-collapse-item').eq(3).on('close.mdui.collapse', function (e) {
    localStorage.removeItem('mdui-collapse-item-3');
  });
  $$('.mdui-collapse-item').eq(3).on('open.mdui.collapse', function (e) {
    localStorage.setItem('mdui-collapse-item-3', true);
  });
});

/* Search with Web Worker*/
$$(function () {
  if (window.Worker) {
    const scriptUrl = new URL(
      "js/search_ww.js",
      `${window.location.protocol}//${window.location.host}${document.getElementById("theme-base-URL").value}`
    );
    const search_ww = new Worker(scriptUrl.href);
    const $searchInput = document.querySelector('#search .search-form-input');

    search_ww.onmessage = function (e) {
      // search result returned
      // render
      const matchedPosts = e.data;
      const $resultContainer = document.querySelector('.search-result');
      $resultContainer.innerHTML = "";
      const $list = document.createElement('ul');
      $list.classList.add('search-result-list');
      // render datalist with matched posts
      if (matchedPosts && matchedPosts.length) {
        matchedPosts.forEach(function (_, i) {
          const $opt = document.createElement("li");
          const $a = document.createElement('a');
          $a.classList.add('search-result-title');
          $a.href = _.url;
          $a.innerText = _.title;
          $opt.appendChild($a);
          const $p = document.createElement('p');
          $p.classList.add('search-result-content');
          const inputValue = $searchInput.value.trim();
          let html = _.content.trim().replace(/\n/ig, " ").substring(0, 256);
          if (inputValue && inputValue.length) {
            const re = new RegExp(inputValue, 'gi');
            html = html.replace(re, '<em class="search-result-keyword">$&</em>');
          }
          $p.innerHTML = html
          $opt.appendChild($p);
          if (i === 0) {
            // highlight the first matched post by default
            $opt.classList.add("active");
          }
          $list.appendChild($opt);
        });
        $resultContainer.appendChild($list);
      } else {
        $resultContainer.innerHTML = [
          '<ul class="search-result-list">',
          '<li>',
          '<p class="search-result-content">NO post(s) that matched with your input can be found, please try other keywords.</p>',
          '</li>',
          '</ul>'
        ].join('');
      }
    };
    // user typed the search term, delegate to the search web worker
    $searchInput.addEventListener('keyup', function (evt) {
      const options = Array.from(document.querySelectorAll('.search-result-list>li'));
      let activeOptIdx = -1;
      options.some((_, i) => {
        if (_.classList.contains("active")) {
          activeOptIdx = i;
        }
      });
      const keyCode = evt.key;
      if (keyCode === "Enter") {
        // enter button was pressed
        // redirect to the highlight matched post
        const theOpt = options[activeOptIdx].querySelector('a');
        if (theOpt) {
          window.location.href = theOpt.href;
        }
      } else if (keyCode === "ArrowUp" || keyCode === "ArrowDown") {
        if (!(options && options.length && activeOptIdx !== -1)) {
          return; // no matched posts found
        }
        if (keyCode === "ArrowUp") {
          // up arrow button was pressed
          activeOptIdx--;
          if (activeOptIdx < 0) {
            activeOptIdx = options.length - 1;
          }
        } else {
          // down arrow button was pressed
          activeOptIdx = (activeOptIdx + 1) % options.length;
        }
        // highlight selected post by set class 'active'
        options.forEach((_, i) => {
          if (activeOptIdx === i) {
            _.classList.add("active");
          } else {
            _.classList.remove("active");
          }
        });
        document.querySelector('.search-result').scrollTo({
          // height of search input is 50
          top: options[activeOptIdx].offsetTop - 64,
          behavior: "smooth"
        });
      } else {
        // user is typing search term
        // TODO: debounce (actually no need to debounce since the performance is quite good)
        search_ww.postMessage({
          action: "SEARCH",
          data: $searchInput.value
        });
      }
    });
    $$('#search').on('opened.mdui.dialog', function (e) {
      $searchInput.focus();
      $searchInput.value = '';
      search_ww.postMessage({
        action: "SEARCH",
        data: $searchInput.value
      });
    });
    $$(document).on('click', function (e) {
      if ($$(e.target).closest('#search').length <= 0) {
        $$('.search-form-input').val('');
        $$('.search-result').html('');
      }
    });
    setTimeout(function () {
      // initial search web worker with delay
      if (document.getElementById("search-index-file")) {
        const indexFilePath = document.getElementById("search-index-file")
          .value;
        search_ww.postMessage({ action: "INIT", data: indexFilePath });
      }
      // shortcut for showing search form
      document.body.addEventListener("keyup", evt => {
        if (["E", "e"].includes(evt.key)) {
          new mdui.Dialog('#search').open();
        }
      });
    }, 4096);
  }
});

/* Pace */
/*! pace 1.0.0 */
(function () {
  var AjaxMonitor, Bar, DocumentMonitor, ElementMonitor, ElementTracker, EventLagMonitor, Evented, Events, NoTargetError, Pace, RequestIntercept, SOURCE_KEYS, Scaler, SocketRequestTracker, XHRRequestTracker, animation, avgAmplitude, bar, cancelAnimation, cancelAnimationFrame, defaultOptions, extend, extendNative, getFromDOM, getIntercept, handlePushState, ignoreStack, init, now, options, requestAnimationFrame, result, runAnimation, scalers, shouldIgnoreURL, shouldTrack, source, sources, uniScaler, _WebSocket, _XDomainRequest, _XMLHttpRequest, _i, _intercept, _len, _pushState, _ref, _ref1, _replaceState,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function (child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
      }

      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    },
    __indexOf = [].indexOf || function (item) {
      for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item) return i;
      }
      return -1;
    };

  defaultOptions = {
    catchupTime: 100,
    initialRate: .03,
    minTime: 250,
    ghostTime: 100,
    maxProgressPerFrame: 20,
    easeFactor: 1.25,
    startOnPageLoad: true,
    restartOnPushState: true,
    restartOnRequestAfter: 500,
    target: 'body',
    elements: {
      checkInterval: 100,
      selectors: ['body']
    },
    eventLag: {
      minSamples: 10,
      sampleCount: 3,
      lagThreshold: 3
    },
    ajax: {
      trackMethods: ['GET'],
      trackWebSockets: true,
      ignoreURLs: []
    }
  };

  now = function () {
    var _ref;
    return (_ref = typeof performance !== "undefined" && performance !== null ? typeof performance.now === "function" ? performance.now() : void 0 : void 0) != null ? _ref : +(new Date);
  };

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

  if (requestAnimationFrame == null) {
    requestAnimationFrame = function (fn) {
      return setTimeout(fn, 50);
    };
    cancelAnimationFrame = function (id) {
      return clearTimeout(id);
    };
  }

  runAnimation = function (fn) {
    var last, tick;
    last = now();
    tick = function () {
      var diff;
      diff = now() - last;
      if (diff >= 33) {
        last = now();
        return fn(diff, function () {
          return requestAnimationFrame(tick);
        });
      } else {
        return setTimeout(tick, 33 - diff);
      }
    };
    return tick();
  };

  result = function () {
    var args, key, obj;
    obj = arguments[0], key = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (typeof obj[key] === 'function') {
      return obj[key].apply(obj, args);
    } else {
      return obj[key];
    }
  };

  extend = function () {
    var key, out, source, sources, val, _i, _len;
    out = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      if (source) {
        for (key in source) {
          if (!__hasProp.call(source, key)) continue;
          val = source[key];
          if ((out[key] != null) && typeof out[key] === 'object' && (val != null) && typeof val === 'object') {
            extend(out[key], val);
          } else {
            out[key] = val;
          }
        }
      }
    }
    return out;
  };

  avgAmplitude = function (arr) {
    var count, sum, v, _i, _len;
    sum = count = 0;
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      v = arr[_i];
      sum += Math.abs(v);
      count++;
    }
    return sum / count;
  };

  getFromDOM = function (key, json) {
    var data, e, el;
    if (key == null) {
      key = 'options';
    }
    if (json == null) {
      json = true;
    }
    el = document.querySelector("[data-pace-" + key + "]");
    if (!el) {
      return;
    }
    data = el.getAttribute("data-pace-" + key);
    if (!json) {
      return data;
    }
    try {
      return JSON.parse(data);
    } catch (_error) {
      e = _error;
      return typeof console !== "undefined" && console !== null ? console.error("Error parsing inline pace options", e) : void 0;
    }
  };

  Evented = (function () {
    function Evented() { }

    Evented.prototype.on = function (event, handler, ctx, once) {
      var _base;
      if (once == null) {
        once = false;
      }
      if (this.bindings == null) {
        this.bindings = {};
      }
      if ((_base = this.bindings)[event] == null) {
        _base[event] = [];
      }
      return this.bindings[event].push({
        handler: handler,
        ctx: ctx,
        once: once
      });
    };

    Evented.prototype.once = function (event, handler, ctx) {
      return this.on(event, handler, ctx, true);
    };

    Evented.prototype.off = function (event, handler) {
      var i, _ref, _results;
      if (((_ref = this.bindings) != null ? _ref[event] : void 0) == null) {
        return;
      }
      if (handler == null) {
        return delete this.bindings[event];
      } else {
        i = 0;
        _results = [];
        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            _results.push(this.bindings[event].splice(i, 1));
          } else {
            _results.push(i++);
          }
        }
        return _results;
      }
    };

    Evented.prototype.trigger = function () {
      var args, ctx, event, handler, i, once, _ref, _ref1, _results;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if ((_ref = this.bindings) != null ? _ref[event] : void 0) {
        i = 0;
        _results = [];
        while (i < this.bindings[event].length) {
          _ref1 = this.bindings[event][i], handler = _ref1.handler, ctx = _ref1.ctx, once = _ref1.once;
          handler.apply(ctx != null ? ctx : this, args);
          if (once) {
            _results.push(this.bindings[event].splice(i, 1));
          } else {
            _results.push(i++);
          }
        }
        return _results;
      }
    };

    return Evented;

  })();

  Pace = window.Pace || {};

  window.Pace = Pace;

  extend(Pace, Evented.prototype);

  options = Pace.options = extend({}, defaultOptions, window.paceOptions, getFromDOM());

  _ref = ['ajax', 'document', 'eventLag', 'elements'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    source = _ref[_i];
    if (options[source] === true) {
      options[source] = defaultOptions[source];
    }
  }

  NoTargetError = (function (_super) {
    __extends(NoTargetError, _super);

    function NoTargetError() {
      _ref1 = NoTargetError.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return NoTargetError;

  })(Error);

  Bar = (function () {
    function Bar() {
      this.progress = 0;
    }

    Bar.prototype.getElement = function () {
      var targetElement;
      if (this.el == null) {
        targetElement = document.querySelector(options.target);
        if (!targetElement) {
          throw new NoTargetError;
        }
        this.el = document.createElement('div');
        this.el.className = "pace pace-active";
        document.body.className = document.body.className.replace(/pace-done/g, '');
        document.body.className += ' pace-running';
        this.el.innerHTML = '<div class="pace-progress">\n  <div class="pace-progress-inner"></div>\n</div>\n<div class="pace-activity"></div>';
        if (targetElement.firstChild != null) {
          targetElement.insertBefore(this.el, targetElement.firstChild);
        } else {
          targetElement.appendChild(this.el);
        }
      }
      return this.el;
    };

    Bar.prototype.finish = function () {
      var el;
      el = this.getElement();
      el.className = el.className.replace('pace-active', '');
      el.className += ' pace-inactive';
      document.body.className = document.body.className.replace('pace-running', '');
      return document.body.className += ' pace-done';
    };

    Bar.prototype.update = function (prog) {
      this.progress = prog;
      return this.render();
    };

    Bar.prototype.destroy = function () {
      try {
        this.getElement().parentNode.removeChild(this.getElement());
      } catch (_error) {
        NoTargetError = _error;
      }
      return this.el = void 0;
    };

    Bar.prototype.render = function () {
      var el, key, progressStr, transform, _j, _len1, _ref2;
      if (document.querySelector(options.target) == null) {
        return false;
      }
      el = this.getElement();
      transform = "translate3d(" + this.progress + "%, 0, 0)";
      _ref2 = ['webkitTransform', 'msTransform', 'transform'];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        key = _ref2[_j];
        el.children[0].style[key] = transform;
      }
      if (!this.lastRenderedProgress || this.lastRenderedProgress | 0 !== this.progress | 0) {
        el.children[0].setAttribute('data-progress-text', "" + (this.progress | 0) + "%");
        if (this.progress >= 100) {
          progressStr = '99';
        } else {
          progressStr = this.progress < 10 ? "0" : "";
          progressStr += this.progress | 0;
        }
        el.children[0].setAttribute('data-progress', "" + progressStr);
      }
      return this.lastRenderedProgress = this.progress;
    };

    Bar.prototype.done = function () {
      return this.progress >= 100;
    };

    return Bar;

  })();

  Events = (function () {
    function Events() {
      this.bindings = {};
    }

    Events.prototype.trigger = function (name, val) {
      var binding, _j, _len1, _ref2, _results;
      if (this.bindings[name] != null) {
        _ref2 = this.bindings[name];
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          binding = _ref2[_j];
          _results.push(binding.call(this, val));
        }
        return _results;
      }
    };

    Events.prototype.on = function (name, fn) {
      var _base;
      if ((_base = this.bindings)[name] == null) {
        _base[name] = [];
      }
      return this.bindings[name].push(fn);
    };

    return Events;

  })();

  _XMLHttpRequest = window.XMLHttpRequest;

  _XDomainRequest = window.XDomainRequest;

  _WebSocket = window.WebSocket;

  extendNative = function (to, from) {
    var e, key, val, _results;
    _results = [];
    for (key in from.prototype) {
      try {
        val = from.prototype[key];
        if ((to[key] == null) && typeof val !== 'function') {
          _results.push(to[key] = val);
        } else {
          _results.push(void 0);
        }
      } catch (_error) {
        e = _error;
      }
    }
    return _results;
  };

  ignoreStack = [];

  Pace.ignore = function () {
    var args, fn, ret;
    fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    ignoreStack.unshift('ignore');
    ret = fn.apply(null, args);
    ignoreStack.shift();
    return ret;
  };

  Pace.track = function () {
    var args, fn, ret;
    fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    ignoreStack.unshift('track');
    ret = fn.apply(null, args);
    ignoreStack.shift();
    return ret;
  };

  shouldTrack = function (method) {
    var _ref2;
    if (method == null) {
      method = 'GET';
    }
    if (ignoreStack[0] === 'track') {
      return 'force';
    }
    if (!ignoreStack.length && options.ajax) {
      if (method === 'socket' && options.ajax.trackWebSockets) {
        return true;
      } else if (_ref2 = method.toUpperCase(), __indexOf.call(options.ajax.trackMethods, _ref2) >= 0) {
        return true;
      }
    }
    return false;
  };

  RequestIntercept = (function (_super) {
    __extends(RequestIntercept, _super);

    function RequestIntercept() {
      var monitorXHR,
        _this = this;
      RequestIntercept.__super__.constructor.apply(this, arguments);
      monitorXHR = function (req) {
        var _open;
        _open = req.open;
        return req.open = function (type, url, async) {
          if (shouldTrack(type)) {
            _this.trigger('request', {
              type: type,
              url: url,
              request: req
            });
          }
          return _open.apply(req, arguments);
        };
      };
      window.XMLHttpRequest = function (flags) {
        var req;
        req = new _XMLHttpRequest(flags);
        monitorXHR(req);
        return req;
      };
      try {
        extendNative(window.XMLHttpRequest, _XMLHttpRequest);
      } catch (_error) { }
      if (_XDomainRequest != null) {
        window.XDomainRequest = function () {
          var req;
          req = new _XDomainRequest;
          monitorXHR(req);
          return req;
        };
        try {
          extendNative(window.XDomainRequest, _XDomainRequest);
        } catch (_error) { }
      }
      if ((_WebSocket != null) && options.ajax.trackWebSockets) {
        window.WebSocket = function (url, protocols) {
          var req;
          if (protocols != null) {
            req = new _WebSocket(url, protocols);
          } else {
            req = new _WebSocket(url);
          }
          if (shouldTrack('socket')) {
            _this.trigger('request', {
              type: 'socket',
              url: url,
              protocols: protocols,
              request: req
            });
          }
          return req;
        };
        try {
          extendNative(window.WebSocket, _WebSocket);
        } catch (_error) { }
      }
    }

    return RequestIntercept;

  })(Events);

  _intercept = null;

  getIntercept = function () {
    if (_intercept == null) {
      _intercept = new RequestIntercept;
    }
    return _intercept;
  };

  shouldIgnoreURL = function (url) {
    var pattern, _j, _len1, _ref2;
    _ref2 = options.ajax.ignoreURLs;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      pattern = _ref2[_j];
      if (typeof pattern === 'string') {
        if (url.indexOf(pattern) !== -1) {
          return true;
        }
      } else {
        if (pattern.test(url)) {
          return true;
        }
      }
    }
    return false;
  };

  getIntercept().on('request', function (_arg) {
    var after, args, request, type, url;
    type = _arg.type, request = _arg.request, url = _arg.url;
    if (shouldIgnoreURL(url)) {
      return;
    }
    if (!Pace.running && (options.restartOnRequestAfter !== false || shouldTrack(type) === 'force')) {
      args = arguments;
      after = options.restartOnRequestAfter || 0;
      if (typeof after === 'boolean') {
        after = 0;
      }
      return setTimeout(function () {
        var stillActive, _j, _len1, _ref2, _ref3, _results;
        if (type === 'socket') {
          stillActive = request.readyState < 2;
        } else {
          stillActive = (0 < (_ref2 = request.readyState) && _ref2 < 4);
        }
        if (stillActive) {
          Pace.restart();
          _ref3 = Pace.sources;
          _results = [];
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            source = _ref3[_j];
            if (source instanceof AjaxMonitor) {
              source.watch.apply(source, args);
              break;
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }, after);
    }
  });

  AjaxMonitor = (function () {
    function AjaxMonitor() {
      var _this = this;
      this.elements = [];
      getIntercept().on('request', function () {
        return _this.watch.apply(_this, arguments);
      });
    }

    AjaxMonitor.prototype.watch = function (_arg) {
      var request, tracker, type, url;
      type = _arg.type, request = _arg.request, url = _arg.url;
      if (shouldIgnoreURL(url)) {
        return;
      }
      if (type === 'socket') {
        tracker = new SocketRequestTracker(request);
      } else {
        tracker = new XHRRequestTracker(request);
      }
      return this.elements.push(tracker);
    };

    return AjaxMonitor;

  })();

  XHRRequestTracker = (function () {
    function XHRRequestTracker(request) {
      var event, size, _j, _len1, _onreadystatechange, _ref2,
        _this = this;
      this.progress = 0;
      if (window.ProgressEvent != null) {
        size = null;
        request.addEventListener('progress', function (evt) {
          if (evt.lengthComputable) {
            return _this.progress = 100 * evt.loaded / evt.total;
          } else {
            return _this.progress = _this.progress + (100 - _this.progress) / 2;
          }
        }, false);
        _ref2 = ['load', 'abort', 'timeout', 'error'];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          event = _ref2[_j];
          request.addEventListener(event, function () {
            return _this.progress = 100;
          }, false);
        }
      } else {
        _onreadystatechange = request.onreadystatechange;
        request.onreadystatechange = function () {
          var _ref3;
          if ((_ref3 = request.readyState) === 0 || _ref3 === 4) {
            _this.progress = 100;
          } else if (request.readyState === 3) {
            _this.progress = 50;
          }
          return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
        };
      }
    }

    return XHRRequestTracker;

  })();

  SocketRequestTracker = (function () {
    function SocketRequestTracker(request) {
      var event, _j, _len1, _ref2,
        _this = this;
      this.progress = 0;
      _ref2 = ['error', 'open'];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        event = _ref2[_j];
        request.addEventListener(event, function () {
          return _this.progress = 100;
        }, false);
      }
    }

    return SocketRequestTracker;

  })();

  ElementMonitor = (function () {
    function ElementMonitor(options) {
      var selector, _j, _len1, _ref2;
      if (options == null) {
        options = {};
      }
      this.elements = [];
      if (options.selectors == null) {
        options.selectors = [];
      }
      _ref2 = options.selectors;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        selector = _ref2[_j];
        this.elements.push(new ElementTracker(selector));
      }
    }

    return ElementMonitor;

  })();

  ElementTracker = (function () {
    function ElementTracker(selector) {
      this.selector = selector;
      this.progress = 0;
      this.check();
    }

    ElementTracker.prototype.check = function () {
      var _this = this;
      if (document.querySelector(this.selector)) {
        return this.done();
      } else {
        return setTimeout((function () {
          return _this.check();
        }), options.elements.checkInterval);
      }
    };

    ElementTracker.prototype.done = function () {
      return this.progress = 100;
    };

    return ElementTracker;

  })();

  DocumentMonitor = (function () {
    DocumentMonitor.prototype.states = {
      loading: 0,
      interactive: 50,
      complete: 100
    };

    function DocumentMonitor() {
      var _onreadystatechange, _ref2,
        _this = this;
      this.progress = (_ref2 = this.states[document.readyState]) != null ? _ref2 : 100;
      _onreadystatechange = document.onreadystatechange;
      document.onreadystatechange = function () {
        if (_this.states[document.readyState] != null) {
          _this.progress = _this.states[document.readyState];
        }
        return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
      };
    }

    return DocumentMonitor;

  })();

  EventLagMonitor = (function () {
    function EventLagMonitor() {
      var avg, interval, last, points, samples,
        _this = this;
      this.progress = 0;
      avg = 0;
      samples = [];
      points = 0;
      last = now();
      interval = setInterval(function () {
        var diff;
        diff = now() - last - 50;
        last = now();
        samples.push(diff);
        if (samples.length > options.eventLag.sampleCount) {
          samples.shift();
        }
        avg = avgAmplitude(samples);
        if (++points >= options.eventLag.minSamples && avg < options.eventLag.lagThreshold) {
          _this.progress = 100;
          return clearInterval(interval);
        } else {
          return _this.progress = 100 * (3 / (avg + 3));
        }
      }, 50);
    }

    return EventLagMonitor;

  })();

  Scaler = (function () {
    function Scaler(source) {
      this.source = source;
      this.last = this.sinceLastUpdate = 0;
      this.rate = options.initialRate;
      this.catchup = 0;
      this.progress = this.lastProgress = 0;
      if (this.source != null) {
        this.progress = result(this.source, 'progress');
      }
    }

    Scaler.prototype.tick = function (frameTime, val) {
      var scaling;
      if (val == null) {
        val = result(this.source, 'progress');
      }
      if (val >= 100) {
        this.done = true;
      }
      if (val === this.last) {
        this.sinceLastUpdate += frameTime;
      } else {
        if (this.sinceLastUpdate) {
          this.rate = (val - this.last) / this.sinceLastUpdate;
        }
        this.catchup = (val - this.progress) / options.catchupTime;
        this.sinceLastUpdate = 0;
        this.last = val;
      }
      if (val > this.progress) {
        this.progress += this.catchup * frameTime;
      }
      scaling = 1 - Math.pow(this.progress / 100, options.easeFactor);
      this.progress += scaling * this.rate * frameTime;
      this.progress = Math.min(this.lastProgress + options.maxProgressPerFrame, this.progress);
      this.progress = Math.max(0, this.progress);
      this.progress = Math.min(100, this.progress);
      this.lastProgress = this.progress;
      return this.progress;
    };

    return Scaler;

  })();

  sources = null;

  scalers = null;

  bar = null;

  uniScaler = null;

  animation = null;

  cancelAnimation = null;

  Pace.running = false;

  handlePushState = function () {
    if (options.restartOnPushState) {
      return Pace.restart();
    }
  };

  if (window.history.pushState != null) {
    _pushState = window.history.pushState;
    window.history.pushState = function () {
      handlePushState();
      return _pushState.apply(window.history, arguments);
    };
  }

  if (window.history.replaceState != null) {
    _replaceState = window.history.replaceState;
    window.history.replaceState = function () {
      handlePushState();
      return _replaceState.apply(window.history, arguments);
    };
  }

  SOURCE_KEYS = {
    ajax: AjaxMonitor,
    elements: ElementMonitor,
    document: DocumentMonitor,
    eventLag: EventLagMonitor
  };

  (init = function () {
    var type, _j, _k, _len1, _len2, _ref2, _ref3, _ref4;
    Pace.sources = sources = [];
    _ref2 = ['ajax', 'elements', 'document', 'eventLag'];
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      type = _ref2[_j];
      if (options[type] !== false) {
        sources.push(new SOURCE_KEYS[type](options[type]));
      }
    }
    _ref4 = (_ref3 = options.extraSources) != null ? _ref3 : [];
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      source = _ref4[_k];
      sources.push(new source(options));
    }
    Pace.bar = bar = new Bar;
    scalers = [];
    return uniScaler = new Scaler;
  })();

  Pace.stop = function () {
    Pace.trigger('stop');
    Pace.running = false;
    bar.destroy();
    cancelAnimation = true;
    if (animation != null) {
      if (typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(animation);
      }
      animation = null;
    }
    return init();
  };

  Pace.restart = function () {
    Pace.trigger('restart');
    Pace.stop();
    return Pace.start();
  };

  Pace.go = function () {
    var start;
    Pace.running = true;
    bar.render();
    start = now();
    cancelAnimation = false;
    return animation = runAnimation(function (frameTime, enqueueNextFrame) {
      var avg, count, done, element, elements, i, j, remaining, scaler, scalerList, sum, _j, _k, _len1, _len2, _ref2;
      remaining = 100 - bar.progress;
      count = sum = 0;
      done = true;
      for (i = _j = 0, _len1 = sources.length; _j < _len1; i = ++_j) {
        source = sources[i];
        scalerList = scalers[i] != null ? scalers[i] : scalers[i] = [];
        elements = (_ref2 = source.elements) != null ? _ref2 : [source];
        for (j = _k = 0, _len2 = elements.length; _k < _len2; j = ++_k) {
          element = elements[j];
          scaler = scalerList[j] != null ? scalerList[j] : scalerList[j] = new Scaler(element);
          done &= scaler.done;
          if (scaler.done) {
            continue;
          }
          count++;
          sum += scaler.tick(frameTime);
        }
      }
      avg = sum / count;
      bar.update(uniScaler.tick(frameTime, avg));
      if (bar.done() || done || cancelAnimation) {
        bar.update(100);
        Pace.trigger('done');
        return setTimeout(function () {
          bar.finish();
          Pace.running = false;
          return Pace.trigger('hide');
        }, Math.max(options.ghostTime, Math.max(options.minTime - (now() - start), 0)));
      } else {
        return enqueueNextFrame();
      }
    });
  };

  Pace.start = function (_options) {
    extend(options, _options);
    Pace.running = true;
    try {
      bar.render();
    } catch (_error) {
      NoTargetError = _error;
    }
    if (!document.querySelector('.pace')) {
      return setTimeout(Pace.start, 50);
    } else {
      Pace.trigger('start');
      return Pace.go();
    }
  };

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return Pace;
    });
  } else if (typeof exports === 'object') {
    module.exports = Pace;
  } else {
    if (options.startOnPageLoad) {
      Pace.start();
    }
  }

}).call(this);

/** enable clipboard for copy */
$$(function () {
  if (navigator.clipboard) {
    const className_shining = "shining";
    const animationDuration = 4096; // animation-duration: 4.096s;
    const iconfont_check = 'check';
    const iconfont_copy = 'content_copy';

    // append the copy icon to source code blocks
    const copySourceCode = function () {
      const $cpBtn = window.event.currentTarget;
      const sourceCode = $cpBtn.parentElement.nextSibling.querySelector(".code").innerText;
      navigator.clipboard.writeText(sourceCode).then(function () {
        const $icon = $cpBtn.querySelector('.mdui-icon');
        // add the class to trigger the animation
        $icon.classList.add(className_shining);
        // https://css-tricks.com/restart-css-animation/
        void $icon.offsetWidth; // trigger reflow!!!
        // swap the innerText during the animation
        setTimeout(function () {
          $icon.innerText = iconfont_check;
        }, animationDuration / 10);
        setTimeout(function () {
          $icon.innerText = iconfont_copy;
        }, animationDuration / 10 * 9);
        // revert class
        setTimeout(function () {
          $icon.classList.remove(className_shining);
        }, animationDuration);
      });
    };
    const NO_ACTION = 'javascript:;';
    Array.from(
      document.querySelectorAll("#main article figure.highlight")
    ).forEach(function ($fig) {
      const $div = document.createElement('div');
      $div.classList.add('highlight-caption');
      $div.classList.add('mdui-toolbar');
      $div.classList.add('mdui-text-color-theme-icon');
      const $language = document.createElement('div');
      $language.classList.add('language');
      $language.classList.add('mdui-toolbar-spacer');
      $language.innerText = $fig.className.replace('highlight', '').trim();
      $div.appendChild($language);
      const $cpBtn = document.createElement('a');
      $cpBtn.classList.add('mdui-btn');
      $cpBtn.classList.add('mdui-btn-icon');
      $cpBtn.setAttribute('href', NO_ACTION);
      const $fa = document.createElement("i");
      $fa.classList.add("mdui-icon");
      $fa.classList.add("material-icons");
      $fa.classList.add("btn-copy");
      $fa.innerText = iconfont_copy;
      $cpBtn.appendChild($fa);
      $cpBtn.addEventListener("click", copySourceCode);
      // $cpBtn.appendChild(document.createTextNode('Copy'));
      $div.appendChild($cpBtn);
      $fig.parentNode.insertBefore($div, $fig);
    });

    // process for .btn-copy with data-content property (e.g.: reference of current article)
    const $btns = document.querySelectorAll('.btn-copy');
    if ($btns && $btns.length) {
      Array.from($btns).forEach(function ($btn) {
        $btn.addEventListener('click', function () {
          const content = $btn.dataset.content;
          if (content && content.length) {
            navigator.clipboard.writeText(content).then(function () {
              // add the class to trigger the animation
              $btn.classList.add(className_shining);
              // switch icon if success copy
              setTimeout(function () {
                $btn.innerHTML = iconfont_check;
              }, animationDuration / 10);
              setTimeout(function () {
                $btn.innerHTML = iconfont_copy;
              }, animationDuration / 10 * 9);
              // revert class
              setTimeout(function () {
                $btn.classList.remove(className_shining);
              }, animationDuration);
            });
          } else {
            // data-content is not specified.
            // console.info('NOTHING copied!');
          }
        });
      });
    }
  }
});
