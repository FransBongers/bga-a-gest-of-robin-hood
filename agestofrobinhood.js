var Modal = (function () {
    function Modal(id, config) {
        var _this = this;
        this.open = false;
        this.container = 'ebd-body';
        this.class = 'custom_popin';
        this.autoShow = false;
        this.modalTpl = "\n    <div id='popin_${id}_container' class=\"${class}_container\">\n      <div id='popin_${id}_underlay' class=\"${class}_underlay\"></div>\n      <div id='popin_${id}_wrapper' class=\"${class}_wrapper\">\n        <div id=\"popin_${id}\" class=\"${class}\">\n          ${titleTpl}\n          ${closeIconTpl}\n          ${helpIconTpl}\n          ${contentsTpl}\n        </div>\n      </div>\n    </div>\n  ";
        this.closeIcon = 'fa-times-circle';
        this.closeIconTpl = '<a id="popin_${id}_close" class="${class}_closeicon"><i class="fa ${closeIcon} fa-2x" aria-hidden="true"></i></a>';
        this.closeAction = 'destroy';
        this.closeWhenClickOnUnderlay = true;
        this.helpIcon = null;
        this.helpLink = '#';
        this.helpIconTpl = '<a href="${helpLink}" target="_blank" id="popin_${id}_help" class="${class}_helpicon"><i class="fa ${helpIcon} fa-2x" aria-hidden="true"></i></a>';
        this.title = null;
        this.titleTpl = '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>';
        this.contentsTpl = "\n      <div id=\"popin_${id}_contents\" class=\"${class}_contents\">\n        ${contents}\n      </div>";
        this.contents = '';
        this.verticalAlign = 'center';
        this.animationDuration = 500;
        this.fadeIn = true;
        this.fadeOut = true;
        this.openAnimation = false;
        this.openAnimationTarget = null;
        this.openAnimationDelta = 200;
        this.onShow = null;
        this.onHide = null;
        this.statusElt = null;
        this.scale = 1;
        this.breakpoint = null;
        if (id === undefined) {
            console.error('You need an ID to create a modal');
            throw 'You need an ID to create a modal';
        }
        this.id = id;
        Object.entries(config).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (value !== undefined) {
                _this[key] = value;
            }
        });
        this.create();
        if (this.autoShow)
            this.show();
    }
    Modal.prototype.isDisplayed = function () {
        return this.open;
    };
    Modal.prototype.isCreated = function () {
        return this.id != null;
    };
    Modal.prototype.create = function () {
        var _this = this;
        dojo.destroy('popin_' + this.id + '_container');
        var titleTpl = this.title == null ? '' : dojo.string.substitute(this.titleTpl, this);
        var closeIconTpl = this.closeIcon == null ? '' : dojo.string.substitute(this.closeIconTpl, this);
        var helpIconTpl = this.helpIcon == null ? '' : dojo.string.substitute(this.helpIconTpl, this);
        var contentsTpl = dojo.string.substitute(this.contentsTpl, this);
        var modalTpl = dojo.string.substitute(this.modalTpl, {
            id: this.id,
            class: this.class,
            titleTpl: titleTpl,
            closeIconTpl: closeIconTpl,
            helpIconTpl: helpIconTpl,
            contentsTpl: contentsTpl,
        });
        dojo.place(modalTpl, this.container);
        dojo.style('popin_' + this.id + '_container', {
            display: 'none',
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
        });
        dojo.style('popin_' + this.id + '_underlay', {
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
            zIndex: 949,
            opacity: 0,
            backgroundColor: 'white',
        });
        dojo.style('popin_' + this.id + '_wrapper', {
            position: 'fixed',
            left: '0px',
            top: '0px',
            width: 'min(100%,100vw)',
            height: '100vh',
            zIndex: 950,
            opacity: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: this.verticalAlign,
            paddingTop: this.verticalAlign == 'center' ? 0 : '125px',
            transformOrigin: 'top left',
        });
        this.adjustSize();
        this.resizeListener = dojo.connect(window, 'resize', function () { return _this.adjustSize(); });
        if (this.closeIcon != null && $('popin_' + this.id + '_close')) {
            dojo.connect($('popin_' + this.id + '_close'), 'click', function () { return _this[_this.closeAction](); });
        }
        if (this.closeWhenClickOnUnderlay) {
            dojo.connect($('popin_' + this.id + '_underlay'), 'click', function () { return _this[_this.closeAction](); });
            dojo.connect($('popin_' + this.id + '_wrapper'), 'click', function () { return _this[_this.closeAction](); });
            dojo.connect($('popin_' + this.id), 'click', function (evt) { return evt.stopPropagation(); });
        }
    };
    Modal.prototype.updateContent = function (newContent) {
        var contentContainerId = "popin_".concat(this.id, "_contents");
        dojo.empty(contentContainerId);
        dojo.place(newContent, contentContainerId);
    };
    Modal.prototype.adjustSize = function () {
        var bdy = dojo.position(this.container);
        dojo.style('popin_' + this.id + '_container', {
            width: bdy.w + 'px',
            height: bdy.h + 'px',
        });
        if (this.breakpoint != null) {
            var newModalWidth = bdy.w * this.scale;
            var modalScale = newModalWidth / this.breakpoint;
            if (modalScale > 1)
                modalScale = 1;
            dojo.style('popin_' + this.id, {
                transform: "scale(".concat(modalScale, ")"),
                transformOrigin: this.verticalAlign == 'center' ? 'center center' : 'top center',
            });
        }
    };
    Modal.prototype.getOpeningTargetCenter = function () {
        var startTop, startLeft;
        if (this.openAnimationTarget == null) {
            startLeft = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2;
            startTop = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2;
        }
        else {
            var target = dojo.position(this.openAnimationTarget);
            startLeft = target.x + target.w / 2;
            startTop = target.y + target.h / 2;
        }
        return {
            x: startLeft,
            y: startTop,
        };
    };
    Modal.prototype.fadeInAnimation = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var containerId = 'popin_' + _this.id + '_container';
            if (!$(containerId))
                reject();
            if (_this.runningAnimation)
                _this.runningAnimation.stop();
            var duration = _this.fadeIn ? _this.animationDuration : 0;
            var animations = [];
            animations.push(dojo.fadeIn({
                node: 'popin_' + _this.id + '_wrapper',
                duration: duration,
            }));
            animations.push(dojo.animateProperty({
                node: 'popin_' + _this.id + '_underlay',
                duration: duration,
                properties: { opacity: { start: 0, end: 0.7 } },
            }));
            if (_this.openAnimation) {
                var pos = _this.getOpeningTargetCenter();
                animations.push(dojo.animateProperty({
                    node: 'popin_' + _this.id + '_wrapper',
                    properties: {
                        transform: { start: 'scale(0)', end: 'scale(1)' },
                        top: { start: pos.y, end: 0 },
                        left: { start: pos.x, end: 0 },
                    },
                    duration: _this.animationDuration + _this.openAnimationDelta,
                }));
            }
            _this.runningAnimation = dojo.fx.combine(animations);
            dojo.connect(_this.runningAnimation, 'onEnd', function () { return resolve(); });
            _this.runningAnimation.play();
            setTimeout(function () {
                if ($('popin_' + _this.id + '_container'))
                    dojo.style('popin_' + _this.id + '_container', 'display', 'block');
            }, 10);
        });
    };
    Modal.prototype.show = function () {
        var _this = this;
        if (this.isOpening || this.open)
            return;
        if (this.statusElt !== null) {
            dojo.addClass(this.statusElt, 'opened');
        }
        this.adjustSize();
        this.isOpening = true;
        this.isClosing = false;
        this.fadeInAnimation().then(function () {
            if (!_this.isOpening)
                return;
            _this.isOpening = false;
            _this.open = true;
            if (_this.onShow !== null) {
                _this.onShow();
            }
        });
    };
    Modal.prototype.fadeOutAnimation = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var containerId = 'popin_' + _this.id + '_container';
            if (!$(containerId))
                reject();
            if (_this.runningAnimation)
                _this.runningAnimation.stop();
            var duration = _this.fadeOut ? _this.animationDuration + (_this.openAnimation ? _this.openAnimationDelta : 0) : 0;
            var animations = [];
            animations.push(dojo.fadeOut({
                node: 'popin_' + _this.id + '_wrapper',
                duration: duration,
            }));
            animations.push(dojo.animateProperty({
                node: 'popin_' + _this.id + '_underlay',
                duration: duration,
                properties: { opacity: { start: 0.7, end: 0 } },
            }));
            if (_this.openAnimation) {
                var pos = _this.getOpeningTargetCenter();
                animations.push(dojo.animateProperty({
                    node: 'popin_' + _this.id + '_wrapper',
                    properties: {
                        transform: { start: 'scale(1)', end: 'scale(0)' },
                        top: { start: 0, end: pos.y },
                        left: { start: 0, end: pos.x },
                    },
                    duration: _this.animationDuration,
                }));
            }
            _this.runningAnimation = dojo.fx.combine(animations);
            dojo.connect(_this.runningAnimation, 'onEnd', function () { return resolve(); });
            _this.runningAnimation.play();
        });
    };
    Modal.prototype.hide = function () {
        var _this = this;
        if (this.isClosing)
            return;
        this.isClosing = true;
        this.isOpening = false;
        this.fadeOutAnimation().then(function () {
            if (!_this.isClosing || _this.isOpening)
                return;
            _this.isClosing = false;
            _this.open = false;
            dojo.style('popin_' + _this.id + '_container', 'display', 'none');
            if (_this.onHide !== null) {
                _this.onHide();
            }
            if (_this.statusElt !== null) {
                dojo.removeClass(_this.statusElt, 'opened');
            }
        });
    };
    Modal.prototype.destroy = function () {
        var _this = this;
        if (this.isClosing)
            return;
        this.isOpening = false;
        this.isClosing = true;
        this.fadeOutAnimation().then(function () {
            if (!_this.isClosing || _this.isOpening)
                return;
            _this.isClosing = false;
            _this.open = false;
            _this.kill();
        });
    };
    Modal.prototype.kill = function () {
        if (this.runningAnimation)
            this.runningAnimation.stop();
        var underlayId = 'popin_' + this.id + '_container';
        dojo.destroy(underlayId);
        dojo.disconnect(this.resizeListener);
        this.id = null;
        if (this.statusElt !== null) {
            dojo.removeClass(this.statusElt, 'opened');
        }
    };
    return Modal;
}());
var BgaAnimation = (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
function showScreenCenterAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var elementBR = element.getBoundingClientRect();
        var xCenter = (elementBR.left + elementBR.right) / 2;
        var yCenter = (elementBR.top + elementBR.bottom) / 2;
        var x = xCenter - (window.innerWidth / 2);
        var y = yCenter - (window.innerHeight / 2);
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaShowScreenCenterAnimation = (function (_super) {
    __extends(BgaShowScreenCenterAnimation, _super);
    function BgaShowScreenCenterAnimation(settings) {
        return _super.call(this, showScreenCenterAnimation, settings) || this;
    }
    return BgaShowScreenCenterAnimation;
}(BgaAnimation));
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg) scale(").concat((_e = settings.scale) !== null && _e !== void 0 ? _e : 1, ")");
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
function pauseAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a;
        var settings = animation.settings;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        setTimeout(function () { return success(); }, duration);
    });
    return promise;
}
var BgaPauseAnimation = (function (_super) {
    __extends(BgaPauseAnimation, _super);
    function BgaPauseAnimation(settings) {
        return _super.call(this, pauseAnimation, settings) || this;
    }
    return BgaPauseAnimation;
}(BgaAnimation));
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var AnimationManager = (function () {
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    AnimationManager.prototype.play = function (animation) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, _a;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3, 2];
                        settings = animation.settings;
                        (_b = settings.animationStart) === null || _b === void 0 ? void 0 : _b.call(settings, animation);
                        (_c = settings.element) === null || _c === void 0 ? void 0 : _c.classList.add((_d = settings.animationClass) !== null && _d !== void 0 ? _d : 'bga-animations_animated');
                        animation.settings = __assign({ duration: (_h = (_f = (_e = animation.settings) === null || _e === void 0 ? void 0 : _e.duration) !== null && _f !== void 0 ? _f : (_g = this.settings) === null || _g === void 0 ? void 0 : _g.duration) !== null && _h !== void 0 ? _h : 500, scale: (_m = (_k = (_j = animation.settings) === null || _j === void 0 ? void 0 : _j.scale) !== null && _k !== void 0 ? _k : (_l = this.zoomManager) === null || _l === void 0 ? void 0 : _l.zoom) !== null && _m !== void 0 ? _m : undefined }, animation.settings);
                        _a = animation;
                        return [4, animation.animationFunction(this, animation)];
                    case 1:
                        _a.result = _s.sent();
                        (_p = (_o = animation.settings).animationEnd) === null || _p === void 0 ? void 0 : _p.call(_o, animation);
                        (_q = settings.element) === null || _q === void 0 ? void 0 : _q.classList.remove((_r = settings.animationClass) !== null && _r !== void 0 ? _r : 'bga-animations_animated');
                        return [3, 3];
                    case 2: return [2, Promise.resolve(animation)];
                    case 3: return [2];
                }
            });
        });
    };
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3, 3];
                        return [4, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2, __spreadArray([result], others, true)];
                    case 3: return [2, Promise.resolve([])];
                }
            });
        });
    };
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2, promise];
            });
        });
    };
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
var CardStock = (function () {
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock');
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    CardStock.prototype.remove = function () {
        var _a;
        this.manager.removeStock(this);
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
    };
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        var needsCreation = true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
                needsCreation = false;
                if (!updateInformations) {
                    element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
                }
            }
        }
        else if ((_c = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _c === void 0 ? void 0 : _c.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
                needsCreation = false;
            }
        }
        if (needsCreation) {
            var element = this.manager.createCardElement(card, ((_d = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _d !== void 0 ? _d : this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) {
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = fromRect ? this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        }) : Promise.resolve(false);
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.addCards = function (cards_1, animation_1, settings_1) {
        return __awaiter(this, arguments, void 0, function (cards, animation, settings, shift) {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            if (shift === void 0) { shift = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3, 4];
                        if (!cards.length) return [3, 3];
                        return [4, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2, result || others];
                    case 3: return [3, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                setTimeout(function () { return promises.push(_this.addCard(cards[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2, results.some(function (result) { return result; })];
                }
            });
        });
    };
    CardStock.prototype.removeCard = function (card, settings) {
        var promise;
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            promise = this.manager.removeCard(card, settings);
        }
        else {
            promise = Promise.resolve(false);
        }
        this.cardRemoved(card, settings);
        return promise;
    };
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    CardStock.prototype.removeCards = function (cards, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = cards.map(function (card) { return _this.removeCard(card, settings); });
                        return [4, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        return [2, results.some(function (result) { return result; })];
                }
            });
        });
    };
    CardStock.prototype.removeAll = function (settings) {
        var _this = this;
        var cards = this.getCards();
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element || !element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element === null || element === void 0 ? void 0 : element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards();
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement === null || cardElement === void 0 ? void 0 : cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
var SlideAndBackAnimation = (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
var Deck = (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.fakeCardGenerator = (_a = settings === null || settings === void 0 ? void 0 : settings.fakeCardGenerator) !== null && _a !== void 0 ? _a : manager.getFakeCardGenerator();
        _this.thicknesses = (_b = settings.thicknesses) !== null && _b !== void 0 ? _b : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_c = settings.cardNumber) !== null && _c !== void 0 ? _c : 0);
        _this.autoUpdateCardNumber = (_d = settings.autoUpdateCardNumber) !== null && _d !== void 0 ? _d : true;
        _this.autoRemovePreviousCards = (_e = settings.autoRemovePreviousCards) !== null && _e !== void 0 ? _e : true;
        var shadowDirection = (_f = settings.shadowDirection) !== null && _f !== void 0 ? _f : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard);
        }
        else if (settings.cardNumber > 0) {
            _this.addCard(_this.getFakeCard());
        }
        if (settings.counter && ((_g = settings.counter.show) !== null && _g !== void 0 ? _g : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                console.warn("Deck card counter created without a cardNumber");
            }
            _this.createCounter((_h = settings.counter.position) !== null && _h !== void 0 ? _h : 'bottom', (_j = settings.counter.extraClasses) !== null && _j !== void 0 ? _j : 'round', settings.counter.counterId);
            if ((_k = settings.counter) === null || _k === void 0 ? void 0 : _k.hideWhenEmpty) {
                _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
            }
        }
        _this.setCardNumber((_l = settings.cardNumber) !== null && _l !== void 0 ? _l : 0);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = undefined; }
        var promise = topCard === null || cardNumber == 0 ?
            Promise.resolve(false) :
            _super.prototype.addCard.call(this, topCard || this.getFakeCard(), undefined, { autoUpdateCardNumber: false });
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
        return promise;
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1, null);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1);
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    Deck.prototype.shuffle = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var animatedCardsMax, animatedCards, elements, getFakeCard, uid, i, newCard, newElement, pauseDelayAfterAnimation;
            var _this = this;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        animatedCardsMax = (_a = settings === null || settings === void 0 ? void 0 : settings.animatedCardsMax) !== null && _a !== void 0 ? _a : 10;
                        this.addCard((_b = settings === null || settings === void 0 ? void 0 : settings.newTopCard) !== null && _b !== void 0 ? _b : this.getFakeCard(), undefined, { autoUpdateCardNumber: false });
                        if (!this.manager.animationsActive()) {
                            return [2, Promise.resolve(false)];
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3, 4];
                        elements = [this.getCardElement(this.getTopCard())];
                        getFakeCard = function (uid) {
                            var newCard;
                            if (settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter) {
                                newCard = {};
                                settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter(newCard, uid);
                            }
                            else {
                                newCard = _this.fakeCardGenerator("".concat(_this.element.id, "-shuffle-").concat(uid));
                            }
                            return newCard;
                        };
                        uid = 0;
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = void 0;
                            do {
                                newCard = getFakeCard(uid++);
                            } while (this.manager.getCardElement(newCard));
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _d.sent();
                        pauseDelayAfterAnimation = (_c = settings === null || settings === void 0 ? void 0 : settings.pauseDelayAfterAnimation) !== null && _c !== void 0 ? _c : 500;
                        if (!(pauseDelayAfterAnimation > 0)) return [3, 3];
                        return [4, this.manager.animationManager.play(new BgaPauseAnimation({ duration: pauseDelayAfterAnimation }))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [2, true];
                    case 4: return [2, Promise.resolve(false)];
                }
            });
        });
    };
    Deck.prototype.getFakeCard = function () {
        return this.fakeCardGenerator(this.element.id);
    };
    return Deck;
}(CardStock));
var LineStock = (function (_super) {
    __extends(LineStock, _super);
    function LineStock(manager, element, settings) {
        var _a, _b, _c, _d;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
var ManualPositionStock = (function (_super) {
    __extends(ManualPositionStock, _super);
    function ManualPositionStock(manager, element, settings, updateDisplay) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        element.classList.add('manual-position-stock');
        return _this;
    }
    ManualPositionStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    };
    ManualPositionStock.prototype.cardRemoved = function (card, settings) {
        _super.prototype.cardRemoved.call(this, card, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
    };
    return ManualPositionStock;
}(CardStock));
var VoidStock = (function (_super) {
    __extends(VoidStock, _super);
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function () {
                return _this.removeCard(card);
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var CardManager = (function () {
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateMainTimeoutId = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    CardManager.prototype.removeStock = function (stock) {
        var index = this.stocks.indexOf(stock);
        if (index !== -1) {
            this.stocks.splice(index, 1);
        }
    };
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return Promise.resolve(false);
        }
        div.id = "deleted".concat(id);
        div.remove();
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return Promise.resolve(true);
    };
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateMain) !== null && _a !== void 0 ? _a : false) {
            if (this.updateMainTimeoutId[stringId]) {
                clearTimeout(this.updateMainTimeoutId[stringId]);
                delete this.updateMainTimeoutId[stringId];
            }
            var updateMainDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateMainDelay) !== null && _b !== void 0 ? _b : 0;
            if (isVisible && updateMainDelay > 0 && this.animationsActive()) {
                this.updateMainTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element); }, updateMainDelay);
            }
            else {
                (_d = (_c = this.settings).setupDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _e !== void 0 ? _e : true) {
            if (this.updateFrontTimeoutId[stringId]) {
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _f !== void 0 ? _f : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_h = (_g = this.settings).setupFrontDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _j !== void 0 ? _j : false) {
            if (this.updateBackTimeoutId[stringId]) {
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_k = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _k !== void 0 ? _k : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_m = (_l = this.settings).setupBackDiv) === null || _m === void 0 ? void 0 : _m.call(_l, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_o = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _o !== void 0 ? _o : true) {
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardManager.prototype.getFakeCardGenerator = function () {
        var _this = this;
        var _a, _b;
        return (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.fakeCardGenerator) !== null && _b !== void 0 ? _b : (function (deckId) { return ({ id: _this.getId({ id: "".concat(deckId, "-fake-top-card") }) }); });
    };
    return CardManager;
}());
var PlaceForcesState = (function () {
    function PlaceForcesState(game) {
        this.game = game;
    }
    return PlaceForcesState;
}());
var _a;
var MIN_PLAY_AREA_WIDTH = 1500;
var MIN_NOTIFICATION_MS = 1200;
var ENABLED = 'enabled';
var DISABLED = 'disabled';
var GEST_SELECTABLE = 'gest_selectable';
var GEST_SELECTED = 'gest_selected';
var GEST_NONE = 'gest_none';
var DISCARD = 'discard';
var PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY = 'confirmEndOfTurnPlayerSwitchOnly';
var PREF_SHOW_ANIMATIONS = 'showAnimations';
var PREF_ANIMATION_SPEED = 'animationSpeed';
var PREF_CARD_INFO_IN_TOOLTIP = 'cardInfoInTooltip';
var PREF_CARD_SIZE = 'cardSize';
var PREF_CARD_SIZE_IN_LOG = 'cardSizeInLog';
var PREF_DISABLED = 'disabled';
var PREF_ENABLED = 'enabled';
var PREF_SINGLE_COLUMN_MAP_SIZE = 'singleColumnMapSize';
var ROYAL_FAVOUR_MARKER = 'royalFavourMarker';
var ROYAL_INSPECTION_MARKER = 'royalInspectionMarker';
var ROBIN_HOOD_ELIGIBILITY_MARKER = 'robinHoodEligibilityMarker';
var SHERIFF_ELIGIBILITY_MARKER = 'sheriffEligibilityMarker';
var GAME_MAP_MARKERS = [
    ROYAL_FAVOUR_MARKER,
    ROYAL_INSPECTION_MARKER,
    ROBIN_HOOD_ELIGIBILITY_MARKER,
    SHERIFF_ELIGIBILITY_MARKER,
];
var BINGHAM = 'Bingham';
var BLYTH = 'Blyth';
var MANSFIELD = 'Mansfield';
var NEWARK = 'Newark';
var NOTTINGHAM = 'Nottingham';
var OLLERTON_HILL = 'OllertonHill';
var REMSTON = 'Remston';
var RETFORD = 'Retford';
var SHIRE_WOOD = 'ShireWood';
var SOUTHWELL_FOREST = 'SouthwellForest';
var TUXFORD = 'Tuxford';
var PARISHES = [BINGHAM, BLYTH, MANSFIELD, NEWARK, REMSTON, RETFORD, TUXFORD];
var SPACES = [
    BINGHAM,
    BLYTH,
    MANSFIELD,
    NEWARK,
    NOTTINGHAM,
    OLLERTON_HILL,
    REMSTON,
    RETFORD,
    SHIRE_WOOD,
    SOUTHWELL_FOREST,
    TUXFORD,
];
var BLYTH_RETFORD_BORDER = 'Blyth_Retford_border';
var BINGHAM_NEWARK_BORDER = 'Bingham_Newark_border';
var BINGHAM_SOUTHWELL_FOREST_BORDER = 'Bingham_SouthwellForest_border';
var BINGHAM_NOTTINGHAM_BORDER = 'Bingham_Nottingham_border';
var NOTTINGHAM_REMSTON_BORDER = 'Nottingham_Remston_border';
var RIVER_BORDERS = (_a = {},
    _a[BLYTH_RETFORD_BORDER] = [BLYTH, RETFORD],
    _a[BINGHAM_NEWARK_BORDER] = [BINGHAM, NEWARK],
    _a[BINGHAM_SOUTHWELL_FOREST_BORDER] = [BINGHAM, SOUTHWELL_FOREST],
    _a[BINGHAM_NOTTINGHAM_BORDER] = [BINGHAM, NOTTINGHAM],
    _a[NOTTINGHAM_REMSTON_BORDER] = [NOTTINGHAM, REMSTON],
    _a);
var USED_CARRIAGES = 'usedCarriages';
var PRISON = 'prison';
var CAMP = 'Camp';
var MERRY_MEN = 'MerryMen';
var HENCHMEN = 'Henchmen';
var ROBIN_HOOD = 'RobinHood';
var CARRIAGE = 'Carriage';
var TALLAGE_CARRIAGE = 'TallageCarriage';
var TRIBUTE_CARRIAGE = 'TributeCarriage';
var TRAP_CARRIAGE = 'TrapCarriage';
var HIDDEN_CARRIAGE = 'HiddenCarriage';
var CARRIAGE_TYPES = [
    TALLAGE_CARRIAGE,
    TRAP_CARRIAGE,
    TRIBUTE_CARRIAGE,
];
var SINGLE_PLOT = 'singlePlot';
var EVENT = 'event';
var PLOTS_AND_DEEDS = 'plotsAndDeeds';
var FIRST_ELIGIBLE = 'firstEligible';
var SECOND_ELIGIBLE = 'secondEligible';
var PLACE_MERRY_MAN = 'placeMerryMan';
var REPLACE_MERRY_MAN_WITH_CAMP = 'replaceMerryManWithCamp';
var PLACE_TWO_MERRY_MEN = 'placeTwoMerryMen';
var FLIP_ALL_MERRY_MAN_TO_HIDDEN = 'flipAllMerryManToHidden';
var PASSIVE = 'passive';
var REVOLTING = 'revolting';
var SUBMISSIVE = 'submissive';
var REGULAR_EVENTS_POOL = 'regularEventsPool';
var FORTUNE_EVENTS_POOL = 'fortuneEventsPool';
var ROYAL_INSPECTIONS_POOL = 'royalInspectionsPool';
var EVENTS_DECK = 'eventsDeck';
var TRAVELLERS_DECK = 'travellersDeck';
var TRAVELLERS_POOL = 'travellersPool';
var EVENTS_DISCARD = 'eventsDiscard';
var TRAVELLERS_DISCARD = 'travellersDiscard';
var TRAVELLER_ROBBED = 'travellerRobbed';
var TRAVELLERS_VICTIMS_PILE = 'travellersVictimsPile';
var REMOVED_FROM_GAME = 'removedFromGame';
var GAIN_TWO_SHILLINGS = 'gainTwoShillings';
var LIGHT = 'light';
var DARK = 'dark';
var ONE_SPACE = 'oneSpace';
var MONK = 'monk';
var MONK_IDS = [
    'Traveller06_Monks',
    'Traveller07_Monks',
    'Traveller08_Monks',
];
var TRAVELLERS = [
    'RichMerchant',
    'NobleKnight',
    'Monks',
    'ThePotter',
    'TheMillersSon',
    'BishopOfHereford',
    'GuyOfGisborne',
    'RichardAtTheLea',
];
define([
    'dojo',
    'dojo/_base/declare',
    g_gamethemeurl + 'modules/js/vendor/nouislider.min.js',
    'dojo/fx',
    'dojox/fx/ext-dojo/complex',
    'ebg/core/gamegui',
    'ebg/counter',
], function (dojo, declare, noUiSliderDefined) {
    if (noUiSliderDefined) {
        noUiSlider = noUiSliderDefined;
    }
    return declare('bgagame.agestofrobinhood', ebg.core.gamegui, new AGestOfRobinHood());
});
function sleep(ms) {
    return new Promise(function (r) { return setTimeout(r, ms); });
}
var AGestOfRobinHood = (function () {
    function AGestOfRobinHood() {
        this.tooltipsToMap = [];
        this._helpMode = false;
        this._last_notif = null;
        this._last_tooltip_id = 0;
        this._notif_uid_to_log_id = {};
        this._notif_uid_to_mobile_log_id = {};
        this._selectableNodes = [];
        console.log('agestofrobinhood constructor');
    }
    AGestOfRobinHood.prototype.setup = function (gamedatas) {
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        this.setAlwaysFixTopActions();
        this.setupDontPreloadImages();
        this.gamedatas = gamedatas;
        debug('gamedatas', gamedatas);
        this._connections = [];
        this.activeStates = {
            confirmPartialTurn: new ConfirmPartialTurnState(this),
            confirmTurn: new ConfirmTurnState(this),
            capture: new CaptureState(this),
            chooseAction: new ChooseActionState(this),
            confiscate: new ConfiscateState(this),
            disperse: new DisperseState(this),
            donate: new DonateState(this),
            eventATaleOfTwoLoversLight: new EventATaleOfTwoLoversLightState(this),
            eventAmbushLight: new EventAmbushLightState(this),
            eventBoatsBridgesDark: new EventBoatsBridgesDarkState(this),
            eventBoatsBridgesLight: new EventBoatsBridgesLightState(this),
            eventGuyOfGisborne: new EventGuyOfGisborneState(this),
            eventMaidMarianDark: new EventMaidMarianDarkState(this),
            eventReplaceHenchmen: new EventReplaceHenchmenState(this),
            eventRoyalPardonLight: new EventRoyalPardonLightState(this),
            eventSelectForces: new EventSelectForcesState(this),
            eventSelectSpace: new EventSelectSpaceState(this),
            eventWillStutelyLight: new EventWillStutelyLightState(this),
            fortuneEventDayOfMarketRobinHood: new FortuneEventDayOfMarketRobinHoodState(this),
            fortuneEventDayOfMarketSheriff: new FortuneEventDayOfMarketSheriffState(this),
            fortuneEventQueenEleanor: new FortuneEventQueenEleanorState(this),
            hire: new HireState(this),
            inspire: new InspireState(this),
            moveCarriage: new MoveCarriageState(this),
            patrol: new PatrolState(this),
            placeHenchmen: new PlaceHenchmenState(this),
            placeMerryManInSpace: new PlaceMerryManInSpaceState(this),
            recruit: new RecruitState(this),
            ride: new RideState(this),
            removeCamp: new RemoveCampState(this),
            removeTraveller: new RemoveTravellerState(this),
            rob: new RobState(this),
            royalInspectionPlaceRobinHood: new RoyalInspectionPlaceRobinHoodState(this),
            royalInspectionRedeploymentRobinHood: new RoyalInspectionRedeploymentRobinHoodState(this),
            royalInspectionRedeploymentSheriff: new RoyalInspectionRedeploymentSheriffState(this),
            royalInspectionReturnMerryMenFromPrison: new RoyalInspectionReturnMerryMenFromPrisonState(this),
            royalInspectionSwapRobinHood: new RoyalInspectionSwapRobinHoodState(this),
            selectDeed: new SelectDeedState(this),
            selectEventEffect: new SelectEventEffectState(this),
            selectPlot: new SelectPlotState(this),
            selectTravellerCardOption: new SelectTravellerCardOptionState(this),
            setupRobinHood: new SetupRobinHoodState(this),
            sneak: new SneakState(this),
            swashbuckle: new SwashbuckleState(this),
            turncoat: new TurncoatState(this),
        };
        this.tooltipManager = new TooltipManager(this);
        this.playerManager = new PlayerManager(this);
        this.infoPanel = new InfoPanel(this);
        this.informationModal = new InformationModal(this);
        this.settings = new Settings(this);
        this.animationManager = new AnimationManager(this, {
            duration: this.settings.get({ id: PREF_SHOW_ANIMATIONS }) === DISABLED
                ? 0
                : 2100 - this.settings.get({ id: PREF_ANIMATION_SPEED }),
        });
        this.cardManager = new GestCardManager(this);
        this.forceManager = new ForceManager(this);
        this.markerManager = new MarkerManager(this);
        this.gameMap = new GameMap(this);
        this.cardArea = new CardArea(this);
        if (this.notificationManager != undefined) {
            this.notificationManager.destroy();
        }
        this.notificationManager = new NotificationManager(this);
        this.notificationManager.setupNotifications();
        this.tooltipManager.setupTooltips();
        debug('Ending game setup');
    };
    AGestOfRobinHood.prototype.setupPlayerOrder = function (_a) {
        var playerOrder = _a.playerOrder;
        var currentPlayerId = this.getPlayerId();
        var isInGame = playerOrder.includes(currentPlayerId);
        if (isInGame) {
            while (playerOrder[0] !== currentPlayerId) {
                var firstItem = playerOrder.shift();
                playerOrder.push(firstItem);
            }
        }
        this.playerOrder = playerOrder;
    };
    AGestOfRobinHood.prototype.setupDontPreloadImages = function () { };
    AGestOfRobinHood.prototype.onEnteringState = function (stateName, args) {
        var _this = this;
        console.log('Entering state: ' + stateName, args);
        if (this.framework().isCurrentPlayerActive() &&
            this.activeStates[stateName]) {
            this.activeStates[stateName].onEnteringState(args.args);
        }
        else if (this.activeStates[stateName]) {
            this.activeStates[stateName].setDescription(Number(args.active_player), args.args);
        }
        if (args.args && args.args.previousSteps) {
            args.args.previousSteps.forEach(function (stepId) {
                var logEntry = $('logs').querySelector(".log.notif_newUndoableStep[data-step=\"".concat(stepId, "\"]"));
                if (logEntry) {
                    _this.onClick(logEntry, function () { return _this.undoToStep({ stepId: stepId }); });
                }
                logEntry = document.querySelector(".chatwindowlogs_zone .log.notif_newUndoableStep[data-step=\"".concat(stepId, "\"]"));
                if (logEntry) {
                    _this.onClick(logEntry, function () { return _this.undoToStep({ stepId: stepId }); });
                }
            });
        }
    };
    AGestOfRobinHood.prototype.onLeavingState = function (stateName) {
        this.clearPossible();
    };
    AGestOfRobinHood.prototype.onUpdateActionButtons = function (stateName, args) {
    };
    AGestOfRobinHood.prototype.addActionButtonClient = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses, _b = _a.color, color = _b === void 0 ? 'none' : _b;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, color);
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    AGestOfRobinHood.prototype.addCancelButton = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, callback = _b.callback;
        this.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                if (callback) {
                    callback();
                }
                _this.onCancel();
            },
        });
    };
    AGestOfRobinHood.prototype.addConfirmButton = function (_a) {
        var callback = _a.callback;
        this.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: callback,
        });
    };
    AGestOfRobinHood.prototype.addPassButton = function (_a) {
        var _this = this;
        var optionalAction = _a.optionalAction, text = _a.text;
        if (optionalAction) {
            this.addSecondaryActionButton({
                id: 'pass_btn',
                text: text ? _(text) : _('Pass'),
                callback: function () {
                    return _this.takeAction({
                        action: 'actPassOptionalAction',
                        atomicAction: false,
                    });
                },
            });
        }
    };
    AGestOfRobinHood.prototype.addPlayerButton = function (_a) {
        var player = _a.player, callback = _a.callback;
        var id = "select_".concat(player.id);
        this.addPrimaryActionButton({
            id: id,
            text: player.name,
            callback: callback,
        });
        var node = document.getElementById(id);
        node.style.backgroundColor = "#".concat(player.color);
    };
    AGestOfRobinHood.prototype.addPrimaryActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'blue');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    AGestOfRobinHood.prototype.addSecondaryActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'gray');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    AGestOfRobinHood.prototype.addDangerActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'red');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    AGestOfRobinHood.prototype.addUndoButtons = function (_a) {
        var _this = this;
        var previousSteps = _a.previousSteps, previousEngineChoices = _a.previousEngineChoices;
        var lastStep = Math.max.apply(Math, __spreadArray([0], previousSteps, false));
        if (lastStep > 0) {
            this.addDangerActionButton({
                id: 'undo_last_step_btn',
                text: _('Undo last step'),
                callback: function () {
                    return _this.takeAction({
                        action: 'actUndoToStep',
                        args: {
                            stepId: lastStep,
                        },
                        checkAction: 'actRestart',
                        atomicAction: false,
                    });
                },
            });
        }
        if (previousEngineChoices > 0) {
            this.addDangerActionButton({
                id: 'restart_btn',
                text: _('Restart turn'),
                callback: function () {
                    return _this.takeAction({ action: 'actRestart', atomicAction: false });
                },
            });
        }
    };
    AGestOfRobinHood.prototype.clearInterface = function () {
        this.playerManager.clearInterface();
        this.gameMap.clearInterface();
    };
    AGestOfRobinHood.prototype.clearPossible = function () {
        this.framework().removeActionButtons();
        dojo.empty('customActions');
        dojo.forEach(this._connections, dojo.disconnect);
        this._connections = [];
        this._selectableNodes.forEach(function (node) {
            if ($(node))
                dojo.removeClass(node, 'selectable selected');
        });
        this._selectableNodes = [];
        dojo.query(".".concat(GEST_SELECTABLE)).removeClass(GEST_SELECTABLE);
        dojo.query(".".concat(GEST_SELECTED)).removeClass(GEST_SELECTED);
        this.gameMap.clearSelectable();
    };
    AGestOfRobinHood.prototype.getPlayerId = function () {
        return Number(this.framework().player_id);
    };
    AGestOfRobinHood.prototype.getCurrentPlayer = function () {
        return this.playerManager.getPlayer({ playerId: this.getPlayerId() });
    };
    AGestOfRobinHood.prototype.framework = function () {
        return this;
    };
    AGestOfRobinHood.prototype.onCancel = function () {
        this.clearPossible();
        this.framework().restoreServerGameState();
    };
    AGestOfRobinHood.prototype.clientUpdatePageTitle = function (_a) {
        var text = _a.text, args = _a.args, _b = _a.nonActivePlayers, nonActivePlayers = _b === void 0 ? false : _b;
        var title = this.format_string_recursive(_(text), args);
        if (nonActivePlayers) {
            this.gamedatas.gamestate.description = title;
        }
        else {
            this.gamedatas.gamestate.descriptionmyturn = title;
        }
        this.framework().updatePageTitle();
    };
    AGestOfRobinHood.prototype.setCardSelectable = function (_a) {
        var id = _a.id, callback = _a.callback;
        var node = $(id);
        if (node === null) {
            return;
        }
        node.classList.add(GEST_SELECTABLE);
        this._connections.push(dojo.connect(node, 'onclick', this, function (event) {
            return callback(event);
        }));
    };
    AGestOfRobinHood.prototype.setCardSelected = function (_a) {
        var id = _a.id;
        var node = $(id);
        if (node === null) {
            return;
        }
        node.classList.add(GEST_SELECTED);
    };
    AGestOfRobinHood.prototype.setLocationSelectable = function (_a) {
        var id = _a.id, callback = _a.callback;
        var node = $(id);
        if (node === null) {
            return;
        }
        node.classList.add(GEST_SELECTABLE);
        this._connections.push(dojo.connect(node, 'onclick', this, function (event) {
            return callback(event);
        }));
    };
    AGestOfRobinHood.prototype.setLocationSelected = function (_a) {
        var id = _a.id;
        var node = $(id);
        if (node === null) {
            return;
        }
        node.classList.add(GEST_SELECTED);
    };
    AGestOfRobinHood.prototype.setSpaceSelectable = function (_a) {
        var id = _a.id, callback = _a.callback;
        var container = document.getElementById('gest_map_spaces');
        container.classList.add(GEST_SELECTABLE);
        var node = document.getElementById("gest_map_space_".concat(id));
        if (!node) {
            return;
        }
        node.classList.add(GEST_SELECTABLE);
        this._connections.push(dojo.connect(node, 'onclick', this, function (event) {
            return callback(event);
        }));
    };
    AGestOfRobinHood.prototype.setSpaceSelected = function (_a) {
        var id = _a.id;
        var node = document.getElementById("gest_map_space_".concat(id));
        if (node === null) {
            return;
        }
        node.classList.add(GEST_SELECTED);
    };
    AGestOfRobinHood.prototype.setElementSelectable = function (_a) {
        var id = _a.id, callback = _a.callback;
        var node = $(id);
        if (node === null) {
            return;
        }
        node.classList.add(GEST_SELECTABLE);
        this._connections.push(dojo.connect(node, 'onclick', this, function (event) {
            return callback(event);
        }));
    };
    AGestOfRobinHood.prototype.setElementSelected = function (_a) {
        var id = _a.id;
        var node = $(id);
        if (node === null) {
            return;
        }
        node.classList.add(GEST_SELECTED);
    };
    AGestOfRobinHood.prototype.removeSelectedFromElement = function (_a) {
        var id = _a.id;
        var node = $(id);
        if (node === null) {
            return;
        }
        node.classList.remove(GEST_SELECTED);
    };
    AGestOfRobinHood.prototype.getStaticCardData = function (_a) {
        var cardId = _a.cardId;
        return this.gamedatas.staticData.cards[cardId.split('_')[0]];
    };
    AGestOfRobinHood.prototype.connect = function (node, action, callback) {
        this._connections.push(dojo.connect($(node), action, callback));
    };
    AGestOfRobinHood.prototype.onClick = function (node, callback, temporary) {
        var _this = this;
        if (temporary === void 0) { temporary = true; }
        var safeCallback = function (evt) {
            evt.stopPropagation();
            if (_this.framework().isInterfaceLocked()) {
                return false;
            }
            if (_this._helpMode) {
                return false;
            }
            callback(evt);
        };
        if (temporary) {
            this.connect($(node), 'click', safeCallback);
            dojo.removeClass(node, 'unselectable');
            dojo.addClass(node, 'selectable');
            this._selectableNodes.push(node);
        }
        else {
            dojo.connect($(node), 'click', safeCallback);
        }
    };
    AGestOfRobinHood.prototype.undoToStep = function (_a) {
        var stepId = _a.stepId;
        this.takeAction({
            action: 'actUndoToStep',
            atomicAction: false,
            args: {
                stepId: stepId,
            },
            checkAction: 'actRestart',
        });
    };
    AGestOfRobinHood.prototype.updateLayout = function () {
        if (!this.settings) {
            return;
        }
        $('play_area_container').setAttribute('data-two-columns', this.settings.get({ id: 'twoColumnsLayout' }));
        var ROOT = document.documentElement;
        var WIDTH = $('play_area_container').getBoundingClientRect()['width'] - 8;
        var LEFT_COLUMN = 1500;
        var RIGHT_COLUMN = 634;
        if (this.settings.get({ id: 'twoColumnsLayout' }) === PREF_ENABLED) {
            WIDTH = WIDTH - 8;
            var size = Number(this.settings.get({ id: 'columnSizes' }));
            var proportions = [size, 100 - size];
            var LEFT_SIZE = (proportions[0] * WIDTH) / 100;
            var leftColumnScale = LEFT_SIZE / LEFT_COLUMN;
            ROOT.style.setProperty('--leftColumnScale', "".concat(leftColumnScale));
            ROOT.style.setProperty('--mapSizeMultiplier', '1');
            var RIGHT_SIZE = (proportions[1] * WIDTH) / 100;
            var rightColumnScale = RIGHT_SIZE / RIGHT_COLUMN;
            ROOT.style.setProperty('--rightColumnScale', "".concat(rightColumnScale));
            $('play_area_container').style.gridTemplateColumns = "".concat(LEFT_SIZE, "px ").concat(RIGHT_SIZE, "px");
        }
        else {
            var LEFT_SIZE = WIDTH;
            var leftColumnScale = LEFT_SIZE / LEFT_COLUMN;
            ROOT.style.setProperty('--leftColumnScale', "".concat(leftColumnScale));
            ROOT.style.setProperty('--mapSizeMultiplier', "".concat(Number(this.settings.get({ id: PREF_SINGLE_COLUMN_MAP_SIZE })) / 100));
            var RIGHT_SIZE = WIDTH;
            var rightColumnScale = RIGHT_SIZE / RIGHT_COLUMN;
            ROOT.style.setProperty('--rightColumnScale', "".concat(rightColumnScale));
        }
    };
    AGestOfRobinHood.prototype.onAddingNewUndoableStepToLog = function (notif) {
        var _this = this;
        var _a;
        if (!$("log_".concat(notif.logId)))
            return;
        var stepId = notif.msg.args.stepId;
        $("log_".concat(notif.logId)).dataset.step = stepId;
        if ($("dockedlog_".concat(notif.mobileLogId)))
            $("dockedlog_".concat(notif.mobileLogId)).dataset.step = stepId;
        if ((_a = this.gamedatas.gamestate.args.previousSteps) === null || _a === void 0 ? void 0 : _a.includes(Number(stepId))) {
            this.onClick($("log_".concat(notif.logId)), function () { return _this.undoToStep({ stepId: stepId }); });
            if ($("dockedlog_".concat(notif.mobileLogId)))
                this.onClick($("dockedlog_".concat(notif.mobileLogId)), function () {
                    return _this.undoToStep({ stepId: stepId });
                });
        }
    };
    AGestOfRobinHood.prototype.onScreenWidthChange = function () {
        this.updateLayout();
    };
    AGestOfRobinHood.prototype.format_string_recursive = function (log, args) {
        var _this = this;
        try {
            if (log && args && !args.processed) {
                args.processed = true;
                Object.entries(args).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    if (key.startsWith('tkn_')) {
                        args[key] = getTokenDiv({
                            key: key,
                            value: value,
                            game: _this,
                        });
                    }
                });
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        return this.inherited(arguments);
    };
    AGestOfRobinHood.prototype.onPlaceLogOnChannel = function (msg) {
        var currentLogId = this.framework().notifqueue.next_log_id;
        var currentMobileLogId = this.framework().next_log_id;
        var res = this.framework().inherited(arguments);
        this._notif_uid_to_log_id[msg.uid] = currentLogId;
        this._notif_uid_to_mobile_log_id[msg.uid] = currentMobileLogId;
        this._last_notif = {
            logId: currentLogId,
            mobileLogId: currentMobileLogId,
            msg: msg,
        };
        return res;
    };
    AGestOfRobinHood.prototype.checkLogCancel = function (notifId) {
        if (this.gamedatas.canceledNotifIds != null &&
            this.gamedatas.canceledNotifIds.includes(notifId)) {
            this.cancelLogs([notifId]);
        }
    };
    AGestOfRobinHood.prototype.cancelLogs = function (notifIds) {
        var _this = this;
        notifIds.forEach(function (uid) {
            if (_this._notif_uid_to_log_id.hasOwnProperty(uid)) {
                var logId = _this._notif_uid_to_log_id[uid];
                if ($('log_' + logId))
                    dojo.addClass('log_' + logId, 'cancel');
            }
            if (_this._notif_uid_to_mobile_log_id.hasOwnProperty(uid)) {
                var mobileLogId = _this._notif_uid_to_mobile_log_id[uid];
                if ($('dockedlog_' + mobileLogId))
                    dojo.addClass('dockedlog_' + mobileLogId, 'cancel');
            }
        });
    };
    AGestOfRobinHood.prototype.addLogClass = function () {
        var _a;
        if (this._last_notif == null) {
            return;
        }
        var notif = this._last_notif;
        var type = notif.msg.type;
        if (type == 'history_history') {
            type = notif.msg.args.originalType;
        }
        if ($('log_' + notif.logId)) {
            dojo.addClass('log_' + notif.logId, 'notif_' + type);
            var methodName = 'onAdding' + type.charAt(0).toUpperCase() + type.slice(1) + 'ToLog';
            (_a = this[methodName]) === null || _a === void 0 ? void 0 : _a.call(this, notif);
        }
        if ($('dockedlog_' + notif.mobileLogId)) {
            dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
        }
        while (this.tooltipsToMap.length) {
            var tooltipToMap = this.tooltipsToMap.pop();
            if (!tooltipToMap || !tooltipToMap[1]) {
                console.error('error tooltipToMap', tooltipToMap);
            }
            else {
                this.addLogTooltip({
                    tooltipId: tooltipToMap[0],
                    cardId: tooltipToMap[1],
                });
            }
        }
    };
    AGestOfRobinHood.prototype.addLogTooltip = function (_a) {
        var tooltipId = _a.tooltipId, cardId = _a.cardId;
        this.tooltipManager.addCardTooltip({
            nodeId: "gest_tooltip_".concat(tooltipId),
            cardId: cardId,
        });
    };
    AGestOfRobinHood.prototype.updateLogTooltips = function () {
    };
    AGestOfRobinHood.prototype.setLoader = function (value, max) {
        this.framework().inherited(arguments);
        if (!this.framework().isLoadingComplete && value >= 100) {
            this.framework().isLoadingComplete = true;
            this.onLoadingComplete();
        }
    };
    AGestOfRobinHood.prototype.onLoadingComplete = function () {
        this.cancelLogs(this.gamedatas.canceledNotifIds);
        this.updateLayout();
    };
    AGestOfRobinHood.prototype.updatePlayerOrdering = function () {
        this.framework().inherited(arguments);
        var container = document.getElementById('player_boards');
        var infoPanel = document.getElementById('info_panel');
        if (!container) {
            return;
        }
        container.insertAdjacentElement('afterbegin', infoPanel);
    };
    AGestOfRobinHood.prototype.setAlwaysFixTopActions = function (alwaysFixed, maximum) {
        if (alwaysFixed === void 0) { alwaysFixed = true; }
        if (maximum === void 0) { maximum = 30; }
        this.alwaysFixTopActions = alwaysFixed;
        this.alwaysFixTopActionsMaximum = maximum;
        this.adaptStatusBar();
    };
    AGestOfRobinHood.prototype.adaptStatusBar = function () {
        this.inherited(arguments);
        if (this.alwaysFixTopActions) {
            var afterTitleElem = document.getElementById('after-page-title');
            var titleElem = document.getElementById('page-title');
            var zoom = getComputedStyle(titleElem).zoom;
            if (!zoom) {
                zoom = 1;
            }
            var titleRect = afterTitleElem.getBoundingClientRect();
            if (titleRect.top < 0 &&
                titleElem.offsetHeight <
                    (window.innerHeight * this.alwaysFixTopActionsMaximum) / 100) {
                var afterTitleRect = afterTitleElem.getBoundingClientRect();
                titleElem.classList.add('fixed-page-title');
                titleElem.style.width = (afterTitleRect.width - 10) / zoom + 'px';
                afterTitleElem.style.height = titleRect.height + 'px';
            }
            else {
                titleElem.classList.remove('fixed-page-title');
                titleElem.style.width = 'auto';
                afterTitleElem.style.height = '0px';
            }
        }
    };
    AGestOfRobinHood.prototype.actionError = function (actionName) {
        this.framework().showMessage("cannot take ".concat(actionName, " action"), 'error');
    };
    AGestOfRobinHood.prototype.takeAction = function (_a) {
        var action = _a.action, _b = _a.atomicAction, atomicAction = _b === void 0 ? true : _b, _c = _a.args, args = _c === void 0 ? {} : _c, checkAction = _a.checkAction;
        var actionName = atomicAction ? action : undefined;
        if (!this.framework().checkAction(checkAction || action)) {
            this.actionError(action);
            return;
        }
        var data = {
            lock: true,
            actionName: actionName,
            args: JSON.stringify(args),
        };
        var gameName = this.framework().game_name;
        this.framework().ajaxcall("/".concat(gameName, "/").concat(gameName, "/").concat(atomicAction ? 'actTakeAtomicAction' : action, ".html"), data, this, function () { });
    };
    return AGestOfRobinHood;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var debug = isDebug ? console.info.bind(window.console) : function () { };
var capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
var lowerCaseFirstLetter = function (string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
};
var CardArea = (function () {
    function CardArea(game) {
        this.game = game;
        var gamedatas = game.gamedatas;
        this.setupCardArea({ gamedatas: gamedatas });
    }
    CardArea.prototype.clearInterface = function () { };
    CardArea.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
        this.updateCounters({ gamedatas: gamedatas });
    };
    CardArea.prototype.setupStocks = function (_a) {
        var gamedatas = _a.gamedatas;
        this.stocks = {
            eventsDeck: new ManualPositionStock(this.game.cardManager, document.getElementById('gest_events_deck'), {}, this.game.cardManager.updateDisplay),
            eventsDiscard: new ManualPositionStock(this.game.cardManager, document.getElementById('gest_events_discard'), {}, this.game.cardManager.updateDisplay),
            travellerRobbed: new ManualPositionStock(this.game.cardManager, document.getElementById('gest_traveller_robbed'), {}, this.game.cardManager.updateDisplay),
        };
        this.updateCards({ gamedatas: gamedatas });
    };
    CardArea.prototype.updateCards = function (_a) {
        var gamedatas = _a.gamedatas;
        if (gamedatas.cards.eventsDiscard) {
            this.stocks.eventsDiscard.addCard(gamedatas.cards.eventsDiscard);
        }
        if (gamedatas.cards.travellerRobbed) {
            this.stocks.travellerRobbed.addCard(gamedatas.cards.travellerRobbed);
        }
    };
    CardArea.prototype.setupCounters = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.counters = {
            travellersDeck: new ebg.counter(),
            travellersDiscard: new ebg.counter(),
            travellersInDeck: {},
            victimsPile: new ebg.counter(),
        };
        this.counters.travellersDeck.create('gest_travellers_deck_counter');
        this.counters.travellersDiscard.create('gest_travellers_discard_counter');
        this.counters.victimsPile.create('gest_victims_pile_counter');
        TRAVELLERS.forEach(function (traveller) {
            _this.counters.travellersInDeck[traveller] = new ebg.counter();
            _this.counters.travellersInDeck[traveller].create("gest_traveller_".concat(traveller, "_counter"));
        });
        this.updateCounters({ gamedatas: gamedatas });
    };
    CardArea.prototype.updateCounters = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.counters.travellersDeck.setValue(gamedatas.cards.counts.travellersDeck);
        this.counters.travellersDiscard.setValue(gamedatas.cards.counts.travellersDiscard);
        this.counters.victimsPile.setValue(gamedatas.cards.counts.travellersVictimsPile);
        Object.entries(gamedatas.cards.counts.travellers).forEach(function (_a) {
            var traveller = _a[0], count = _a[1];
            _this.setTravellerInDeckCounterValue(traveller, count);
        });
    };
    CardArea.prototype.setupCardArea = function (_a) {
        var gamedatas = _a.gamedatas;
        document
            .getElementById('play_area_container')
            .insertAdjacentHTML('beforeend', tplCardArea());
        var cardScale = this.game.settings.get({
            id: PREF_CARD_SIZE,
        });
        var node = document.getElementById('gest_card_area');
        if (node) {
            node.style.setProperty('--gestCardSizeScale', "".concat(Number(cardScale) / 100));
        }
        this.setupStocks({ gamedatas: gamedatas });
        this.setupCounters({ gamedatas: gamedatas });
        this.game.infoPanel.setupPlotsAndDeedsInfo();
        this.game.tooltipManager.addTravellersTooltips();
    };
    CardArea.prototype.updateTooltips = function () {
        var _this = this;
        var cards = __spreadArray(__spreadArray([], this.stocks.eventsDiscard.getCards(), true), this.stocks.travellerRobbed.getCards(), true);
        cards.forEach(function (card) {
            var cardId = card.id.split('_')[0];
            _this.game.tooltipManager.removeTooltip(cardId);
            _this.game.tooltipManager.addCardTooltip({
                nodeId: cardId,
                cardId: cardId,
            });
        });
    };
    CardArea.prototype.setTravellerInDeckCounterValue = function (traveller, value) {
        this.counters.travellersInDeck[traveller].setValue(value);
        var node = document.getElementById("gest_traveller_".concat(traveller, "_counter_row"));
        if (!node) {
            return;
        }
        if (value === 0) {
            node.classList.add(GEST_NONE);
        }
        else {
            node.classList.remove(GEST_NONE);
        }
    };
    CardArea.prototype.incTravellerInDeckCounterValue = function (traveller, value) {
        var counter = this.counters.travellersInDeck[traveller];
        counter.incValue(value);
        var node = document.getElementById("gest_traveller_".concat(traveller, "_counter_row"));
        if (!node) {
            return;
        }
        var counterValue = this.counters.travellersInDeck[traveller].getValue();
        if (counterValue === 0) {
            node.classList.add(GEST_NONE);
        }
        else {
            node.classList.remove(GEST_NONE);
        }
    };
    return CardArea;
}());
var travellerCardIdMap = {
    RichMerchant: 'Traveller01'
};
var travellersDeckCounter = function (traveller) { return "\n  <div class=\"travellers_deck_counter_container\">\n    <span id=\"travellers_deck_".concat(traveller, "_counter\"></span>\n    <div class=\"gest_card_side\" data-card-id=\"").concat(travellerCardIdMap[traveller], "\" style=\"width: 21px; height: 36px;\"></div>\n  </div>\n"); };
var tplTravellers = function () { return "\n<div>\n  <span class=\"gest_title\">".concat(_('Travellers'), "</span>\n  <div class=\"gest_card_row\">\n    <div id=\"gest_travellers_decks_info\">\n      <div class=\"gest_traveller_counter_row\">\n        <span>").concat(_('Deck: '), "</span><span id=\"gest_travellers_deck_counter\" style=\"margin-left: auto;\"></span>\n      </div>\n      <div>\n        <div id=\"gest_travellers_deck_composition\">\n          ").concat(getTravellersConfig().map(function (config) { return "\n              <div id=\"gest_traveller_".concat(config.image, "_counter_row\" class=\"gest_traveller_counter_row\">\n                <div class=\"gest_traveller_image\" data-image=\"").concat(config.image, "\"></div>\n                <span>").concat(_(config.name), ": </span>\n                <span id=\"gest_traveller_").concat(config.image, "_counter\" style=\"margin-left: auto;\"></span>\n              </div>\n            "); }).join(''), "\n        </div>\n      </div>\n      <div class=\"gest_traveller_counter_row\">\n        <span>").concat(_('Discard Pile: '), "</span><span id=\"gest_travellers_discard_counter\" style=\"margin-left: auto;\"></span>\n      </div>\n      <div class=\"gest_traveller_counter_row\">\n        <span>").concat(_('Victims Pile: '), "</span><span id=\"gest_victims_pile_counter\" style=\"margin-left: auto;\"></span>\n      </div>\n    </div>\n    <div id=\"gest_traveller_robbed\" class=\"gest_card_stock\"></div>\n  </div>\n</div>"); };
var tplCardArea = function () { return "\n  <div id=\"gest_card_area\">\n    <div id=\"gest_decks\">\n      <div class=\"gest_card_row\">\n        <div id=\"gest_events_deck\" class=\"gest_card_stock gest_card_side\" data-card-id=\"EventBack\" style=\"box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.5);\"></div>\n        <div id=\"gest_events_discard\" class=\"gest_card_stock\"></div>\n      </div>\n      ".concat(tplTravellers(), "\n    </div>\n  </div>\n"); };
var GestCardManager = (function (_super) {
    __extends(GestCardManager, _super);
    function GestCardManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return card.id.split('_')[0]; },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    GestCardManager.prototype.clearInterface = function () { };
    GestCardManager.prototype.setupDiv = function (card, div) {
        div.style.height = 'calc(var(--gestCardScale) * 355px)';
        div.style.width = 'calc(var(--gestCardScale) * 206px)';
        div.style.position = 'relative';
        div.classList.add('gest_card');
    };
    GestCardManager.prototype.setupFrontDiv = function (card, div) {
        div.classList.add('gest_card_side');
        div.style.height = 'calc(var(--gestCardScale) * 355px)';
        div.style.width = 'calc(var(--gestCardScale) * 206px)';
        div.setAttribute('data-card-id', card.id.split('_')[0]);
        var cardId = card.id.split('_')[0];
        this.game.tooltipManager.addCardTooltip({
            nodeId: cardId,
            cardId: cardId
        });
    };
    GestCardManager.prototype.setupBackDiv = function (card, div) {
        div.classList.add('gest_card_side');
        div.style.height = 'calc(var(--gestCardScale) * 355px)';
        div.style.width = 'calc(var(--gestCardScale) * 206px)';
        var cardId = card.id.split('_')[0];
        div.setAttribute('data-card-id', this.game.gamedatas.staticData.cards[cardId].type === 'eventCard'
            ? 'EventBack'
            : 'TravellerBack');
    };
    GestCardManager.prototype.isCardVisible = function (card) {
        if (card.location.startsWith('eventsDeck') ||
            card.location.startsWith('travellersDeck')) {
            return false;
        }
        return true;
    };
    GestCardManager.prototype.updateDisplay = function (element, cards, lastCard, stock) {
        var node = stock.getCardElement(lastCard);
        if (!node) {
            return;
        }
        node.style.top = '0px';
        node.style.left = '0px';
        node.style.position = 'absolute';
    };
    return GestCardManager;
}(CardManager));
var ForceManager = (function (_super) {
    __extends(ForceManager, _super);
    function ForceManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(card.id); },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    ForceManager.prototype.clearInterface = function () { };
    ForceManager.prototype.setupDiv = function (force, div) {
        div.classList.add('gest_force');
        div.setAttribute('data-type', force.type);
    };
    ForceManager.prototype.setupFrontDiv = function (force, div) {
        div.classList.add('gest_force_side');
        div.setAttribute('data-type', force.type);
        div.setAttribute('data-revealed', 'true');
        if (CARRIAGE_TYPES.includes(force.type)) {
            this.game.tooltipManager.addCarriageTooltip({ nodeId: force.id, type: force.type });
        }
    };
    ForceManager.prototype.setupBackDiv = function (force, div) {
        div.classList.add('gest_force_side');
        div.setAttribute('data-type', force.type);
        div.setAttribute('data-revealed', 'false');
        if (force.id.startsWith('fake')) {
            return;
        }
        if (CARRIAGE_TYPES.includes(force.type)) {
            this.game.tooltipManager.addCarriageTooltip({ nodeId: force.id, type: force.type });
        }
    };
    ForceManager.prototype.isCardVisible = function (force) {
        return !force.hidden;
    };
    return ForceManager;
}(CardManager));
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
var SPACES_CONFIG = (_a = {},
    _a[BINGHAM] = (_b = {},
        _b[HENCHMEN] = {
            top: 1253,
            left: 737,
            width: 89,
            height: 143,
        },
        _b[CAMP] = {
            top: 1201,
            left: 869,
            width: 50,
            height: 50,
        },
        _b[MERRY_MEN] = {
            top: 1237,
            left: 931,
            width: 82,
            height: 170,
        },
        _b[CARRIAGE] = {
            top: 1401,
            left: 805,
            width: 100,
            height: 50,
        },
        _b),
    _a[BLYTH] = (_c = {},
        _c[HENCHMEN] = {
            top: 565,
            left: 641,
            width: 100,
            height: 160,
        },
        _c[CAMP] = {
            top: 470,
            left: 585,
            width: 50,
            height: 50,
        },
        _c[MERRY_MEN] = {
            top: 544,
            left: 525,
            width: 100,
            height: 160,
        },
        _c[CARRIAGE] = {
            top: 482,
            left: 772,
            width: 50,
            height: 100,
        },
        _c),
    _a[MANSFIELD] = (_d = {},
        _d[HENCHMEN] = {
            top: 1110,
            left: 313,
            width: 100,
            height: 150,
        },
        _d[CAMP] = {
            top: 837,
            left: 273,
            width: 50,
            height: 50,
        },
        _d[MERRY_MEN] = {
            top: 829,
            left: 329,
            width: 100,
            height: 145,
        },
        _d[CARRIAGE] = {
            top: 1010,
            left: 253,
            width: 50,
            height: 100,
        },
        _d),
    _a[NEWARK] = (_e = {},
        _e[HENCHMEN] = {
            top: 688,
            left: 1081,
            width: 100,
            height: 145,
        },
        _e[CAMP] = {
            top: 1090,
            left: 916,
            width: 50,
            height: 50,
        },
        _e[MERRY_MEN] = {
            top: 1017,
            left: 977,
            width: 100,
            height: 170,
        },
        _e[CARRIAGE] = {
            top: 632,
            left: 1136,
            width: 100,
            height: 50,
        },
        _e),
    _a[NOTTINGHAM] = (_f = {},
        _f[HENCHMEN] = {
            top: 1113,
            left: 474,
            width: 175,
            height: 100,
        },
        _f[MERRY_MEN] = {
            top: 1039,
            left: 474,
            width: 170,
            height: 79,
        },
        _f[CARRIAGE] = {
            top: 1090,
            left: 634,
            width: 50,
            height: 100,
        },
        _f),
    _a[OLLERTON_HILL] = (_g = {},
        _g[CAMP] = {
            top: 862,
            left: 778,
            width: 50,
            height: 50,
        },
        _g),
    _a[REMSTON] = (_h = {},
        _h[HENCHMEN] = {
            top: 1383,
            left: 624,
            width: 100,
            height: 160,
        },
        _h[CAMP] = {
            top: 1300,
            left: 507,
            width: 50,
            height: 50,
        },
        _h[MERRY_MEN] = {
            top: 1355,
            left: 416,
            width: 100,
            height: 160,
        },
        _h[CARRIAGE] = {
            top: 1519,
            left: 511,
            width: 100,
            height: 50,
        },
        _h),
    _a[RETFORD] = (_j = {},
        _j[HENCHMEN] = {
            top: 317,
            left: 971,
            width: 100,
            height: 143,
        },
        _j[CAMP] = {
            top: 244,
            left: 766,
            width: 50,
            height: 50,
        },
        _j[MERRY_MEN] = {
            top: 317,
            left: 866,
            width: 100,
            height: 143,
        },
        _j[CARRIAGE] = {
            top: 209,
            left: 989,
            width: 50,
            height: 100,
        },
        _j),
    _a[SHIRE_WOOD] = (_k = {},
        _k[HENCHMEN] = {
            top: 769,
            left: 467,
            width: 160,
            height: 68,
        },
        _k[CAMP] = {
            top: 906,
            left: 610,
            width: 50,
            height: 50,
        },
        _k[MERRY_MEN] = {
            top: 886,
            left: 467,
            width: 140,
            height: 100,
        },
        _k[CARRIAGE] = {
            top: 837,
            left: 467,
            width: 50,
            height: 50,
        },
        _k),
    _a[SOUTHWELL_FOREST] = (_l = {},
        _l[HENCHMEN] = {
            top: 937,
            left: 671,
            width: 84,
            height: 124,
        },
        _l[CAMP] = {
            top: 1135,
            left: 762,
            width: 50,
            height: 50,
        },
        _l[MERRY_MEN] = {
            top: 987,
            left: 762,
            width: 100,
            height: 100,
        },
        _l[CARRIAGE] = {
            top: 931,
            left: 771,
            width: 50,
            height: 50,
        },
        _l),
    _a[TUXFORD] = (_m = {},
        _m[HENCHMEN] = {
            top: 814,
            left: 864,
            width: 100,
            height: 161,
        },
        _m[CAMP] = {
            top: 627,
            left: 864,
            width: 50,
            height: 50,
        },
        _m[MERRY_MEN] = {
            top: 514,
            left: 932,
            width: 100,
            height: 161,
        },
        _m[CARRIAGE] = {
            top: 706,
            left: 823,
            width: 50,
            height: 100,
        },
        _m),
    _a);
var JUSTICE_TRACK_CONFIG = [
    {
        id: 'justiceTrack_1',
        top: 904,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_2',
        top: 803,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_3',
        top: 702,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_4',
        top: 601,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_5',
        top: 500,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_6',
        top: 399,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_7',
        top: 298,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
];
var ORDER_TRACK = [
    {
        id: 'orderTrack_1',
        top: 1029,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_2',
        top: 1130,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_3',
        top: 1231,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_4',
        top: 1332,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_5',
        top: 1433,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_6',
        top: 1534,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_7',
        top: 1635,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
];
var ROYAL_INSPECTION_TRACK = [
    {
        id: 'royalInspectionTrack_unrest',
        top: 862,
        left: 1210,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_mischief',
        top: 956,
        left: 1210,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_governance',
        top: 1047,
        left: 1210,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_redeployment',
        top: 1138,
        left: 1210,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_reset',
        top: 1228,
        left: 1210,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_balad',
        top: 710,
        left: 1233,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
];
var PARISH_STATUS_BOXES = [
    {
        id: 'parishStatusBox_Retford',
        top: 204,
        left: 883,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Blyth',
        top: 443,
        left: 669,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Tuxford',
        top: 698,
        left: 890,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Newark',
        top: 886,
        left: 1060,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Mansfield',
        top: 986,
        left: 311,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Bingham',
        top: 1276,
        left: 834,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Remston',
        top: 1380,
        left: 528,
        extraClasses: 'gest_parish_status_box',
    },
];
var INITIATIVE_TRACK = [
    {
        id: 'initiativeTrack_singlePlot',
        top: 1596,
        left: 1094,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
    {
        id: 'initiativeTrack_event',
        top: 1588,
        left: 1191,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
    {
        id: 'initiativeTrack_plotsAndDeeds',
        top: 1580,
        left: 1286,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
    {
        id: 'initiativeTrack_firstEligible',
        top: 1785,
        left: 1146,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
    {
        id: 'initiativeTrack_secondEligible',
        top: 1773,
        left: 1269,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
];
var UNIQUE_SPACES = [
    {
        id: 'Carriage_usedCarriages',
        top: 505,
        left: 249,
    },
    {
        id: "".concat(MERRY_MEN, "_prison"),
        top: 147,
        left: 1182,
    },
];
var BRIDGE_LOCATIONS = [
    {
        id: BLYTH_RETFORD_BORDER,
        top: 345,
        left: 819,
        extraClasses: 'gest_bridge_location',
    },
    {
        id: BINGHAM_NEWARK_BORDER,
        top: 1182,
        left: 934,
        extraClasses: 'gest_bridge_location',
    },
    {
        id: BINGHAM_SOUTHWELL_FOREST_BORDER,
        top: 1185,
        left: 736,
        extraClasses: 'gest_bridge_location',
    },
    {
        id: BINGHAM_NOTTINGHAM_BORDER,
        top: 1227,
        left: 613,
        extraClasses: 'gest_bridge_location',
    },
    {
        id: NOTTINGHAM_REMSTON_BORDER,
        top: 1246,
        left: 537,
        extraClasses: 'gest_bridge_location',
    },
];
var GameMap = (function () {
    function GameMap(game) {
        this.parishStatusMarkers = {};
        this.forces = {};
        this.forceIdCounter = 1;
        this.game = game;
        var gamedatas = game.gamedatas;
        this.setupGameMap({ gamedatas: gamedatas });
    }
    GameMap.prototype.clearInterface = function () {
        var _this = this;
        PARISHES.forEach(function (parishId) {
            _this.parishStatusMarkers[parishId].removeAll();
        });
        Object.values(this.forces).forEach(function (stock) {
            stock.removeAll();
        });
        [
            ROYAL_FAVOUR_MARKER,
            ROYAL_INSPECTION_MARKER,
            ROBIN_HOOD_ELIGIBILITY_MARKER,
            SHERIFF_ELIGIBILITY_MARKER,
        ].forEach(function (markerId) {
            var node = document.getElementById(markerId);
            if (!node) {
                return;
            }
            node.remove();
        });
        Object.keys(RIVER_BORDERS).forEach(function (borderId) {
            var node = document.getElementById(borderId);
            if (!node) {
                return;
            }
            node.removeAttribute('data-has-bridge');
        });
    };
    GameMap.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
        this.updateParishStatusMarkers({ gamedatas: gamedatas });
        this.updateTrackMarkers({ gamedatas: gamedatas });
        this.updateForces({ gamedatas: gamedatas });
    };
    GameMap.prototype.setupParishStatusMarkers = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        PARISHES.forEach(function (parishId) {
            _this.parishStatusMarkers[parishId] = new LineStock(_this.game.markerManager, document.getElementById("parishStatusBox_".concat(parishId)), {
                gap: '0px',
                center: true,
            });
        });
        this.updateParishStatusMarkers({ gamedatas: gamedatas });
    };
    GameMap.prototype.setupForces = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        Object.entries(SPACES_CONFIG).forEach(function (_a) {
            var spaceId = _a[0], config = _a[1];
            Object.keys(config).forEach(function (forceType) {
                var id = "".concat(forceType, "_").concat(spaceId);
                var element = document.getElementById(id);
                if (!element) {
                    return;
                }
                _this.forces[id] = new LineStock(_this.game.forceManager, element, {
                    center: true,
                    gap: '0px',
                });
            });
        });
        this.forces['Carriage_usedCarriages'] = new LineStock(this.game.forceManager, document.getElementById('Carriage_usedCarriages'), {
            center: true,
            gap: '0px',
        });
        this.forces["".concat(MERRY_MEN, "_prison")] = new LineStock(this.game.forceManager, document.getElementById("".concat(MERRY_MEN, "_prison")), {
            center: true,
            gap: '0px',
        });
        this.updateForces({ gamedatas: gamedatas });
    };
    GameMap.prototype.updateForces = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        var isRobinHoodPlayer = this.game.getPlayerId() ===
            this.game.playerManager.getRobinHoodPlayerId();
        var isSheriffPlayer = this.game.getPlayerId() === this.game.playerManager.getSheriffPlayerId();
        __spreadArray(__spreadArray([], SPACES, true), [USED_CARRIAGES, PRISON], false).forEach(function (spaceId) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var forces = gamedatas.forces[spaceId];
            var robinHoodForces = (_a = gamedatas.robinHoodForces) === null || _a === void 0 ? void 0 : _a[spaceId];
            var sheriffForces = (_b = gamedatas.sheriffForces) === null || _b === void 0 ? void 0 : _b[spaceId];
            if (!forces) {
                return;
            }
            if (((_c = forces.Henchmen) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                forces.Henchmen.forEach(function (henchman) {
                    _this.forces["".concat(henchman.type, "_").concat(henchman.location)].addCard(henchman);
                });
            }
            if (isRobinHoodPlayer && robinHoodForces) {
                robinHoodForces.forEach(function (force) {
                    _this.addPrivateForce({ force: force });
                });
            }
            if (isSheriffPlayer && sheriffForces) {
                sheriffForces.forEach(function (carriage) {
                    _this.forces["".concat(CARRIAGE, "_").concat(spaceId)].addCard(carriage);
                });
            }
            if (!isRobinHoodPlayer) {
                _this.addPublicForces({
                    type: ROBIN_HOOD,
                    spaceId: spaceId,
                    hidden: false,
                    count: forces.RobinHood,
                });
                _this.addPublicForces({
                    type: MERRY_MEN,
                    spaceId: spaceId,
                    hidden: false,
                    count: ((_d = forces.MerryMen) === null || _d === void 0 ? void 0 : _d.revealed) || 0,
                });
                _this.addPublicForces({
                    type: MERRY_MEN,
                    spaceId: spaceId,
                    hidden: true,
                    count: ((_e = forces.MerryMen) === null || _e === void 0 ? void 0 : _e.hidden) || 0,
                });
                _this.addPublicForces({
                    type: CAMP,
                    spaceId: spaceId,
                    hidden: false,
                    count: ((_f = forces.Camp) === null || _f === void 0 ? void 0 : _f.revealed) || 0,
                });
                _this.addPublicForces({
                    type: CAMP,
                    spaceId: spaceId,
                    hidden: true,
                    count: ((_g = forces.Camp) === null || _g === void 0 ? void 0 : _g.hidden) || 0,
                });
            }
            if (!isSheriffPlayer) {
                _this.addPublicForces({
                    count: ((_h = forces.Carriage) === null || _h === void 0 ? void 0 : _h.hidden) || 0,
                    hidden: true,
                    type: CARRIAGE,
                    spaceId: spaceId,
                });
                [TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].forEach(function (type) {
                    var _a;
                    _this.addPublicForces({
                        count: ((_a = forces.Carriage) === null || _a === void 0 ? void 0 : _a[type]) || 0,
                        hidden: false,
                        type: type,
                        spaceId: spaceId,
                    });
                });
            }
        });
    };
    GameMap.prototype.updateParishStatusMarkers = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        PARISHES.forEach(function (parishId) {
            var spaceData = gamedatas.spaces[parishId];
            if (!spaceData || spaceData.status === PASSIVE) {
                return;
            }
            _this.parishStatusMarkers[parishId].addCard({
                id: "parishStatusMarker_".concat(parishId),
                location: "parishStatusBox_".concat(parishId),
                side: spaceData.status === 'submissive' ? 'front' : 'back',
                type: 'parishStatusMarker',
            });
        });
    };
    GameMap.prototype.updateTrackMarkers = function (_a) {
        var gamedatas = _a.gamedatas;
        GAME_MAP_MARKERS.forEach(function (markerId) {
            var data = gamedatas.markers[markerId];
            if (!data) {
                return;
            }
            var location = document.getElementById(data.location);
            if (!location) {
                return;
            }
            location.insertAdjacentHTML('afterbegin', tplMarker({ id: data.id, extraClasses: 'gest_track_marker' }));
        });
        if (gamedatas.bridgeLocation) {
            this.placeBridge({ borderId: gamedatas.bridgeLocation });
        }
    };
    GameMap.prototype.setupGameMap = function (_a) {
        var gamedatas = _a.gamedatas;
        document
            .getElementById('play_area_container')
            .insertAdjacentHTML('afterbegin', tplGameMap({ gamedatas: gamedatas }));
        this.setupParishStatusMarkers({ gamedatas: gamedatas });
        this.setupForces({ gamedatas: gamedatas });
        this.updateTrackMarkers({ gamedatas: gamedatas });
        this.game.tooltipManager.addGameMapTooltips();
    };
    GameMap.prototype.isRobinHoodForce = function (_a) {
        var type = _a.type;
        return [CAMP, MERRY_MEN, ROBIN_HOOD].includes(type);
    };
    GameMap.prototype.isSheriffForce = function (_a) {
        var type = _a.type;
        return [
            CARRIAGE,
            TALLAGE_CARRIAGE,
            TRIBUTE_CARRIAGE,
            TRAP_CARRIAGE,
            HENCHMEN,
        ].includes(type);
    };
    GameMap.prototype.clearSelectable = function () {
        SPACES.forEach(function (space) {
            var element = document.getElementById("gest_map_space_".concat(space));
            if (element) {
                element.classList.remove(GEST_SELECTABLE, GEST_SELECTED);
            }
        });
        var mapSpaces = document.getElementById('gest_map_spaces');
        if (mapSpaces) {
            mapSpaces.classList.remove(GEST_SELECTABLE);
        }
    };
    GameMap.prototype.addPublicForces = function (_a) {
        var type = _a.type, hidden = _a.hidden, spaceId = _a.spaceId, count = _a.count;
        for (var i = 0; i < count; i++) {
            var stockId = "".concat(type, "_").concat(spaceId);
            if (type === ROBIN_HOOD) {
                stockId = "".concat(MERRY_MEN, "_").concat(spaceId);
            }
            else if ([TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(type)) {
                stockId = "".concat(CARRIAGE, "_").concat(spaceId);
            }
            this.forces[stockId].addCard({
                id: "force_".concat(this.forceIdCounter),
                type: type,
                location: spaceId,
                hidden: hidden,
            });
            this.forceIdCounter++;
        }
    };
    GameMap.prototype.getStockIdPrivate = function (_a) {
        var force = _a.force;
        var id = "".concat(force.type, "_").concat(force.location);
        if (force.type === ROBIN_HOOD) {
            id = "".concat(MERRY_MEN, "_").concat(force.location);
        }
        else if ([TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(force.type)) {
            id = "".concat(CARRIAGE, "_").concat(force.location);
        }
        return id;
    };
    GameMap.prototype.getStockIdPublic = function (_a) {
        var type = _a.type, spaceId = _a.spaceId;
        switch (type) {
            case ROBIN_HOOD:
            case MERRY_MEN:
                return "".concat(MERRY_MEN, "_").concat(spaceId);
            case CAMP:
                return "".concat(CAMP, "_").concat(spaceId);
            case TALLAGE_CARRIAGE:
            case TRAP_CARRIAGE:
            case TRIBUTE_CARRIAGE:
            case CARRIAGE:
                return "".concat(CARRIAGE, "_").concat(spaceId);
            default:
                return "".concat(type, "_").concat(spaceId);
        }
    };
    GameMap.prototype.getPublicType = function (_a) {
        var type = _a.type;
        switch (type) {
            case ROBIN_HOOD:
            case MERRY_MEN:
                return MERRY_MEN;
            case CAMP:
                return CAMP;
            case TALLAGE_CARRIAGE:
            case TRAP_CARRIAGE:
            case TRIBUTE_CARRIAGE:
            case CARRIAGE:
                return CARRIAGE;
            default:
                return type;
        }
    };
    GameMap.prototype.addPrivateForce = function (_a) {
        var force = _a.force;
        var id = this.getStockIdPrivate({ force: force });
        this.forces[id].addCard(force);
    };
    GameMap.prototype.getForcePublic = function (_a) {
        var type = _a.type, spaceId = _a.spaceId, hidden = _a.hidden, exclude = _a.exclude;
        var stockId = this.getStockIdPublic({ type: type, spaceId: spaceId });
        var forces = this.forces[stockId].getCards().filter(function (force) {
            if (exclude &&
                exclude.some(function (excludedForce) { return excludedForce.id === force.id; })) {
                return false;
            }
            return force.hidden === hidden && force.type === type;
        });
        var selected = forces[Math.floor(Math.random() * forces.length)];
        return selected;
    };
    GameMap.prototype.hideForcePublic = function (_a) {
        var force = _a.force;
        var input = {
            type: force.type,
            spaceId: force.location,
            hidden: false,
        };
        var selected = this.getForcePublic(input);
        selected.type = force.type;
        if (force.type === ROBIN_HOOD) {
            selected.type = MERRY_MEN;
        }
        else if ([TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(force.type)) {
            selected.type = CARRIAGE;
        }
        selected.hidden = force.hidden;
        this.game.forceManager.updateCardInformations(selected);
        if (force.type === ROBIN_HOOD) {
            var backNode = document.getElementById("".concat(selected.id, "-back"));
            backNode.replaceChildren();
            backNode.setAttribute('data-type', MERRY_MEN);
        }
    };
    GameMap.prototype.hideForcePrivate = function (_a) {
        var force = _a.force;
        this.game.forceManager.updateCardInformations(force);
    };
    GameMap.prototype.revealForcePublic = function (_a) {
        var force = _a.force;
        var type = force.type;
        if ([TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(force.type)) {
            type = CARRIAGE;
        }
        else if (force.type === ROBIN_HOOD) {
            type = MERRY_MEN;
        }
        var selected = this.getForcePublic({
            type: type,
            spaceId: force.location,
            hidden: true,
        });
        selected.type = force.type;
        selected.hidden = force.hidden;
        this.game.forceManager.updateCardInformations(selected);
        if (force.type === ROBIN_HOOD) {
            var backNode = document.getElementById("".concat(selected.id, "-back"));
            backNode.setAttribute('data-type', ROBIN_HOOD);
        }
    };
    GameMap.prototype.revealForcePrivate = function (_a) {
        var force = _a.force;
        this.game.forceManager.updateCardInformations(force);
    };
    GameMap.prototype.moveForcePrivate = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var toStockId;
            var force = _b.force;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        toStockId = this.getStockIdPrivate({ force: force });
                        return [4, this.forces[toStockId].addCard(force)];
                    case 1:
                        _c.sent();
                        return [2];
                }
            });
        });
    };
    GameMap.prototype.removeFromGamePublic = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var selected;
            var type = _b.type, hidden = _b.hidden, fromSpaceId = _b.fromSpaceId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        selected = this.getForcePublic({
                            type: type,
                            spaceId: fromSpaceId,
                            hidden: hidden,
                        });
                        return [4, this.game.forceManager.removeCard(selected)];
                    case 1:
                        _c.sent();
                        return [2];
                }
            });
        });
    };
    GameMap.prototype.returnToSupplyPublic = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var selected;
            var type = _b.type, hidden = _b.hidden, fromSpaceId = _b.fromSpaceId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        selected = this.getForcePublic({
                            type: type,
                            spaceId: fromSpaceId,
                            hidden: hidden,
                        });
                        return [4, this.game.forceManager.removeCard(selected)];
                    case 1:
                        _c.sent();
                        return [2];
                }
            });
        });
    };
    GameMap.prototype.moveForcePublic = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var force, toStockId;
            var type = _b.type, hidden = _b.hidden, toSpaceId = _b.toSpaceId, fromSpaceId = _b.fromSpaceId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        force = this.getForcePublic({ type: type, hidden: hidden, spaceId: fromSpaceId });
                        toStockId = this.getStockIdPublic({ type: type, spaceId: toSpaceId });
                        return [4, this.forces[toStockId].addCard(force)];
                    case 1:
                        _c.sent();
                        return [2];
                }
            });
        });
    };
    GameMap.prototype.setSpaceStatus = function (_a) {
        var spaceId = _a.spaceId, status = _a.status;
        var markers = this.parishStatusMarkers[spaceId].getCards();
        if (markers.length > 0) {
            var marker = markers[0];
            if (status === PASSIVE) {
                this.game.markerManager.removeCard(marker);
            }
            else {
                markers[0].side = status === SUBMISSIVE ? 'front' : 'back';
                this.game.markerManager.updateCardInformations(marker);
            }
        }
    };
    GameMap.prototype.forceIsInLocation = function (_a) {
        var force = _a.force;
        return this.forces[this.getStockIdPrivate({ force: force })]
            .getCards()
            .some(function (forceInStock) { return forceInStock.id === force.id; });
    };
    GameMap.prototype.moveMarker = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var markerNode, toNode;
            var id = _b.id, location = _b.location;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        markerNode = document.getElementById(id);
                        toNode = document.getElementById(location);
                        if (!(markerNode && toNode)) {
                            return [2];
                        }
                        return [4, this.game.animationManager.attachWithAnimation(new BgaSlideAnimation({ element: markerNode }), toNode)];
                    case 1:
                        _c.sent();
                        return [2];
                }
            });
        });
    };
    GameMap.prototype.placeBridge = function (_a) {
        var borderId = _a.borderId;
        var node = document.getElementById(borderId);
        if (!node) {
            return;
        }
        node.setAttribute('data-has-bridge', 'true');
    };
    return GameMap;
}());
var getRevealedText = function (type) {
    switch (type) {
        case CAMP:
            return 'C';
        case MERRY_MEN:
            return 'M';
        case ROBIN_HOOD:
            return 'RH';
        case TALLAGE_CARRIAGE:
            return 'TAL';
        case TRAP_CARRIAGE:
            return 'TRA';
        case TRIBUTE_CARRIAGE:
            return 'TRI';
        default:
            return '';
    }
};
var tplForce = function (_a) {
    var id = _a.id, type = _a.type, subtype = _a.subtype, hidden = _a.hidden;
    return "\n  <div ".concat(id ? "id=\"".concat(id, "\"") : '', " data-type=\"").concat(type, "\" data-hidden=\"").concat(hidden ? 'true' : 'false', "\" ").concat(subtype ? "data-subtype=\"".concat(subtype, "\" ") : '', "class=\"gest_force\">").concat(type !== HENCHMEN && !hidden ? "<span>".concat(getRevealedText(type), "</span>") : '', "\n").concat(type === ROBIN_HOOD && hidden ? "<span>*</span>" : '', "\n").concat(subtype && !hidden ? "<span>".concat(getRevealedText(subtype), "</span>") : '', "\n").concat(subtype && hidden ? "<span>*".concat(getRevealedText(subtype), "</span>") : '', "\n</div>");
};
var tplMarkerSpace = function (_a) {
    var id = _a.id, top = _a.top, left = _a.left, extraClasses = _a.extraClasses;
    return "<div id=\"".concat(id, "\" class=\"").concat(extraClasses ? " ".concat(extraClasses) : '', "\" style=\"top: calc(var(--gestMapScale) * ").concat(top, "px); left: calc(var(--gestMapScale) * ").concat(left, "px);\"></div>");
};
var tplTrack = function (_a) {
    var config = _a.config;
    return config
        .map(function (markerSpace) {
        return tplMarkerSpace({
            id: "".concat(markerSpace.id),
            top: markerSpace.top,
            left: markerSpace.left,
            extraClasses: markerSpace.extraClasses,
        });
    })
        .join('');
};
var tplMarker = function (_a) {
    var id = _a.id, extraClasses = _a.extraClasses;
    return "<div id=\"".concat(id, "\"").concat(extraClasses ? " class=\"".concat(extraClasses, "\"") : '', "></div>");
};
var tplSpaces = function () {
    return Object.entries(SPACES_CONFIG)
        .map(function (_a) {
        var spaceId = _a[0], config = _a[1];
        var html = '';
        Object.keys(config).forEach(function (forceType) {
            html += "<div id=\"".concat(forceType, "_").concat(spaceId, "\" class=\"gest_forces\" style=\"top: calc(var(--gestMapScale) * ").concat(config[forceType].top, "px); left: calc(var(--gestMapScale) * ").concat(config[forceType].left, "px); width: calc(var(--gestMapScale) * ").concat(config[forceType].width, "px); height: calc(var(--gestMapScale) * ").concat(config[forceType].height, "px);\"></div>");
        });
        return html;
    })
        .join('');
};
var tplGameMap = function (_a) {
    var gamedatas = _a.gamedatas;
    return "\n  <div id=\"gest_game_map\">\n    <svg id=\"gest_map_spaces\">\n      <path id=\"gest_map_space_Blyth\" class=\"gest_map_space\" d=\"M445.88,156.73c23.2-20.36,25.09-26.51,25.09-26.51l7.1-8.52,23.67-17.04,58.23-29.83,16.57-12.78,15.15-13.73,6.15-8.05,19.41-16.1,2.37-17.52,8.52-6.15h13.73l9.47,5.21,4.26.95,8.99,33.14,12.31,8.99,14.2,9.47,10.42,12.31-2.37,10.42,2.37,14.2,4.26,10.42,8.99,8.99,20.83-2.37,6.63-4.26,7.57,7.57,11.36,1.42,11.36-4.26,8.52-3.31,12.78-1.89-17.99,9.47-7.1,3.79.95,4.73-13.26,4.73-4.26,2.37-.57,3.84-10.32,3.35-3.09,3.87,1.29,4.38-2.84,3.87-9.28,1.81-8-.77-10.83.52-8.25,2.06-2.32,3.09-2.58,4.38-15.22,4.13-7.48,4.9-15.99,1.81-10.06,9.54-5.42,9.28-2.84,15.73-2.06,13.15-12.38,5.42,3.09,4.64h12.12l7.48,5.67,5.16,2.58,8.51-4.38,4.38,3.09-8.25,7.22,1.03,11.09,1.6,6.2,6.92,7.97-2.94,5.04,15.95,8.81h11.33l5.88,5.88-.63,9.86,6.71,5.67h18.05l9.02-4.83,9.02,1.05,3.57,8.18,14.9,1.89,8.6-2.31,3.99,2.31.63,3.57,6.71,2.52,10.7,1.89,4.41,1.68,3.99,1.89,15.32-1.89,1.26,3.99,2.94,3.57-4.62,13.22,2.52,10.28,6.09,5.04-1.05,8.6-.23,10.04,4.39,13.03-5.67,4.11-.28,7.65-3.26,2.97h-11.9l-8.64,12.47,3.4,6.09-3.68,2.83-7.51,6.52.14,15.44,6.37,4.82,5.38,1.42-4.11,3.82,4.82,11.9,1.7,7.79,2.97,6.37-4.53,5.67,4.67,3.26,5.52-3.54,8.64,4.53-13.88,11.76-3.4,17.99,5.95,9.35,1.56,17.28,1.27,15.72,22.67,20.4.99,11.33,8.5,7.93-3.54,7.79.71,14.45,13.17,13.46,5.1,5.52,1.13,8.78-6.37,5.67-12.89,2.69-20.68,14.73-34,3.12-11.33,3.97-14.73,13.74-9.77,7.37-6.66,11.9-16.15,10.2-20.68,8.22-4.53,4.53-2.97,11.62-7.93,8.36-.99,12.18,8.22,7.79,11.47,6.37,10.77,1.27-.71,8.36-17.85,7.51-11.33,5.95-13.6,4.25-6.52,8.07-.85,7.79-7.93,10.62-1.13,18.56,6.66,12.04-2.83,12.75,1.13,9.77,6.8,16.43-.42,15.02,6.37,8.78,13.83,5.81,13.8,2.69,4.53,2.83v15.16l-25.92.57-8.36,3.4h-33.29l-17.85,2.55-9.35,6.23-3.54,18.27-8.22-2.55-6.37-9.77-8.5-2.83-3.97-18.42-17.85-17.28,8.22-4.25.99-12.04-8.36-10.91-10.91-6.37-6.8-1.98-5.95-5.81-1.7-10.06-11.62-7.37-37.26-2.55-7.79-8.5-29.47-.99-12.75-9.49-1.56-13.6-6.52-8.36-16.01-7.93-14.87-.42-17.14-17-4.11-2.55-26.21-1.27-10.91-13.46-19.41-.99-16.15,11.33-16.29-4.25-11.9-8.78-19.83-.57-8.36,3.12v-3.82l1.7-1.98-1.7-10.77,8.78-5.52,6.23-15.58,1.13-18.7,4.39-16.29,1.13-12.75-1.84-6.09-.99-7.51,2.97-5.1.85-15.16,14.02-9.92,1.13-4.39,22.38-17.85,12.32-.57,11.33-1.84,17.99-9.63,16.01-16.57,9.21-11.47.14-9.63-5.52-7.51,6.37-8.07,2.83-11.05,2.41-17.57,5.95-27.34,2.69-4.96,17.57-10.34,5.52-7.93,9.21-8.07,6.94-1.98,17-10.2,19.83-10.2,8.92-7.93-1.13-23.8,7.37-10.62.57-12.32-3.4-9.49-8.07-7.93-.14-11.33-8.78-11.05-5.24-5.67-10.06-4.82,1.84-11.05-2.83-9.77,5.67-9.49,14.87-13.32-.71-11.47-10.91-15.58-4.67-3.26-4.53-.85-.42-5.38-7.79-6.8-8.07-4.39-10.77-3.54,15.44-22.24.71-16.57,17.99-16.86,17.42-12.61,6.94-7.79.14-13.46-5.95-5.52-11.33-2.69-9.77-1.27-1.13-5.38-5.38-6.8-3.4-2.12,2.89-.82Z\"/>\n      <path id=\"gest_map_space_Retford\" class=\"gest_map_space\" d=\"M713.59,165.88h21.89l16.03-5.47,3.91-3.52v-7.82l13.29-6.65,2.74-5.08,7.43-2.35h10.16l9.77-5.86-5.08-2.74,17.98-7.43h4.3v-5.08l7.82-5.86,20.72-7.82,16.81-6.65-1.95-10.95-2.62-6.26v-10.16l7.31-4.69h9.77v6.26l14.86,1.17,9.38,1.95-9.77-9.38,7.04-1.95,6.26-5.08h8.99l4.69-3.52-3.91-4.3,13.29-5.47,5.08-5.86-3.52-4.3h16.03l20.72-3.52,3.91,3.91,12.51-3.91,6.26,6.65,4.69,3.13,5.86-2.74,9.38,1.17-4.3,4.69,4.3,4.3,10.16.78,8.99.78,8.21,10.16,3.13,11.73,3.91,12.51v17.98l2.35,8.6-1.95,15.64,10.56,8.6,8.99,1.95v5.47l8.6,4.3v5.47l8.99,7.82-7.43,7.04,7.43,16.81,6.26,2.74-1.95,5.86,1.95,4.69-1.95,4.3,8.99,7.04-6.26,5.08,3.91,8.99-3.52,5.47,5.86,7.82v8.6l12.9,8.21-2.74,6.65,2.74,3.91-4.3,4.69,7.43,14.07,3.91,5.86-3.13,7.43,3.13,7.82-5.47,7.04,5.47-2.35,10.56,2.35,12.12,2.35,1.95,7.43,15.25,5.47-2.74,5.47,12.51,12.12,5.47,10.95v6.26l3.52,6.65v13.68l-8.21,11.73-.39,8.21,5.08,7.43-3.91,5.86.39,12.9-13.68,6.65-3.13,8.21-8.6,9.38.78,25.02-5.47,5.86-9.38,15.25v11.34l3.13,4.69,10.16,12.12,7.04,3.52,3.13,4.3-9.77,6.65v7.82s6.65,10.56,6.65,10.56c0,0-.39,5.08-1.56,5.08s-16.42,2.35-16.42,2.35l-1.95-8.99-9.38-13.68-8.21-5.47-7.82-2.74-14.86.78-1.17-13.29-8.21-11.34-14.86-10.39-15.64-5.64-20.72-4.69-12.51,1.95-8.6,6.65s-7.82,3.07-8.99,1.73-20.33-8.77-20.33-8.77l-8.99-3.13-21.5-.78-15.25,1.95-5.86,5.08-52.39,1.56,10.16-8.21-7.43-3.91-13.95,8.6-11.07.39-1.17-4.3-9.38-1.17-5.47-4.3-4.69.78-12.51-6.65v-10.95l-3.52-3.52,4.3-3.52-5.08-7.04-7.82-5.86-.39-7.82,3.91-.39,8.21-10.56-1.17-6.65,6.26-3.13,9.38-.78,11.73-8.99-5.08-4.69,4.3-5.86-.39-6.65-5.86-4.3-1.95-11.73,2.35-22.28-8.21-.78,1.17-8.6,2.74-8.21,5.08-3.91,7.82-.39,8.21-3.52,6.65,1.17-2.35-5.47h-7.82l-4.3,3.52-5.86-6.26-7.43-.39-5.47,1.56-9.38-10.16-8.99,5.47-8.6-6.26-6.26-.78-4.69,1.95-6.65-3.91-1.95-5.47-13.29-2.35-6.26,2.35-8.6-4.1-5.86-6.45-10.16-.39-8.99,1.56-2.35,7.82-9.77-2.54v-6.06l-3.52-6.65-5.08-3.91v-5.86l-18.77,2.35-5.08-7.82-3.13-3.52v-5.86l-4.3-1.17v-7.04l7.04-9.38.39-8.6-5.47-7.04h-7.82l-3.91,3.52-5.47-.78-6.65-5.47,6.65-8.21v-6.26l.78-7.82-.78-4.3,6.26-5.86,7.04-.39,8.21-2.35,4.69-6.26,8.01,1.17v-3.91l9.58-2.74,8.21-4.3,6.65-4.3Z\"/>\n      <path id=\"gest_map_space_Mansfield\" class=\"gest_map_space\" d=\"M82.77,1053.28l5.11,5.11,1.86,9.75,8.82,11.61,2.32,9.75-6.97,11.15-2.09,14.86-16.49,16.25-6.97,16.25-4.64,20.43-6.5,17.18-14.4,13.93v15.33l-13.47,21.36-19.97,14.4-8.82,19.97,13,17.65,3.72,11.15,12.07,5.11,8.82,5.11,8.36,14.86.02,13.3,10.49,5.86,7.32,9.27,2.68,12.93-1.46,7.08-8.05,7.56-2.44,16.59,11.47,3.9,12.2,5.86,6.1,10-2.44,10.98-4.15,4.15h-4.39l-6.59,7.32-6.59,7.81,11.23,13.18,3.9,13.18,2.44,10.98.49,6.34,6.83,6.1,19.28,6.1,14.15,2.68,8.05,3.66,8.54,14.15,4.64,10.25v12.69l-7.56,11.47-10.49,8.78,7.56,10.25-.73,11.96,12.69,5.12,11.23,9.76v11.71l-7.08,13.42-.24,9.03-1.95,9.52,9.27,5.12,17.08-5.61,11.23-7.32,13.91,1.22,10.49-11.96,16.84-9.52,9.03,1.22,8.54-3.17v-3.17l14.4-7.56,22.94-17.57,12.45-3.66,11.96,8.3,9.03-4.39,11.71,5.61,7.32-1.71,7.56.24v-7.56l6.83-4.39-2.44-4.15,5.12-2.93,2.2-6.83v-7.81l10.98-2.44,9.03-1.22-31.23-18.3-11.47-3.17-15.37-8.54-4.15-6.59-1.22-7.32-16.84-18.06-8.54-14.64-9.03-6.34-1.71-10.98-10-24.4-5.86-29.04s-1.22-16.35-1.22-17.08-.49-19.52-.73-18.79,1.95-27.82,1.95-27.82l3.9-16.11,10.98-28.31,9.03-17.33,12.93-18.3,15.37-15.86-10.74-5.37-6.34-5.61-1.71-8.3,3.66-8.3,7.56-8.54v-7.08l-16.59-8.05-11.23-10.98-6.59-9.27,5.86-6.83-12.69-14.89.73-9.27,5.86-5.61,5.86-2.44-6.83-12.69-2.2-5.37,1.71-6.1,11.23-7.08-10.25-11.71-2.93-10.49,8.05-12.45,7.32-5.86-8.3-10.98-2.2-8.78,5.86-9.76-2.2-9.52,3.42-4.39,10.98-3.9,10.98-2.68-1.22-13.18,8.54-13.67-1.46-15.37-5.61-4.39-1.95-6.59-14.64,1.95-10.98-5.86-5.61-10.49-11.71-5.12-8.05-6.83h-5.12l-7.32-1.22-16.59,6.1-13.18,2.68-12.2,12.2-14.15,3.17h-14.89l-20.25-1.95-16.59,5.86-14.64,7.81-12.69,1.46-17.33.24-10.49,2.93-7.56,3.42-2.44,5.86-11.71,11.47-1.22,8.05-8.78,10.49-3.42,3.17v7.32l5.86,3.9,6.1,8.3,1.71,4.88,10.74.24,8.54,2.93,7.81,3.66,4.64,1.95,6.43,1Z\"/>\n      <polygon id=\"gest_map_space_Remston\" class=\"gest_map_space\" points=\"262.57 1624.08 257.46 1626.96 256.35 1633.18 246.13 1635.63 240.58 1633.41 233.91 1635.63 227.7 1633.63 218.15 1639.62 218.15 1644.51 213.04 1647.84 210.15 1653.62 210.15 1656.5 215.48 1659.17 214.59 1664.05 229.03 1667.16 229.7 1672.94 233.03 1677.16 240.13 1684.04 240.58 1687.37 236.36 1687.37 233.03 1682.49 224.59 1687.37 221.26 1687.37 218.81 1693.37 217.7 1703.37 218.37 1709.36 226.59 1709.36 229.7 1716.47 231.03 1719.8 227.47 1731.35 228.14 1742.45 231.03 1748.9 224.81 1754.45 221.03 1760.67 222.37 1767.77 224.59 1773.1 226.36 1782.21 222.14 1786.21 216.81 1786.21 216.81 1790.65 210.15 1801.09 211.71 1808.2 212.37 1815.52 208.37 1822.85 208.37 1829.07 213.04 1833.29 211.93 1836.62 215.7 1843.06 217.04 1847.95 209.93 1856.83 214.81 1875.27 198.38 1889.71 204.15 1895.04 200.16 1899.03 198.38 1915.47 208.15 1912.36 219.26 1911.91 233.91 1914.14 246.57 1924.13 258.35 1939.68 269.89 1948.34 277.67 1950.12 287 1948.56 296.55 1946.56 309.65 1947.67 319.2 1958.33 328.31 1963.66 338.97 1970.77 349.18 1980.54 360.51 1985.87 370.06 1984.98 378.72 1981.88 382.5 1981.43 397.38 1968.55 405.15 1964.33 436.25 1963 450.46 1967.44 458.01 1970.99 463.34 1969.88 473.34 1967.88 492.44 1954.56 499.32 1950.78 516.2 1950.78 525.08 1958.78 534.19 1966.33 537.97 1968.55 556.62 1968.11 570.61 1965.66 583.5 1963.44 591.94 1953.67 598.15 1953.22 611.04 1952.78 623.25 1960.55 630.14 1967.22 654.34 1967.88 657.01 1963 671 1955 667.67 1945.67 678.55 1938.57 689.15 1937.01 698.1 1937.46 706.54 1941.01 712.53 1942.34 722.97 1941.45 728.75 1939.23 739.85 1937.9 754.29 1935.68 755.18 1930.13 755.18 1923.91 761.17 1915.47 769.84 1911.03 779.83 1908.36 790.93 1905.7 802.04 1902.59 810.26 1895.48 810.26 1879.49 808.26 1870.83 801.15 1864.16 792.05 1846.4 786.71 1836.85 780.05 1831.29 776.5 1823.74 767.39 1819.52 752.96 1819.08 740.52 1815.52 732.08 1807.75 725.42 1795.76 716.53 1786.43 691.44 1785.99 682.11 1779.77 673.22 1766.66 668.56 1750.23 661.67 1743.12 657.01 1737.79 653.01 1724.02 655.68 1710.03 652.35 1702.03 642.57 1699.37 631.25 1700.7 621.25 1690.71 609.26 1684.04 600.82 1678.93 597.04 1671.16 589.05 1660.5 589.49 1653.84 596.82 1645.18 602.82 1639.85 600.38 1632.29 582.39 1628.3 569.06 1622.3 559.51 1616.3 554.85 1607.42 545.3 1602.53 544.85 1595.43 544.63 1590.54 536.86 1580.99 521.75 1567.66 508.87 1567.66 503.32 1572.55 489.99 1575.44 481.78 1574.11 466.89 1577.44 457.79 1580.77 447.79 1576.1 443.57 1576.33 438.69 1580.99 429.58 1582.54 426.03 1578.1 420.48 1573.22 413.15 1573.88 410.04 1576.1 397.38 1576.33 395.38 1580.32 384.5 1578.99 377.61 1567.66 368.28 1568.77 366.28 1579.88 368.06 1583.21 362.29 1589.87 357.62 1590.32 357.18 1597.2 356.51 1601.2 352.51 1604.75 337.63 1605.42 334.75 1613.64 329.64 1614.75 322.09 1614.53 306.1 1609.2 294.33 1610.08 271.23 1618.75 262.57 1624.08\"/>\n      <polygon id=\"gest_map_space_Bingham\" class=\"gest_map_space\" points=\"534.26 1554.82 540 1559.09 540 1564.83 548.09 1571.15 558.69 1582.48 565.01 1595.87 571.05 1605.88 580.91 1612.65 590.18 1614.12 601.51 1615.44 612.69 1623.24 619.17 1634.43 619.17 1645.61 607.39 1657.68 607.54 1660.62 613.13 1665.33 613.72 1670.04 624.9 1675.04 632.41 1679.75 636.68 1684.9 644.33 1684.9 655.95 1686.66 665.52 1692.99 670.96 1703.15 670.96 1724.92 676.7 1736.84 685.53 1742.43 687.74 1755.24 690.39 1764.65 696.57 1771.86 713.05 1771.86 723.94 1774.51 732.62 1779.37 737.62 1787.31 744.68 1797.03 746.6 1801.88 753.22 1804.38 770.73 1803.65 781.18 1809.24 790.15 1817.33 797.36 1824.98 805.6 1837.2 807.81 1841.32 808.84 1847.5 813.99 1856.33 819.88 1862.21 823.41 1869.57 825.17 1876.49 826.35 1887.38 831.35 1888.41 836.21 1889.44 841.8 1887.67 860.19 1882.81 879.32 1875.46 887.12 1873.69 894.33 1870.31 904.49 1863.68 908.02 1858.53 911.7 1850.88 911.7 1831.61 910.81 1821.31 917.44 1807.47 922.44 1801.88 929.5 1792.17 939.66 1780.1 956.28 1777.6 964.82 1770.25 984.83 1763.18 995.72 1760.09 1005.73 1757.59 1021.03 1753.03 1034.42 1740.52 1034.42 1719.77 1033.39 1710.65 1041.78 1701.82 1035.3 1693.43 1035.01 1682.4 1039.86 1669.6 1044.87 1664.15 1059.14 1660.47 1070.76 1655.32 1081.65 1651.35 1100.34 1643.7 1100.34 1632.37 1116.38 1617.8 1116.97 1599.99 1125.06 1590.43 1133.01 1581.89 1131.39 1572.33 1125.95 1569.83 1117.71 1568.65 1114.91 1562.77 1108.73 1558.5 1101.96 1558.65 1096.37 1551.58 1100.49 1545.99 1096.52 1540.4 1096.52 1529.51 1093.87 1527.01 1086.51 1527.01 1084.3 1525.54 1084.89 1521.56 1078.56 1520.09 1074.74 1515.09 1070.76 1515.09 1069.88 1512.44 1066.64 1512.44 1061.79 1518.03 1055.17 1516.71 1046.19 1516.41 1044.72 1512.44 1037.22 1512.44 1035.89 1507.14 1022.94 1505.67 1017.35 1503.76 1013.97 1501.7 1007.05 1502.29 1004.4 1500.82 991.89 1500.82 986.01 1497.28 973.5 1500.08 968.64 1497.28 968.5 1492.72 953.93 1486.84 941.57 1471.68 937.15 1465.21 930.53 1465.79 931.12 1463.15 934.65 1461.67 934.51 1455.79 940.83 1448.72 939.95 1445.19 931.86 1443.57 924.2 1437.69 922.73 1430.18 913.32 1425.48 899.04 1430.18 895.66 1429.6 890.8 1422.68 889.33 1412.53 890.65 1400.9 888.74 1395.6 880.8 1388.84 870.79 1393.69 867.55 1395.46 863.58 1395.31 862.11 1396.34 853.57 1395.75 851.22 1391.63 846.22 1396.49 842.68 1395.9 840.77 1391.19 830.91 1397.52 827.68 1400.31 826.79 1407.23 828.56 1410.47 820.02 1423.12 812.81 1425.62 805.75 1432.39 807.96 1438.42 797.36 1446.81 797.66 1454.46 789.56 1461.67 788.53 1466.38 779.26 1466.82 767.64 1470.21 757.19 1470.36 753.95 1468.44 748.07 1468.44 737.03 1473.3 735.71 1477.12 729.38 1477.42 721.43 1484.63 716.72 1485.37 708.63 1490.22 701.42 1496.55 705.69 1500.67 704.36 1506.11 699.8 1510.38 697.89 1517 690.09 1523.33 678.02 1523.33 670.96 1529.8 657.13 1531.13 641.97 1539.81 641.24 1544.22 625.93 1546.28 612.84 1546.87 608.13 1546.58 605.19 1549.23 602.24 1549.23 600.48 1546.28 590.03 1548.64 587.82 1545.11 583.55 1545.55 581.49 1540.4 578.7 1535.69 569.58 1536.28 568.25 1538.49 562.37 1535.54 557.95 1538.34 552.36 1544.22 549.42 1544.08 545.44 1547.76 540 1548.93 534.26 1551.73 534.26 1554.82\"/>\n      <polygon id=\"gest_map_space_Tuxford\" class=\"gest_map_space\" points=\"834.4 508 839.29 505.56 847.51 508 861.06 508 866.17 508 885.04 508 902.81 508 917.91 508 929.91 505.56 937.24 499.12 962.56 499.12 974.99 505.78 988.1 510.67 1005.87 510.67 1018.75 502.45 1030.74 502.89 1038.96 506.23 1046.51 509.11 1056.06 512 1066.72 523.55 1064.28 531.55 1066.72 539.99 1073.38 544.87 1081.38 547.31 1099.37 547.31 1108.03 558.2 1106.7 567.08 1114.25 575.52 1122.02 579.07 1140.68 577.08 1140.68 583.07 1134.24 590.62 1134.02 599.51 1125.36 607.5 1135.13 621.94 1139.57 631.05 1143.79 643.93 1136.68 655.25 1130.91 657.7 1122.25 667.47 1127.58 673.02 1139.13 682.8 1138.24 694.34 1128.91 716.78 1121.36 725.22 1120.02 737.21 1124.24 749.65 1128.46 752.98 1129.58 758.53 1146.45 768.3 1151.56 769.41 1139.57 775.41 1135.13 780.07 1127.35 782.74 1117.8 792.51 1117.8 795.84 1111.59 803.4 1111.81 816.28 1099.15 832.93 1091.15 839.82 1088.26 845.59 1068.94 860.92 1066.72 857.37 1069.83 850.92 1063.83 843.37 1061.83 848.48 1064.94 852.92 1059.39 858.7 1062.5 863.58 1062.72 869.58 1063.39 875.8 1072.72 878.02 1073.61 885.57 1083.82 885.57 1085.82 888.02 1079.16 894.9 1077.83 900.9 1077.83 909.78 1083.6 916.44 1081.6 920.89 1085.38 929.99 1088.26 934.21 1092.93 937.1 1098.7 943.32 1096.93 947.98 1085.6 954.2 1082.27 959.98 1082.49 965.08 1074.72 973.3 1074.05 978.41 1078.49 986.18 1085.6 989.51 1092.93 990.62 1092.04 993.06 1082.93 999.29 1079.6 1004.4 1080.49 1009.06 1083.38 1013.06 1079.82 1015.5 1082.93 1024.83 1072.72 1029.27 1069.61 1044.37 1065.17 1050.37 1055.39 1062.81 1050.73 1068.58 1051.84 1074.8 1054.51 1078.58 1054.06 1089.68 1046.95 1100.12 1038.74 1108.34 1027.63 1110.34 1026.3 1106.56 1018.75 1107.45 1016.97 1113.22 1007.42 1121.44 1007.86 1128.99 1015.42 1135.43 1014.31 1138.99 1010.31 1143.43 1009.42 1149.87 1011.42 1154.98 1008.09 1159.64 1000.76 1168.53 995.65 1169.86 990.54 1175.86 984.1 1175.86 982.99 1172.3 979.88 1175.86 981.21 1180.52 978.55 1182.52 976.77 1189.4 974.11 1194.51 967.66 1200.95 967.22 1208.5 971.22 1214.06 976.1 1222.72 970.77 1228.05 969.89 1234.71 967.89 1236.93 967.44 1244.93 958.34 1252.7 957 1262.25 950.79 1267.36 944.79 1269.36 938.57 1273.8 930.8 1261.14 920.58 1255.81 907.03 1254.7 912.58 1246.26 907.48 1239.82 901.26 1235.38 889.04 1232.94 888.6 1223.61 875.27 1218.94 866.39 1219.17 853.95 1210.06 863.28 1200.29 867.94 1195.4 868.39 1184.3 863.94 1173.41 853.28 1166.08 831.3 1166.31 828.85 1157.87 821.52 1152.31 822.63 1134.55 825.52 1124.11 827.08 1112.78 819.97 1103.23 813.08 1091.01 792.43 1083.02 786.43 1072.14 802.2 1073.25 812.42 1068.14 818.41 1061.47 818.86 1046.15 820.19 1036.82 812.86 1025.05 802.64 1013.06 794.65 1009.73 771.11 1007.5 769.11 991.51 760.89 981.3 745.34 974.41 729.57 973.97 716.69 976.41 724.02 968.42 723.58 945.76 718.91 936.65 702.26 927.33 686.71 923.33 686.71 908.67 678.94 890.46 680.93 876.24 678.94 866.69 675.38 856.48 675.38 849.37 678.94 841.82 682.04 838.26 683.82 829.16 693.82 824.94 703.59 823.16 718.25 816.72 731.13 806.95 733.79 799.84 733.35 785.41 729.57 777.85 715.14 773.63 705.37 768.75 711.14 759.64 714.25 750.54 733.79 742.76 752.67 732.99 759.78 724.55 760.89 717 772.44 709 778.88 701.01 790.87 696.57 804.87 696.12 817.53 695.23 831.96 690.35 842.18 680.8 856.79 677.46 869.05 670.14 873.94 664.81 874.38 654.59 871.72 641.04 863.28 630.38 854.39 623.05 853.73 618.16 858.17 612.39 857.73 602.62 848.62 591.29 846.84 581.3 839.07 572.41 826.19 561.9 823.74 546.65 825.08 537.76 822.63 528.44 816.41 521.55 817.08 514.67 834.4 508\"/>\n      <path id=\"gest_map_space_Newark\" class=\"gest_map_space\" d=\"M1157.03,570.7s5.47-5.23,5.94-5.94,9.04-2.86,9.04-2.86l8.32-3.33,11.65-1.66,8.32,1.43,5.71,9.99,6.66,5.94,7.85,2.38h11.89l4.52,6.42,9.99,4.04,18.07,5.71,10.22,2.14,6.66,11.65,7.61,6.66,15.46,6.18,7.85,3.09h17.6l9.99,2.85,12.36,3.33,8.8,9.04,13.32,15.22v14.03l-5.94,8.32-8.56,4.04h-8.32l-9.75,6.66-9.04,10.22-3.57,2.62-.24,7.85-1.66,13.55,8.32,7.61,9.51,12.84,9.75,15.69,7.13,5.23-.48,9.99-4.04,7.61-14.27,2.62-10.7,1.19-11.41,8.56-9.99,4.52-18.55,10.46-10.46,6.9-7.61,12.36-7.85,7.85-1.19,9.51v14.74l-4.28,14.03-.95,12.13,3.57,11.18,9.75,8.08,3.33,5.94-2.62,9.99-6.18,13.79h-5.23l-3.8,4.28v4.99l-11.89,7.61-5.71,5.47-.95,9.99,4.99,5.94,12.36,6.42,2.62,8.8,7.13,14.5-4.99,7.13-2.14,4.04-.48,8.8-3.8,5.47-2.38,12.13-3.8,5.23.95,9.75,7.61,6.18,16.64,10.7-3.8,8.8.24,12.36.48,14.03-2.14,4.28-12.6,6.66-5.94,1.9-3.57,10.94-3.09,15.87,2.62,9.34-5.23,9.99-2.62,8.56,7.13,11.41,3.57,3.57.48,9.99,6.66,10.22-8.32,10.22-10.46,14.74-9.04,12.84-12.84,6.18-23.3,8.08-14.98,7.13-4.28,4.52-.95,11.18-20.21,10.46-16.41,14.03-3.33,8.32v9.99l2.14,5.47.95,10.22,5.47,5.23,9.27,3.8v12.13l3.09,7.37-3.09,8.56-14.03,9.92-7.61,15.05v10.94l9.75,11.65,13.32,15.93,4.99,7.37,2.62,11.18,7.13,8.56,12.6,1.9,9.04,8.32,1.9,7.61,11.89,6.18,10.22,12.13-7.85,16.17-1.43,10.94-17.36,6.66-15.93,5.23-14.03,2.14-9.75,2.14-15.46,14.74-5.94-3.8,9.04-11.18-.24-3.09-3.33-.24-5.47,6.66-8.56-1.9v-4.76l-6.66-1.43-2.14-11.18-2.85-.24,1.66-7.85-10.7-7.61,4.04-6.18.24-6.9-8.56,5.71-8.8,1.66-1.66-4.52-7.13-1.43-5.23,1.43-5.94-3.57-7.37,1.9-3.09-2.85-7.37-.48v-6.42l-17.12-1.66-6.9-3.09s-10.94-1.43-11.65-1.43-10.22-3.8-10.22-3.8l-4.76-1.43-3.57,3.57-6.66-3.57-5.23,2.14-8.32-5.23-8.32-3.09-12.36-10.94-2.14-13.08,10.94-3.8.24-6.66-11.18-5.47-6.42-1.43-9.51-7.37v-6.42s-6.66-9.04-5.94-9.27,5.71-4.04,5.71-4.04l-2.85-2.38-18.07,8.32-6.42-.71v-6.42l-3.57-5.47,5.94-8.32-5.94-7.13-11.65-10.46-10.7-1.19-8.56,3.09-7.85,2.85-3.33-1.43v-6.66l-5.11-4.76,4.04-6.66-1.9-5.94,13.08-9.27,9.51-9.75-6.9-7.61,8.08-4.99,2.38-7.37,14.74-4.99,12.84-8.8,6.9-8.32,10.22-5.94,9.75,1.66,6.42-3.09,4.99-7.13,9.75-1.66,9.51-11.18,1.43-11.18,10.22-9.27-.71-9.51,8.32-10.7,1.9-5.47-3.8-6.18-2.38-6.18-4.76-3.57.95-3.8,9.99-4.52.48-6.9,10.46-8.56,6.18-1.9,14.03-15.46,2.38-9.04-2.62-6.9,8.32-11.89-3.8-10.7-3.33-1.43,7.13-4.76h9.04l12.6-4.04,5.23-11.65,7.61-2.62,18.07-1.66,4.28-3.57-21.64.71,4.04-9.04-.71-9.99-3.8-5.71,4.04-8.8,10.46-8.8,8.08-20.21,3.8-4.99s8.56-1.66,8.56-2.38v-4.28l-3.09-6.66,2.38-5.47-5.23-4.04,12.13-9.99,8.32-4.52-.24-4.99-6.66-4.04-13.32-.71-4.52-5.71,6.66-6.42.48-7.85,7.85-6.9,7.85-5.94,7.61.48-7.13-3.57-2.85-11.41-6.66-3.57-8.56-8.32,1.66-11.41-4.76-11.65.24-6.42,6.66-9.04,3.8-1.9-3.57-4.04-11.65.24-4.76-4.04-4.76-6.18,2.38-3.57,13.79-11.41,13.79-14.27,5.23-4.99-.24-2.85,7.61-10.22,5.23-10.46-1.43-4.04,8.32-6.42-2.38-4.99,6.66-4.76,8.56.48,3.57-7.85,9.27-2.62,7.85-13.32-5.23-4.76-6.78-1.43-8.2-4.99-9.75-8.32-3.57-7.85,3.09-15.22,12.6-25.92-.48-10.7,5.23-8.08-2.62-7.85-10.46-3.57-1.9-3.57,7.85-4.76,8.2-2.38,6.3-6.9v-6.18l-4.52-5.71-1.79-11.65-4.63-5.94-.95-5.94-4.99-8.08v-3.8l2.14-8.32,10.7-10.94,1.9-8.08,1.31-5.71Z\"/>\n      <polygon id=\"gest_map_space_OllertonHill\" class=\"gest_map_space\" points=\"625.46 976.04 664.65 973.51 703.85 973.51 720.91 983.63 739.24 983.63 756.94 988.68 763.9 1000.69 759.47 1012.07 783.49 1015.86 797.4 1018.39 810.04 1033.56 810.04 1060.29 798.66 1067.7 767.06 1064.54 756.94 1067.7 720.91 1086.66 701.95 1076.55 665.92 1080.97 639.37 1079.71 615.35 1086.66 600.18 1078.45 588.8 1074.02 573 1063.91 554.2 1030.09 566.04 1021.55 570.47 1004.49 584.37 1002.59 592.59 995.64 609.03 999.43 616.61 995.64 619.14 979.83 625.46 976.04\"/>\n      <polygon id=\"gest_map_space_ShireWood\" class=\"gest_map_space\" points=\"271.47 807.26 290.44 816.75 310.03 823.7 330.26 815.48 346.7 823.7 372.61 830.02 390.31 843.3 412.44 847.09 421.92 850.25 421.92 859.1 428.87 873 446.57 886.46 472.49 886.46 481.34 895.76 504.09 898.29 523.69 898.29 529.38 910.93 542.02 921.68 554.2 926.74 542.65 936.13 544.55 945.07 559.09 961.5 570.47 973.51 579.95 993.06 562.88 1000.06 554.2 1017.76 547.71 1030.09 550.24 1038.62 558.46 1060.29 569.2 1071.49 579.95 1079.71 598.28 1086.66 578.05 1100.57 566.67 1107.52 567.94 1118.9 574.26 1124.59 562.25 1132.18 560 1139.13 561.24 1147.8 563.1 1150.89 547.93 1163.59 527.81 1166.99 518.21 1171.33 514.5 1175.35 511.09 1185.88 496.54 1188.35 481.37 1195.78 444.22 1192.07 413.26 1194.24 358.16 1210.95 323.17 1234.17 316.67 1238.51 306.15 1232 311.41 1227.05 318.53 1211.57 316.36 1200.12 303.67 1190.52 287.26 1178.76 290.05 1170.4 274.26 1153.99 282.31 1152.13 286.33 1146.87 285.71 1136.96 278.59 1123.34 290.98 1114.05 292.52 1107.24 287.88 1099.19 279.21 1088.67 282.31 1081.55 291.29 1077.21 297.17 1067.62 283.55 1050.59 286.64 1045.02 288.5 1035.73 307.07 1028.3 311.41 1019.32 310.17 1010.96 314.19 1001.05 317.6 993.06 317.91 973.51 307.69 959.88 305.22 951.52 298.72 948.42 285.09 948.42 279.21 949.04 279.52 942.54 276.42 936.13 264.35 932.64 251.61 927.99 241.75 922.42 251.61 918.09 254.13 898.89 263.42 884.65 265.59 875.98 262.49 863.6 257.85 862.36 251.61 850.91 253.83 815.3 258.78 809.11 271.47 807.26\"/>\n      <path id=\"gest_map_space_SouthwellForest\" class=\"gest_map_space\" d=\"M499.42,1204.18s20.57-2.14,21-2.79c.43-.64,6-7.93,6-7.93l2.79-11.36,21.86-.86,10.29-6,8.36-6.43,9.21-10.5v-9.64l-3.21-8.57,6.86-1.71,7.93-7.5,1.93-10.5-5.36-6.43,12.64-6.64,14.79-10.5,6.86-4.5,17.14-4.5h10.93l8.36,1.5,15.86-1.5,11.36-2.36,13.5-1.71,9.86,3.86,9.43,7.5,12.43-3.86,15.43-4.58,7.93-2.92,10.07-9,5.79,1.07,8.14,12,7.5,7.93,10.29,3.64,5.79,1.93,8.88,14.36-3.1,15.86-2.36,13.82-.86,7.18,6.31,9.64,2.05,2.79-.86,8.79,3.43,3.21,7.29,3.86,27.22.86,3,5.79-9,9.21-6.43,6.43-.43,5.14,1.71,6.43,4.93,7.71,11.04,8.14,9.54,3.21h7.5l3.86,7.93,8.36,4.29,9.21,3.21-1.29,7.5,2.36,9,9.43,3.21,16.29,3.86v3l-9.43,8.79-1.29,3.43-10.29,3.86-9.86,9.64h-5.57l-8.36,4.29-4.29,6v4.07l-8.14,4.5.43,3.86-8.46,9.21,5.89,5.57-5.89,5.57-5.47,3.86-1.93,6.86-9.21,11.79,3.86,3.43-2.79,6.86-10.5,9-14.36,4.71-3,3.43,3.43,3.43-3.43,3.64-.43,6.43,1.29,4.5-6,6.86-10.5,7.29-1.71,8.36-9,9.64.64,3.43-12,6.86-7.71,3.64h-9.86l-22.72,2.57-3.43,3.64h-18l-4.71-4.29-7.71-4.29-2.14,2.36,7.71,7.5,5.04,4.07-8.04,6.43-4.5,6.21-4.93,3,1.93,6.43-7.07,7.29,4.5,6.86-3.64,4.71s-6.64,3.21-7.29,3.43c-.64.21-14.36,0-14.36,0l-9.43-3.21,6,6.21-3.21,4.5h-7.07l-15,6.21-5.14,1.29-11.79-5.36-5.79,1.71,13.93,7.07-12,5.79-11.14-6.21-15.86.64-9.21-9.43s-7.5-4.93-7.29-5.57,1.71-12.43,1.71-12.43l12.43-13.72,6.64-10.72,14.36-7.5v-19.5l9-21.86,3.86-18,2.36-16.29.43-21.22-.86-18.22-3.21-17.36-4.5-16.07-6-17.57-11.57-22.72-11.14-16.5-10.29-14.14-17.79-14.79-13.07-10.07-11.02-9-15.33-8.36-19.5-7.93Z\"/>\n      <path id=\"gest_map_space_Nottingham\" class=\"gest_map_space\" d=\"M431.34,1207.25c-14.47.79-60.24,5.12-101.22,40.83-43.83,38.2-52.94,86.82-55.21,100.07-2.17,12.62-4.53,34.87.58,61.53,9.69,50.63,44.58,108.31,103.52,131.7,37.87,15.02,74.07,11.3,87.41,9.78,10.33-1.18,28.15-3.21,47.16-11.5,72.91-31.83,90.22-124.06,91.44-131.12,2.83-16.37,8.71-53.25-8.05-94.89-24.24-60.2-77.53-84.93-90.86-90.86-30.6-13.62-58.43-15.6-74.76-15.53Z\"/>\n    </svg>\n    ".concat(tplTrack({ config: JUSTICE_TRACK_CONFIG }), "\n    ").concat(tplTrack({ config: ORDER_TRACK }), "\n    ").concat(tplTrack({ config: PARISH_STATUS_BOXES }), "\n    ").concat(tplTrack({ config: ROYAL_INSPECTION_TRACK }), "\n    ").concat(tplTrack({ config: INITIATIVE_TRACK }), "\n    ").concat(tplTrack({ config: UNIQUE_SPACES }), "\n    ").concat(tplSpaces(), "\n    ").concat(tplTrack({ config: BRIDGE_LOCATIONS }), "\n  </div>");
};
var getRobinHoodPlotsAndDeeds = function () { return ({
    plots: [
        {
            title: _('Recruit'),
            cost: _('1 Shilling per space.'),
            location: _('Up to 3 non-Submissive spaces.'),
            procedure: _('Place 1 Merry Man, or replace a Merry Man with a Camp (+1 Justice). If there is already a Camp, instead place up to 2 Merry Men or flip all Hidden.'),
        },
        {
            title: _('Sneak'),
            cost: _('1 Shilling per origin.'),
            location: _('Up to 3 origin spaces with Merry Men.'),
            procedure: _('Move any Merry Men to adjacent spaces. If a destination is Submissive and moving Merry Men plus Henchmen there exceeds 3, Reveal them; otherwise Hide all moving Merry Men.'),
        },
        {
            title: _('Rob'),
            cost: _('0 Shillings.'),
            location: _('Up to 3 spaces with Hidden Merry Men and/or Robin Hood.'),
            procedure: _("Select target and Reveal any number of Merry Men, then roll against target's Defense Value."),
        },
    ],
    deeds: [
        {
            title: _('Turncoat'),
            cost: _('1 Shilling.'),
            location: _('1 Revolting Parish with a Merry Man.'),
            procedure: _('Replace 1 Henchman with a Merry Man.'),
        },
        {
            title: _('Donate'),
            cost: _('2 Shillings per Parish.'),
            location: _('Up to 2 Submissive Parishes with any Merry Men equal or greater than Henchmen.'),
            procedure: _('Set each Parish to Revolting.'),
        },
        {
            title: _('Swashbuckle'),
            cost: _('0 Shillings.'),
            location: _('1 space with Robin Hood.'),
            procedure: _('Hide Robin Hood and up to 1 Merry Man, then move them to any adjacent spaces; or place Robin Hood from Prison in or adjacent to Nottingham, Revealed.'),
        },
        {
            title: _('Inspire'),
            cost: _('0 Shillings.'),
            location: _('1 Parish with Hidden Robin Hood.'),
            procedure: _('Reveal Robin Hood to set the Parish to Revolting, or if it is already Revolting instead Reveal Robin Hood to shift Royal Favour one step towards Justice.'),
        },
    ],
}); };
var getSheriffPlotsAndDeeds = function () { return ({
    plots: [
        {
            title: _('Hire'),
            cost: _('2 Shilling per space.'),
            location: _('Up to 3 spaces (see Procedure for details).'),
            procedure: _('Place up to 2 Henchmen in Submissive Parishes, up to 4 Henchmen in Nottingham, and set Revolting Parishes with more Henchmen than Merry Men to Submissive.'),
        },
        {
            title: _('Patrol'),
            cost: _('2 Shillings per destination.'),
            location: _('Up to 3 destination spaces.'),
            procedure: _('Move in any number of Henchmen from adjacent spaces, then reveal 1 Merry Man per Henchmen now there (or per 2 Henchmen in Forest).'),
        },
        {
            title: _('Capture'),
            cost: _('0 Shillings.'),
            location: _('Up to 3 spaces with Henchmen.'),
            procedure: _('Remove 1 Revealed enemy piece per Henchmen (or per 2 Henchmen in Revolting Parishes). Remove Merry Men to Prison (Robin Hood then Camps last).'),
        },
    ],
    deeds: [
        {
            title: _('Ride'),
            cost: _('0 Shilling.'),
            location: _('Nottingham and 1 Parish.'),
            procedure: _('Move up to 4 Henchmen from Nottingham to any one Parish.'),
        },
        {
            title: _('Confiscate'),
            cost: _('0 Shillings.'),
            location: _('Up to 2 Submissive Parishes with Henchmen.'),
            procedure: _('Place an Available Carriage in each Parish, then set each Parish where a Carriage was placed to Revolting.'),
        },
        {
            title: _('Disperse'),
            cost: _('3 Shillings.'),
            location: _('1 Parish with Henchmen.'),
            procedure: _('Remove 2 enemy pieces to Available (Camps last, shift one step towards Order if a Camp is removed), then set the Parish to Revolting.'),
        },
    ],
}); };
var InfoPanel = (function () {
    function InfoPanel(game) {
        this.game = game;
        var gamedatas = game.gamedatas;
        this.setup({ gamedatas: gamedatas });
    }
    InfoPanel.prototype.clearInterface = function () { };
    InfoPanel.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
    };
    InfoPanel.prototype.updateBalladInfo = function (_a) {
        var balladNumber = _a.balladNumber, eventNumber = _a.eventNumber;
        var node = document.getElementById('gest_ballad_info_ballad_number');
        if (!node) {
            return;
        }
        node.replaceChildren(this.getBalladName({ balladNumber: balladNumber }));
        var eventNode = document.getElementById('gest_ballad_info_event_number');
        if (!eventNode) {
            return;
        }
        var eventText = this.game.format_string_recursive(_(' Event ${eventNumber} / 7'), {
            eventNumber: eventNumber,
        });
        if (eventNumber === 8 && balladNumber !== 0) {
            eventText = _('Royal Inspection Round');
        }
        else if (balladNumber === 0) {
            eventText = '';
        }
        eventNode.replaceChildren(eventText);
    };
    InfoPanel.prototype.setupPlotsAndDeedsInfo = function () {
        var cardArea = document.getElementById('gest_card_area');
        if (this.game.getPlayerId() ===
            this.game.playerManager.getRobinHoodPlayerId()) {
            cardArea.insertAdjacentHTML('afterbegin', tplRobinHoodPlotsAndDeeds());
        }
        else {
            cardArea.insertAdjacentHTML('beforeend', tplRobinHoodPlotsAndDeeds());
        }
        if (this.game.getPlayerId() ===
            this.game.playerManager.getSheriffPlayerId()) {
            cardArea.insertAdjacentHTML('afterbegin', tplSheriffPlotsAndDeeds());
        }
        else {
            cardArea.insertAdjacentHTML('beforeend', tplSheriffPlotsAndDeeds());
        }
    };
    InfoPanel.prototype.setup = function (_a) {
        var gamedatas = _a.gamedatas;
        var node = document.getElementById('player_boards');
        if (!node) {
            return;
        }
        node.insertAdjacentHTML('afterbegin', tplInfoPanel());
        this.updateBalladInfo(gamedatas.ballad);
    };
    InfoPanel.prototype.getBalladName = function (_a) {
        var balladNumber = _a.balladNumber;
        switch (balladNumber) {
            case 0:
                return _('Setup');
            case 1:
                return _('1st Ballad');
            case 2:
                return _('2nd Ballad');
            case 3:
                return _('3rd Ballad');
            default:
                return '';
        }
    };
    return InfoPanel;
}());
var tplInfoPanel = function () { return "<div class='player-board' id=\"info_panel\">\n  <div id=\"gest_ballad_info\">\n    <span id=\"gest_ballad_info_ballad_number\"></span>\n    <span id=\"gest_ballad_info_event_number\"></span>\n  </div>\n  <div id=\"info_panel_buttons\">\n    \n  </div>\n</div>"; };
var tplPlotDeedInfo = function (_a) {
    var title = _a.title, cost = _a.cost, location = _a.location, procedure = _a.procedure;
    return "\n<div class=\"gest_plot_deed_item\">\n  <span class=\"gest_plot_deed_title\">".concat(_(title), "</span>\n  <div class=\"gest_plot_deed_info_row\">\n    <span class=\"gest_plot_deed_info_label\">").concat(_('Cost: '), "</span><span>").concat(_(cost), "</span>\n  </div>\n      <div class=\"gest_plot_deed_info_row\"?\n    <span class=\"gest_plot_deed_info_label\">").concat(_('Location: '), "</span><span>").concat(_(location), "</span>\n  </div>\n      <div class=\"gest_plot_deed_info_row\">\n    <span class=\"gest_plot_deed_info_label\">").concat(_('Procedure: '), "</span><span>").concat(_(procedure), "</span>\n  </div>\n</div>");
};
var tplRobinHoodPlotsAndDeeds = function () { return "\n  <div class=\"gest_plots_and_deeds_container\" data-side=\"robinHood\">\n    <span class=\"gest_plot_title\">".concat(_('Plots'), "</span>\n    <div class=\"gest_plots_row\">\n        ").concat(getRobinHoodPlotsAndDeeds()
    .plots.map(function (info) { return tplPlotDeedInfo(info); })
    .join(''), "\n    </div>\n    <span class=\"gest_plot_title\" style=\"margin-top: 8px;\">").concat(_('Deeds'), "</span>\n    <div class=\"gest_plots_row\" data-items=\"4\">\n        ").concat(getRobinHoodPlotsAndDeeds()
    .deeds.map(function (info) { return tplPlotDeedInfo(info); })
    .join(''), "\n    </div>\n  </div>\n"); };
var tplSheriffPlotsAndDeeds = function () { return "\n  <div class=\"gest_plots_and_deeds_container\" data-side=\"sheriff\">\n    <span class=\"gest_plot_title\">".concat(_('Plots'), "</span>\n    <div class=\"gest_plots_row\">\n        ").concat(getSheriffPlotsAndDeeds()
    .plots.map(function (info) { return tplPlotDeedInfo(info); })
    .join(''), "\n    </div>\n    <span class=\"gest_plot_title\" style=\"margin-top: 8px;\">").concat(_('Deeds'), "</span>\n    <div class=\"gest_plots_row\">\n        ").concat(getSheriffPlotsAndDeeds()
    .deeds.map(function (info) { return tplPlotDeedInfo(info); })
    .join(''), "\n    </div>\n  </div>\n"); };
var getTravellersConfig = function () { return [
    {
        name: _('Rich Merchant'),
        inDeck: '(x2)',
        defense: 1,
        success: _('2 Shillings / 4 Shillings (Victim)'),
        failure: _('No effect / 2 Shillings to Sheriff'),
        image: 'RichMerchant',
    },
    {
        name: _('Noble Knight'),
        inDeck: '(x2)',
        defense: 2,
        success: _('3 Shillings / 5 Shillings (Victim)'),
        failure: _('No effect / Captured'),
        image: 'NobleKnight',
    },
    {
        name: _('Monks'),
        inDeck: '(x3)',
        defense: 0,
        success: _('1 Shilling / 3 Shillings (Victim)'),
        failure: _('No effect / Submissive'),
        image: 'Monks',
    },
    {
        name: _('The Potter'),
        inDeck: '(x1)',
        defense: 1,
        success: _('3 Shillings / 2 from Sheriff and +1 Justice (Victim)'),
        failure: _('No effect / Robin Hood Captured (+1 Order)'),
        image: 'ThePotter',
    },
    {
        name: _('The Miller\'s Son'),
        inDeck: '(x1)',
        defense: 0,
        success: _('2 Shillings / 1 Shilling and Merry Man (Victim)'),
        failure: _('No effect / Henchman'),
        image: 'TheMillersSon',
    },
    {
        name: _('Bishop of Hereford'),
        inDeck: '(x1 added by Event)',
        defense: 1,
        success: _('3 Shillings / 6 Shillings (Victim)'),
        failure: _('No effect / 3 Shillings to Sheriff and Submissive'),
        image: 'BishopOfHereford',
    },
    {
        name: _('Guy of Gisborne'),
        inDeck: '(x1 added by Event)',
        defense: 3,
        success: _('Remove'),
        failure: _('Captured'),
        image: 'GuyOfGisborne',
    },
    {
        name: _('Richard at the Lea'),
        inDeck: '(x1)',
        defense: 1,
        success: _('2 Shillings'),
        failure: _('No Effect'),
        extraText: _('Or pay 3 Shillings for Camp and Revolt in Retford'),
        image: 'RichardAtTheLea',
    },
]; };
var robSummarySteps = function () {
    return [
        _('Reveal at least one Hidden Merry Man in the Rob space (or use Robin Hood)'),
        _('Select a target: a Traveller drawn from the deck, a Carriage in the space, or the Treasury if in Nottingham'),
        _('Select Traveller option or reveal Carriage'),
        _('Roll a green die in Forests and Revolting Parishes, or a white die in Submissive or Passive spaces'),
        _('If the number of just Revealed Merry Men (always count Robin Hood, even if already Revealed) plus the die result is greater than the target\'s Defense plus the number of Henchmen in the space, the Rob is a success, otherwise it is a failure'),
    ];
};
var carriagesRobInfo = function () {
    return [
        {
            image: 'TallageCarriage',
            name: _('Tallage Carriage'),
            defense: 0,
            title: _('Tallage: 0 Defense'),
            success: _('${tkn_boldItalicText_success} 5 Shillings, send to Used Carriages'),
            failure: _('${tkn_boldItalicText_failure} No effect (Carriage stays revealed'),
            nottingham: _('5 Shillings, +1 Order'),
        },
        {
            image: 'TributeCarriage',
            name: _('Tribute Carriage'),
            defense: 0,
            title: _('Tribute: 0 Defense'),
            success: _('${tkn_boldItalicText_success} 2 Shillings, +1 Justice, send to Used Carriages'),
            failure: _('${tkn_boldItalicText_failure} No effect (Carriage stays revealed'),
            nottingham: _('2 Shillings, +2 Order'),
        },
        {
            image: 'TrapCarriage',
            name: _('Trap Carriage'),
            defense: 2,
            title: _('Trap: 2 Defense'),
            success: _('${tkn_boldItalicText_success} 2 Shillings, send to Used Carriages'),
            failure: _('${tkn_boldItalicText_failure} Captured (Carriage stays revealed'),
            nottingham: _('2 Shillings, +1 Order'),
        }
    ];
};
var InformationModal = (function () {
    function InformationModal(game) {
        this.selectedTab = "orderJustice";
        this.tabs = {
            orderJustice: {
                text: _("Order & Justice"),
            },
            robSummary: {
                text: _("Rob Summary"),
            },
            travellers: {
                text: _("Travellers"),
            },
            royalInspectionRound: {
                text: _("Royal Inspection Round"),
            },
        };
        this.game = game;
        var gamedatas = game.gamedatas;
        this.setup({ gamedatas: gamedatas });
    }
    InformationModal.prototype.clearInterface = function () { };
    InformationModal.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
    };
    InformationModal.prototype.addButton = function (_a) {
        var gamedatas = _a.gamedatas;
        var configPanel = document.getElementById("info_panel_buttons");
        if (configPanel) {
            configPanel.insertAdjacentHTML("beforeend", tplInformationButton());
        }
    };
    InformationModal.prototype.setupModal = function (_a) {
        var gamedatas = _a.gamedatas;
        this.modal = new Modal("information_modal", {
            class: "information_modal",
            closeIcon: "fa-times",
            contents: tplInformationModalContent({
                tabs: this.tabs,
                game: this.game,
            }),
            closeAction: "hide",
            verticalAlign: "flex-start",
            breakpoint: 740,
        });
    };
    InformationModal.prototype.setup = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.addButton({ gamedatas: gamedatas });
        this.setupModal({ gamedatas: gamedatas });
        this.informationModalContent();
        this.changeTab({ id: this.selectedTab });
        Object.keys(this.tabs).forEach(function (id) {
            dojo.connect($("information_modal_tab_".concat(id)), "onclick", function () {
                return _this.changeTab({ id: id });
            });
        });
        dojo.connect($("information_button"), "onclick", function () {
            return _this.modal.show();
        });
    };
    InformationModal.prototype.informationModalContent = function () { };
    InformationModal.prototype.changeTab = function (_a) {
        var id = _a.id;
        var currentTab = document.getElementById("information_modal_tab_".concat(this.selectedTab));
        var currentTabContent = document.getElementById("gest_".concat(this.selectedTab));
        currentTab.removeAttribute("data-state");
        if (currentTabContent) {
            currentTabContent.style.display = "none";
        }
        this.selectedTab = id;
        var tab = document.getElementById("information_modal_tab_".concat(id));
        var tabContent = document.getElementById("gest_".concat(this.selectedTab));
        tab.setAttribute("data-state", "selected");
        if (tabContent) {
            tabContent.style.display = "";
        }
    };
    return InformationModal;
}());
var tplInformationButton = function () { return "<button id=\"information_button\" type=\"button\" class=\"information_modal_button\">\n<div class=\"information_modal_icon\"></div>\n</button>"; };
var tplInfoModalTab = function (_a) {
    var id = _a.id, text = _a.text;
    return "\n  <div id=\"information_modal_tab_".concat(id, "\" class=\"information_modal_tab\">\n    <span>").concat(_(text), "</span>\n  </div>");
};
var orderJusticeInfo = function (_a) {
    var game = _a.game;
    return "\n  <div>\n    <div style=\"margin-bottom: 2px;\">\n      <span>".concat(game.format_string_recursive(_('To shift Royal Favour towards ${tkn_boldText_order}'), { tkn_boldText_order: _('Order:') }), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(_('Some Event and Traveller effects (+1 Order)'), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(_('Remove Camps (+1 Order)'), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(_('Capture Robin Hood (+1 Order)'), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(_('Bring Carriages to Nottingham (+1 Order, +2 for Tribute)'), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(game.format_string_recursive(_('${tkn_boldItalicText_royalInspection} 5-7 Submissive Parishes (+1 Order)'), {
        tkn_boldItalicText_royalInspection: _('Royal Inspection:'),
    }), "</span>\n    </div>\n  </div>\n  <div>\n  </div>\n  <div style=\"margin-top: 16px;\">\n    <div style=\"margin-bottom: 2px;\">\n      <span>").concat(game.format_string_recursive(_('To shift Royal Favour towards ${tkn_boldText_order}'), { tkn_boldText_order: _('Justice:') }), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(game.format_string_recursive(_('Some Event and Traveller effects (+1 Justice)'), { tkn_arrow: '=>' }), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(game.format_string_recursive(_('Place Camps (+1 Justice)'), {
        tkn_arrow: '=>',
    }), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(game.format_string_recursive(_('Inspire in Revolting Parishes (+1 Justice)'), { tkn_arrow: '=>' }), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(game.format_string_recursive(_('Rob Tribute Carriages or the Treasury (+1 Justice)'), { tkn_arrow: '=>' }), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(game.format_string_recursive(_('${tkn_boldItalicText_royalInspection} 3-4 Submissive Parishes (+1 Justice)'), {
        tkn_boldItalicText_royalInspection: _('Royal Inspection:'),
    }), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(game.format_string_recursive(_('${tkn_boldItalicText_royalInspection} 1-2 Submissive Parishes (+2 Justice)'), {
        tkn_boldItalicText_royalInspection: _('Royal Inspection:'),
    }), "</span>\n    </div>\n    <div class=\"gest_row\">\n      <div class=\"gest_arrow\"></div>\n      <span>").concat(game.format_string_recursive(_('${tkn_boldItalicText_royalInspection} 0 Submissive Parishes (+3 Justice)'), {
        tkn_boldItalicText_royalInspection: _('Royal Inspection:'),
    }), "</span>\n    </div>\n  </div>\n");
};
var robSummaryInfo = function (_a) {
    var game = _a.game;
    return "\n  <div>\n      ".concat(robSummarySteps()
        .map(function (step) { return "\n          <div class=\"gest_row\">\n            <div class=\"gest_arrow\"></div>\n            <span>".concat(_(step), "</span>\n          </div>\n        "); })
        .join(''), "\n    <div class=\"gest_row\" style=\"margin-top: 16px;\">\n      <div id=\"gest_nottingham_image\"></div>\n      <div>\n        <span class=\"gest_title\">").concat(_('Treasury'), "</span>\n          <div><span>").concat(game.format_string_recursive(_('${tkn_boldItalicText_success} 2 Shillings from Sheriff, +1 Justice'), {
        tkn_boldItalicText_success: _('Success: '),
    }), "</span></div>\n      <div>\n        <span>").concat(game.format_string_recursive(_('${tkn_boldItalicText_failure} No effect'), {
        tkn_boldItalicText_failure: _('Failure: '),
    }), "</span></div>\n      </div>\n    </div>\n    <div style=\"margin-top: 16px;\">\n        <span class=\"gest_title\" style=\"margin-left: 68px;\">").concat(_('Carriages'), "</span>\n        ").concat(carriagesRobInfo()
        .map(function (info) { return "\n          <div class=\"gest_row\" style=\"margin-top: 8px;\">\n            <div class=\"gest_force_side\" data-type=\"".concat(info.image, "\" data-revealed=\"true\"></div>\n            <div>\n              <div><span class=\"gest_section_title\">").concat(_(info.title), "</span></div>\n              <div><span>").concat(game.format_string_recursive(_(info.success), {
        tkn_boldItalicText_success: _('Success: '),
    }), "</span></div>\n              <div>\n                <span>").concat(game.format_string_recursive(_(info.failure), {
        tkn_boldItalicText_failure: _('Failure: '),
    }), "</span></div>\n            </div>\n          </div>   \n          "); })
        .join(''), "\n    </div>\n  </div>\n");
};
var travellerInfoRow = function (info) { return "<div class=\"gest_traveller_info_row\">\n        <div class=\"gest_traveller_image\" data-image=\"".concat(info.image, "\"></div>\n        <div class=\"gest_traveller_stats_container\">\n          <div class=\"gest_row\">\n            <span class=\"gest_traveller_name\">").concat(_(info.name), "</span>\n            <span class=\"gest_traveller_deck_count\">").concat(_(info.inDeck), "</span>\n            <span style=\"font-weight: bold;\">: </span>\n            <span class=\"gest_traveller_defense\">").concat(info.defense, " ").concat(_('Defense'), "</span>\n          </div>\n          <div class=\"gest_row\">\n            <span class=\"gest_rob_result\">").concat(_('Success: '), "</span>\n            <span>").concat(_(info.success), "</span>\n          </div>\n          <div class=\"gest_row\">\n            <span class=\"gest_rob_result\">").concat(_('Failure: '), "</span>\n            <span>").concat(_(info.failure), "</span>\n          </div>\n  </div>\n</div>"); };
var royalInspectionUnrest = function (_a) {
    var game = _a.game;
    return "\n  <div class=\"gest_royal_inspection_info\">\n    <div>    \n      <span>".concat(game.format_string_recursive(_('${tkn_boldText_unrest} Check the number of Submissive Parises:'), { tkn_boldText_unrest: _('Unrest: ') }), "</span>\n    </div>\n    <div class=\"gest_row\">    \n      <span class=\"gest_list_item\">\u2022</span>\n      <span>").concat(_('5-7 Submissive Parishes: +1 Order'), "</span>\n    </div>\n    <div class=\"gest_row\">    \n      <span class=\"gest_list_item\">\u2022</span>\n      <span>").concat(_('3-4 Submissive Parishes: +1 Justice'), "</span>\n    </div>\n    <div class=\"gest_row\">    \n      <span class=\"gest_list_item\">\u2022</span>\n      <span\">").concat(_('1-2 Submissive Parishes: +2 Justice'), "</span>\n    </div>\n    <div class=\"gest_row\">    \n      <span class=\"gest_list_item\">\u2022</span>\n      <span>").concat(_('0 Submissive Parishes: +3 Justice'), "</span>\n    </div>\n    <div><span>").concat(_('Then check for automatic victory (Royal Favour at 5 or more)'), "</span></div>\n  </div>\n");
};
var royalInspectionMischief = function (_a) {
    var game = _a.game;
    return "\n  <div class=\"gest_royal_inspection_info\">\n    <span>".concat(game.format_string_recursive(_('${tkn_boldText_mischief} Robin Hood gains 1 Shilling for each Camp in a Forest or Ollerton Hill, then performs a Single Rob Plot and may Donate in up to two Parishes. Return half (rounded down) Merry Men in Prison to Available.'), { tkn_boldText_mischief: _('Mischief: ') }), "</span>\n  </div>\n");
};
var royalInspectionGovernance = function (_a) {
    var game = _a.game;
    return "\n  <div class=\"gest_royal_inspection_info\">\n    <span>".concat(game.format_string_recursive(_('${tkn_boldText_governance} Sheriff gains 1 Shilling for each Submissive space (including Nottingham). Remove half (rounded down) Henchmen from each Revolting Parish. Set any Revolting Parish where Henchmen now outnumber Merry Men to Submissive.'), { tkn_boldText_governance: _('Governance: ') }), "</span>\n  </div>\n");
};
var royalInspectionRedployment = function (_a) {
    var game = _a.game;
    return "\n  <div class=\"gest_royal_inspection_info\">\n    <div><span>".concat(game.format_string_recursive(_('${tkn_boldText_redeployment} Sheriff then Robin Hood must redeploy their Henchmen and Merry Men:'), { tkn_boldText_redeployment: _('Redeployment: ') }), "</span></div>\n    <div class=\"gest_row\">\n      <span class=\"gest_list_item\">\u2022</span>\n      <span>").concat(_('Henchmen must move from Revolting Parishes and Forests to Submissive spaces, any other may move to Nottingham. Used Carriages to Available.'), "</span></li>\n    </div>  \n    <div class=\"gest_row\">    \n      <span class=\"gest_list_item\">\u2022</span>\n      <span>").concat(_('Merry Men must move from Submissive spaces to Forests or Camps, any others may do the same, then flip all Hidden. Place Robin Hood from Available to any Forest, then may secretly swap him with any Merry Man.'), "</span></li>\n    </div>\n  </div>\n");
};
var royalInspectionReset = function (_a) {
    var game = _a.game;
    return "\n  <div class=\"gest_royal_inspection_info\">\n    <span>".concat(game.format_string_recursive(_('${tkn_boldText_reset} Shuffle the Traveller deck discard pile back into the main Traveller deck. Set Robin Hood to First Eligible and the Sheriff to Second Eligible, then draw the next Event card and continue play.'), { tkn_boldText_reset: _('Reset: ') }), "</span>\n  </div>\n");
};
var royalInspectionRoundInfo = function (_a) {
    var game = _a.game;
    return "\n  <div class=\"gest_row\">\n    <div class=\"gest_arrow\"></div>\n    ".concat(royalInspectionUnrest({ game: game }), "\n  </div>\n  <div class=\"gest_row\">\n    <div class=\"gest_arrow\"></div>\n    ").concat(royalInspectionMischief({ game: game }), "\n  </div>  \n  <div class=\"gest_row\">\n    <div class=\"gest_arrow\"></div>\n    ").concat(royalInspectionGovernance({ game: game }), "\n  </div>\n  <div class=\"gest_row\">\n    <div class=\"gest_arrow\"></div>\n    ").concat(royalInspectionRedployment({ game: game }), "\n  </div>\n  <div class=\"gest_row\">\n    <div class=\"gest_arrow\"></div>\n    ").concat(royalInspectionReset({ game: game }), "\n  </div>  \n");
};
var tplInformationModalContent = function (_a) {
    var tabs = _a.tabs, game = _a.game;
    var TRAVELLERS_CONFIG = getTravellersConfig();
    return "<div id=\"information_modal_content\">\n    <div class=\"information_modal_tabs\">\n      ".concat(Object.entries(tabs)
        .map(function (_a) {
        var id = _a[0], info = _a[1];
        return tplInfoModalTab({ id: id, text: info.text });
    })
        .join(''), "\n    </div>\n      <div id=\"gest_orderJustice\" style=\"display: none;\">\n        ").concat(orderJusticeInfo({ game: game }), "\n      </div>\n      <div id=\"gest_robSummary\" style=\"display: none;\">\n      ").concat(robSummaryInfo({ game: game }), "\n    </div>\n    <div id=\"gest_travellers\" style=\"display: none;\">\n    ").concat(TRAVELLERS_CONFIG.map(travellerInfoRow).join(''), "\n    </div>\n    <div id=\"gest_royalInspectionRound\" style=\"display: none;\">\n    ").concat(royalInspectionRoundInfo({ game: game }), "\n    </div>\n  </div>");
};
var LOG_TOKEN_BOLD_TEXT = 'boldText';
var LOG_TOKEN_BOLD_ITALIC_TEXT = 'boldItalicText';
var LOG_TOKEN_NEW_LINE = 'newLine';
var LOG_TOKEN_CARD = 'card';
var LOG_TOKEN_CARD_NAME = 'cardName';
var LOG_TOKEN_DIE_RESULT = 'dieResult';
var tooltipIdCounter = 0;
var getTokenDiv = function (_a) {
    var key = _a.key, value = _a.value, game = _a.game;
    var splitKey = key.split('_');
    var type = splitKey[1];
    switch (type) {
        case LOG_TOKEN_BOLD_TEXT:
            return tlpLogTokenBoldText({ text: value });
        case LOG_TOKEN_BOLD_ITALIC_TEXT:
            return tlpLogTokenBoldText({ text: value, italic: true });
        case LOG_TOKEN_CARD:
            return tplLogTokenCard(value);
        case LOG_TOKEN_CARD_NAME:
            var cardNameTooltipId = undefined;
            var withTooltip = value.includes(':');
            if (withTooltip) {
                cardNameTooltipId = "gest_tooltip_".concat(game._last_tooltip_id);
                game.tooltipsToMap.push([game._last_tooltip_id, value.split(':')[0]]);
                game._last_tooltip_id++;
            }
            return tlpLogTokenBoldText({
                text: withTooltip ? value.split(':')[1] : value,
                tooltipId: cardNameTooltipId,
            });
        case LOG_TOKEN_DIE_RESULT:
            return tplLogTokenDieResult(value);
        case LOG_TOKEN_NEW_LINE:
            return '<br>';
        default:
            return value;
    }
};
var tlpLogTokenBoldText = function (_a) {
    var text = _a.text, tooltipId = _a.tooltipId, _b = _a.italic, italic = _b === void 0 ? false : _b;
    return "<span ".concat(tooltipId ? "id=\"".concat(tooltipId, "\"") : '', " style=\"font-weight: 700;").concat(italic ? ' font-style: italic;' : '', "\">").concat(_(text), "</span>");
};
var tplLogTokenPlayerName = function (_a) {
    var name = _a.name, color = _a.color;
    return "<span class=\"playername\" style=\"color:#".concat(color, ";\">").concat(name, "</span>");
};
var tplLogTokenCard = function (id) {
    return "<div class=\"gest_log_card gest_card gest_card_side\" data-card-id=\"".concat(id, "\"></div>");
};
var tplLogTokenDieResult = function (dieResult) {
    var _a = dieResult.split(':'), color = _a[0], result = _a[1];
    return "<div class=\"gest_log_die\" data-die-color=\"".concat(color, "\"><span class=\"gest_log_die_value\">").concat(Number(result) > 0 ? '+' : '').concat(result, "</span></div>");
};
var MarkerManager = (function (_super) {
    __extends(MarkerManager, _super);
    function MarkerManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(card.id); },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    MarkerManager.prototype.clearInterface = function () { };
    MarkerManager.prototype.setupDiv = function (token, div) {
        div.classList.add('gest_marker');
    };
    MarkerManager.prototype.setupFrontDiv = function (token, div) {
        div.classList.add('gest_marker_side');
        div.setAttribute('data-side', 'front');
        div.setAttribute('data-type', token.type);
    };
    MarkerManager.prototype.setupBackDiv = function (token, div) {
        div.classList.add('gest_marker_side');
        div.setAttribute('data-side', 'back');
        div.setAttribute('data-type', token.type);
    };
    MarkerManager.prototype.isCardVisible = function (token) {
        return token.side === 'front';
    };
    return MarkerManager;
}(CardManager));
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var NotificationManager = (function () {
    function NotificationManager(game) {
        this.game = game;
        this.subscriptions = [];
    }
    NotificationManager.prototype.setupNotifications = function () {
        var _this = this;
        console.log('notifications subscriptions setup');
        dojo.connect(this.game.framework().notifqueue, 'addToLog', function () {
            _this.game.addLogClass();
        });
        var notifs = [
            'log',
            'clearTurn',
            'refreshUI',
            'refreshForcesPrivate',
            'placeBridge',
            'captureMerryMen',
            'chooseAction',
            'drawAndRevealCard',
            'drawAndRevealTravellerCard',
            'gainShillings',
            'hideForce',
            'moveCarriage',
            'moveCarriagePrivate',
            'moveCarriagePublic',
            'moveMerryMenPublic',
            'moveMerryMenPrivate',
            'moveForces',
            'moveRoyalFavourMarker',
            'moveRoyalInspectionMarker',
            'passAction',
            'revealCarriage',
            'revealForce',
            'robTakeTwoShillingsFromTheSheriff',
            'parishStatus',
            'payShillings',
            'placeCardInTravellersDeck',
            'placeForceAll',
            'placeForce',
            'placeForcePrivate',
            'placeMerryMenPublic',
            'placeMerryMenPrivate',
            'putCardInVictimsPile',
            'putTravellerInDiscardPile',
            'redeploymentSheriff',
            'removeCardFromGame',
            'removeForceFromGamePrivate',
            'removeForceFromGamePublic',
            'returnTravellersDiscardToMainDeck',
            'returnToSupplyPublic',
            'returnToSupplyPrivate',
            'sneakMerryMen',
            'sneakMerryMenPrivate',
            'startOfRound',
        ];
        notifs.forEach(function (notifName) {
            _this.subscriptions.push(dojo.subscribe(notifName, _this, function (notifDetails) {
                debug("notif_".concat(notifName), notifDetails);
                var promise = _this["notif_".concat(notifName)](notifDetails);
                var promises = promise ? [promise] : [];
                var minDuration = 1;
                var msg = _this.game.format_string_recursive(notifDetails.log, notifDetails.args);
                _this.game.clearPossible();
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                    $('generalactions').innerHTML = '';
                    minDuration = MIN_NOTIFICATION_MS;
                }
                if (_this.game.animationManager.animationsActive()) {
                    Promise.all(__spreadArray(__spreadArray([], promises, true), [sleep(minDuration)], false)).then(function () {
                        return _this.game.framework().notifqueue.onSynchronousNotificationEnd();
                    });
                }
                else {
                    _this.game.framework().notifqueue.setSynchronousDuration(0);
                }
            }));
            _this.game.framework().notifqueue.setSynchronous(notifName, undefined);
            [
                'placeMerryMenPublic',
                'returnToSupplyPublic',
                'moveCarriagePublic',
                'placeForce',
                'sneakMerryMen',
                'moveMerryMenPublic',
                'removeForceFromGamePublic',
            ].forEach(function (notifId) {
                _this.game
                    .framework()
                    .notifqueue.setIgnoreNotificationCheck(notifId, function (notif) {
                    return notif.args.playerId == _this.game.getPlayerId();
                });
            });
        });
    };
    NotificationManager.prototype.destroy = function () {
        dojo.forEach(this.subscriptions, dojo.unsubscribe);
    };
    NotificationManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.game.playerManager.getPlayer({ playerId: playerId });
    };
    NotificationManager.prototype.currentPlayerIsRobinHood = function () {
        var currentPlayerId = this.game.getPlayerId();
        var robinHoodPlayerId = this.game.playerManager.getRobinHoodPlayerId();
        return currentPlayerId === robinHoodPlayerId;
    };
    NotificationManager.prototype.currentPlayerIsSheriff = function () {
        var currentPlayerId = this.game.getPlayerId();
        var sheriffPlayerId = this.game.playerManager.getSheriffPlayerId();
        return currentPlayerId === sheriffPlayerId;
    };
    NotificationManager.prototype.notif_log = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                debug('notif_log', notif.args);
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_clearTurn = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var notifIds;
            return __generator(this, function (_a) {
                notifIds = notif.args.notifIds;
                this.game.cancelLogs(notifIds);
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_refreshUI = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var gamedatas, updatedGamedatas;
            return __generator(this, function (_a) {
                gamedatas = notif.args.datas;
                updatedGamedatas = __assign(__assign({}, this.game.gamedatas), gamedatas);
                this.game.gamedatas = updatedGamedatas;
                this.game.clearInterface();
                this.game.gameMap.updateInterface({ gamedatas: gamedatas });
                this.game.playerManager.updatePlayers({ gamedatas: gamedatas });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_refreshForcesPrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, playerId, supply, forcesInSpaces, player;
            var _this = this;
            return __generator(this, function (_b) {
                _a = notif.args, data = _a.forces, playerId = _a.playerId;
                supply = data.supply, forcesInSpaces = __rest(data, ["supply"]);
                player = this.getPlayer({ playerId: playerId });
                if (player.isRobinHood()) {
                    player.updateRobinHoodIconCountersPrivate({
                        Camp: supply.Camp || 0,
                        MerryMen: supply.MerryMen || 0,
                        RobinHood: supply.RobinHood || 0,
                    });
                }
                else if (player.isSheriff) {
                    player.updateSheriffIconCountersPrivate({
                        TallageCarriage: supply.TallageCarriage || 0,
                        TributeCarriage: supply.TributeCarriage || 0,
                        TrapCarriage: supply.TrapCarriage || 0,
                        Henchmen: supply.Henchmen || 0,
                    });
                }
                Object.entries(forcesInSpaces).forEach(function (_a) {
                    var spaceId = _a[0], forces = _a[1];
                    forces.forEach(function (force) { return _this.game.gameMap.addPrivateForce({ force: force }); });
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeBridge = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var borderId;
            return __generator(this, function (_a) {
                borderId = notif.args.borderId;
                this.game.gameMap.placeBridge({ borderId: borderId });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_captureMerryMen = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var capturedPieces, selectedForces_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        capturedPieces = notif.args.capturedPieces;
                        if (!this.currentPlayerIsRobinHood()) return [3, 2];
                        return [4, this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(PRISON)].addCards(capturedPieces.map(function (piece) { return piece.force; }))];
                    case 1:
                        _a.sent();
                        return [3, 4];
                    case 2:
                        selectedForces_1 = [];
                        capturedPieces.forEach(function (piece) {
                            var selected = _this.game.gameMap.getForcePublic({
                                type: piece.type,
                                hidden: piece.hidden,
                                spaceId: piece.spaceId,
                                exclude: selectedForces_1,
                            });
                            selectedForces_1.push(selected);
                        });
                        return [4, this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(PRISON)].addCards(selectedForces_1)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_chooseAction = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var marker, markerNode, toNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        marker = notif.args.marker;
                        markerNode = document.getElementById(marker.id);
                        toNode = document.getElementById(marker.location);
                        if (!(markerNode && toNode)) {
                            return [2];
                        }
                        return [4, this.game.animationManager.attachWithAnimation(new BgaSlideAnimation({ element: markerNode }), toNode)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_drawAndRevealCard = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = notif.args.card;
                        card.location = EVENTS_DECK;
                        return [4, this.game.cardArea.stocks.eventsDeck.addCard(card)];
                    case 1:
                        _a.sent();
                        card.location = EVENTS_DISCARD;
                        return [4, this.game.cardArea.stocks.eventsDiscard.addCard(card)];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_drawAndRevealTravellerCard = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = notif.args.card;
                        card.location = TRAVELLER_ROBBED;
                        this.game.cardArea.incTravellerInDeckCounterValue(card.id.split('_')[1], -1);
                        this.game.cardArea.counters.travellersDeck.incValue(-1);
                        return [4, this.game.cardArea.stocks.travellerRobbed.addCard(card)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_gainShillings = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, amount, playerId;
            return __generator(this, function (_b) {
                _a = notif.args, amount = _a.amount, playerId = _a.playerId;
                this.getPlayer({ playerId: playerId }).counters.shillings.incValue(amount);
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_hideForce = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var force;
            return __generator(this, function (_a) {
                force = notif.args.force;
                if ([MERRY_MEN, CAMP, ROBIN_HOOD].includes(force.type)) {
                    if (this.currentPlayerIsRobinHood()) {
                        this.game.gameMap.hideForcePrivate({ force: force });
                    }
                    else {
                        this.game.gameMap.hideForcePublic({ force: force });
                    }
                }
                else if ([TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(force.type)) {
                    if (this.currentPlayerIsSheriff()) {
                        this.game.gameMap.hideForcePrivate({ force: force });
                    }
                    else {
                        this.game.gameMap.hideForcePublic({ force: force });
                    }
                }
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_moveCarriagePublic = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, carriage, toSpaceId, fromSpaceId, henchman, promises;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, carriage = _a.carriage, toSpaceId = _a.toSpaceId, fromSpaceId = _a.fromSpaceId, henchman = _a.henchman;
                        promises = [
                            this.game.gameMap.moveForcePublic({
                                hidden: carriage.hidden,
                                type: carriage.type,
                                toSpaceId: toSpaceId,
                                fromSpaceId: fromSpaceId,
                            }),
                        ];
                        if (henchman) {
                            promises.push(this.game.gameMap.moveForcePrivate({ force: henchman }));
                        }
                        return [4, Promise.all(promises)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_moveCarriagePrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, carriage, henchman, toSpaceId, promises;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, carriage = _a.carriage, henchman = _a.henchman, toSpaceId = _a.toSpaceId;
                        promises = [
                            this.game.gameMap.moveForcePrivate({
                                force: carriage,
                            }),
                        ];
                        if (henchman) {
                            promises.push(this.game.gameMap.moveForcePrivate({ force: henchman }));
                        }
                        return [4, Promise.all(promises)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_moveForces = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, forces, toSpaceId, type;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, forces = _a.forces, toSpaceId = _a.toSpaceId, type = _a.type;
                        return [4, this.game.gameMap.forces["".concat(type, "_").concat(toSpaceId)].addCards(forces)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_moveRoyalFavourMarker = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, marker, scores;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, marker = _a.marker, scores = _a.scores;
                        Object.entries(scores).forEach(function (_a) {
                            var _b;
                            var playerId = _a[0], score = _a[1];
                            if ((_b = _this.game.framework().scoreCtrl) === null || _b === void 0 ? void 0 : _b[playerId]) {
                                _this.game.framework().scoreCtrl[playerId].setValue(Number(score));
                            }
                        });
                        return [4, this.game.gameMap.moveMarker({
                                id: marker.id,
                                location: marker.location,
                            })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_moveRoyalInspectionMarker = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var marker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        marker = notif.args.marker;
                        return [4, this.game.gameMap.moveMarker({
                                id: marker.id,
                                location: marker.location,
                            })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_payShillings = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, amount, playerId;
            return __generator(this, function (_b) {
                _a = notif.args, amount = _a.amount, playerId = _a.playerId;
                this.getPlayer({ playerId: playerId }).counters.shillings.incValue(-amount);
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeCardInTravellersDeck = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var card;
            return __generator(this, function (_a) {
                card = notif.args.card;
                this.game.cardArea.incTravellerInDeckCounterValue(card.id.split('_')[1], 1);
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeForce = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, force, spaceId, count, playerId, type, troopSide;
            var _b;
            return __generator(this, function (_c) {
                _a = notif.args, force = _a.force, spaceId = _a.spaceId, count = _a.count, playerId = _a.playerId;
                type = this.game.gameMap.getPublicType({ type: force.type });
                troopSide = this.game.gameMap.isRobinHoodForce({ type: force.type })
                    ? 'RobinHood'
                    : 'Sheriff';
                (_b = this.getPlayer({ playerId: playerId }).counters[troopSide][type]) === null || _b === void 0 ? void 0 : _b.incValue(-1);
                this.game.gameMap.addPublicForces({
                    spaceId: spaceId,
                    count: count,
                    hidden: force.hidden,
                    type: force.type,
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeForceAll = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, forces, playerId;
            var _this = this;
            return __generator(this, function (_b) {
                _a = notif.args, forces = _a.forces, playerId = _a.playerId;
                forces.forEach(function (force) {
                    var _a;
                    var troopSide = _this.game.gameMap.isRobinHoodForce({ type: force.type })
                        ? 'RobinHood'
                        : 'Sheriff';
                    (_a = _this.getPlayer({ playerId: playerId }).counters[troopSide][force.type]) === null || _a === void 0 ? void 0 : _a.incValue(-1);
                    _this.game.gameMap.addPrivateForce({ force: force });
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeForcePrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, forces, playerId;
            var _this = this;
            return __generator(this, function (_b) {
                _a = notif.args, forces = _a.forces, playerId = _a.playerId;
                forces.forEach(function (force) {
                    var _a;
                    var troopSide = _this.game.gameMap.isRobinHoodForce({ type: force.type })
                        ? 'RobinHood'
                        : 'Sheriff';
                    (_a = _this.getPlayer({ playerId: playerId }).counters[troopSide][force.type]) === null || _a === void 0 ? void 0 : _a.incValue(-1);
                    _this.game.gameMap.addPrivateForce({ force: force });
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeMerryMenPublic = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, merryMenCounts, playerId;
            var _this = this;
            return __generator(this, function (_b) {
                _a = notif.args, merryMenCounts = _a.merryMenCounts, playerId = _a.playerId;
                Object.entries(merryMenCounts).forEach(function (_a) {
                    var _b;
                    var spaceId = _a[0], countHidden = _a[1];
                    (_b = _this.getPlayer({ playerId: playerId }).counters.RobinHood[MERRY_MEN]) === null || _b === void 0 ? void 0 : _b.incValue(-countHidden);
                    _this.game.gameMap.addPublicForces({
                        spaceId: spaceId,
                        count: countHidden,
                        hidden: true,
                        type: MERRY_MEN,
                    });
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeMerryMenPrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, robinHood, merryMen, playerId, player;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                _a = notif.args, robinHood = _a.robinHood, merryMen = _a.merryMen, playerId = _a.playerId;
                player = this.getPlayer({ playerId: playerId });
                if (robinHood &&
                    !this.game.gameMap.forceIsInLocation({ force: robinHood })) {
                    (_b = player.counters.RobinHood[ROBIN_HOOD]) === null || _b === void 0 ? void 0 : _b.incValue(-1);
                    this.game.gameMap.addPrivateForce({ force: robinHood });
                }
                merryMen.forEach(function (merryMan) {
                    var _a;
                    if (!_this.game.gameMap.forceIsInLocation({ force: merryMan })) {
                        (_a = player.counters.RobinHood[MERRY_MEN]) === null || _a === void 0 ? void 0 : _a.incValue(-1);
                        _this.game.gameMap.addPrivateForce({ force: merryMan });
                    }
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_putCardInVictimsPile = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, card, fromLocation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, card = _a.card, fromLocation = _a.fromLocation;
                        if (fromLocation === TRAVELLERS_DECK) {
                            this.game.cardArea.incTravellerInDeckCounterValue(card.id.split('_')[1], -1);
                        }
                        else if (fromLocation === TRAVELLERS_DISCARD) {
                            this.game.cardArea.counters.travellersDiscard.incValue(-1);
                        }
                        return [4, this.game.cardArea.stocks.travellerRobbed.removeCard(card)];
                    case 1:
                        _b.sent();
                        this.game.cardArea.counters.victimsPile.incValue(1);
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_putTravellerInDiscardPile = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = notif.args.card;
                        return [4, this.game.cardArea.stocks.travellerRobbed.removeCard(card)];
                    case 1:
                        _a.sent();
                        this.game.cardArea.counters.travellersDiscard.incValue(1);
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_parishStatus = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, spaceId, status;
            return __generator(this, function (_b) {
                _a = notif.args, spaceId = _a.spaceId, status = _a.status;
                this.game.gameMap.setSpaceStatus({ spaceId: spaceId, status: status });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_redeploymentSheriff = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, forces, isTemporaryTruce, promises;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, forces = _a.forces, isTemporaryTruce = _a.isTemporaryTruce;
                        promises = [];
                        forces.forEach(function (force) {
                            promises.push(_this.game.gameMap.forces["".concat(HENCHMEN, "_").concat(force.location)].addCard(force));
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _b.sent();
                        if (!isTemporaryTruce) {
                            this.game.gameMap.forces["".concat(CARRIAGE, "_").concat(USED_CARRIAGES)].removeAll();
                        }
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_removeCardFromGame = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, card, fromLocation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, card = _a.card, fromLocation = _a.fromLocation;
                        return [4, this.game.cardManager.removeCard(card)];
                    case 1:
                        _b.sent();
                        switch (fromLocation) {
                            case TRAVELLERS_DECK:
                                this.game.cardArea.incTravellerInDeckCounterValue(card.id.split('_')[1], -1);
                                return [2];
                            case TRAVELLERS_DISCARD:
                                this.game.cardArea.counters.travellersDiscard.incValue(-1);
                                return [2];
                            case TRAVELLERS_VICTIMS_PILE:
                                this.game.cardArea.counters.victimsPile.incValue(-1);
                                return [2];
                        }
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_removeForceFromGamePublic = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, force, spaceId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, force = _a.force, spaceId = _a.spaceId;
                        return [4, this.game.gameMap.removeFromGamePublic({
                                type: force.type,
                                hidden: force.hidden,
                                fromSpaceId: spaceId,
                            })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_removeForceFromGamePrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var force;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        force = notif.args.force;
                        return [4, this.game.forceManager.removeCard(force)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_revealForce = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var force;
            return __generator(this, function (_a) {
                force = notif.args.force;
                if ([MERRY_MEN, CAMP, ROBIN_HOOD].includes(force.type)) {
                    if (this.currentPlayerIsRobinHood()) {
                        this.game.gameMap.revealForcePrivate({ force: force });
                    }
                    else {
                        this.game.gameMap.revealForcePublic({ force: force });
                    }
                }
                else if ([TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(force.type)) {
                    if (this.currentPlayerIsSheriff()) {
                        this.game.gameMap.revealForcePrivate({ force: force });
                    }
                    else {
                        this.game.gameMap.revealForcePublic({ force: force });
                    }
                }
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_returnToSupplyPublic = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, force, spaceId, playerId, player, troopSide, type;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = notif.args, force = _a.force, spaceId = _a.spaceId, playerId = _a.playerId;
                        player = this.getPlayer({ playerId: playerId });
                        if (this.game.getPlayerId() === playerId) {
                            troopSide = this.game.gameMap.isRobinHoodForce({ type: force.type })
                                ? 'RobinHood'
                                : 'Sheriff';
                            (_c = (_b = player.counters[troopSide]) === null || _b === void 0 ? void 0 : _b[force.type]) === null || _c === void 0 ? void 0 : _c.incValue(1);
                        }
                        else {
                            type = this.game.gameMap.getPublicType({ type: force.type });
                            (_e = (_d = player.counters[this.game.gameMap.isRobinHoodForce({ type: type }) ? 'RobinHood' : 'Sheriff']) === null || _d === void 0 ? void 0 : _d[type]) === null || _e === void 0 ? void 0 : _e.incValue(1);
                        }
                        return [4, this.game.gameMap.returnToSupplyPublic({
                                type: force.type,
                                hidden: force.hidden,
                                fromSpaceId: spaceId,
                            })];
                    case 1:
                        _f.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_returnToSupplyPrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, force, playerId, troopSide, player;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = notif.args, force = _a.force, playerId = _a.playerId;
                        return [4, this.game.forceManager.removeCard(force)];
                    case 1:
                        _d.sent();
                        troopSide = this.game.gameMap.isRobinHoodForce({ type: force.type })
                            ? 'RobinHood'
                            : 'Sheriff';
                        player = troopSide === 'RobinHood'
                            ? this.game.playerManager.getRobinHoodPlayer()
                            : this.game.playerManager.getSheriffPlayer();
                        (_c = (_b = player.counters[troopSide]) === null || _b === void 0 ? void 0 : _b[force.type]) === null || _c === void 0 ? void 0 : _c.incValue(1);
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_sneakMerryMenPrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, forces, toSpaceId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, forces = _a.forces, toSpaceId = _a.toSpaceId;
                        return [4, this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(toSpaceId)].addCards(forces)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_moveMerryMenPrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var forces, promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forces = notif.args.forces;
                        promises = forces.map(function (force) {
                            var stock = _this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(force.location)];
                            var merryMan = stock
                                .getCards()
                                .find(function (stockForce) { return stockForce.id === force.id; });
                            if (!merryMan) {
                                return stock.addCard(force);
                            }
                            else {
                                return _this.game.forceManager.updateCardInformations(force);
                            }
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_moveMerryMenPublic = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var moves, selectedForces, promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        moves = notif.args.moves;
                        selectedForces = [];
                        promises = [];
                        moves.forEach(function (move) {
                            var selectedForce = _this.game.gameMap.getForcePublic({
                                type: move.from.type,
                                spaceId: move.from.spaceId,
                                hidden: move.from.hidden,
                                exclude: selectedForces,
                            });
                            selectedForce.type = move.to.type;
                            selectedForce.hidden = move.to.hidden;
                            var stock = _this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(move.to.spaceId)];
                            if (move.from.type === ROBIN_HOOD && move.to.type === MERRY_MEN) {
                                _this.game.forceManager.updateCardInformations(selectedForce, {
                                    updateBack: true,
                                });
                            }
                            if (move.from.spaceId === move.to.spaceId) {
                                promises.push(_this.game.forceManager.updateCardInformations(selectedForce, {
                                    updateBack: true,
                                }));
                            }
                            else {
                                promises.push(stock.addCard(selectedForce));
                            }
                            selectedForces.push(selectedForce);
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_returnTravellersDiscardToMainDeck = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var cards;
            var _this = this;
            return __generator(this, function (_a) {
                cards = notif.args.cards;
                cards.forEach(function (card) {
                    _this.game.cardArea.counters.travellersDiscard.incValue(-1);
                    _this.game.cardArea.incTravellerInDeckCounterValue(card.id.split('_')[1], 1);
                    _this.game.cardArea.counters.travellersDeck.incValue(1);
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_robTakeTwoShillingsFromTheSheriff = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, playerId, sheriffPlayerId, amount;
            return __generator(this, function (_b) {
                _a = notif.args, playerId = _a.playerId, sheriffPlayerId = _a.sheriffPlayerId, amount = _a.amount;
                this.getPlayer({ playerId: sheriffPlayerId }).counters.shillings.incValue(-amount);
                this.getPlayer({ playerId: playerId }).counters.shillings.incValue(amount);
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_sneakMerryMen = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, moves, spaceId, toSpaceId, forces, robinHoodPublic, i, selectedRevealedForce, j, selectedHiddenForce, k, selectedHiddenForce, l, selectedHiddenForce, revealRobinHood, robinHood, back;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, moves = _a.moves, spaceId = _a.fromSpaceId, toSpaceId = _a.toSpaceId;
                        forces = [];
                        robinHoodPublic = null;
                        for (i = 0; i < moves.hide; i++) {
                            selectedRevealedForce = this.game.gameMap.getForcePublic({
                                type: MERRY_MEN,
                                spaceId: spaceId,
                                hidden: false,
                                exclude: forces,
                            });
                            selectedRevealedForce.hidden = true;
                            forces.push(selectedRevealedForce);
                        }
                        for (j = 0; j < moves.reveal; j++) {
                            selectedHiddenForce = this.game.gameMap.getForcePublic({
                                type: MERRY_MEN,
                                spaceId: spaceId,
                                hidden: true,
                                exclude: forces,
                            });
                            selectedHiddenForce.hidden = false;
                            forces.push(selectedHiddenForce);
                        }
                        for (k = 0; k < moves.noChange.hidden; k++) {
                            selectedHiddenForce = this.game.gameMap.getForcePublic({
                                type: MERRY_MEN,
                                spaceId: spaceId,
                                hidden: true,
                                exclude: forces,
                            });
                            forces.push(selectedHiddenForce);
                        }
                        for (l = 0; l < moves.noChange.revealed; l++) {
                            selectedHiddenForce = this.game.gameMap.getForcePublic({
                                type: MERRY_MEN,
                                spaceId: spaceId,
                                hidden: false,
                                exclude: forces,
                            });
                            forces.push(selectedHiddenForce);
                        }
                        if (moves.robinHood) {
                            revealRobinHood = moves.robinHood === 'reveal';
                            robinHood = this.game.gameMap.getForcePublic({
                                type: revealRobinHood ? MERRY_MEN : ROBIN_HOOD,
                                spaceId: spaceId,
                                hidden: revealRobinHood ? true : false,
                                exclude: forces,
                            });
                            robinHoodPublic = robinHood;
                            if (revealRobinHood) {
                                robinHood.hidden = false;
                                robinHood.type = ROBIN_HOOD;
                            }
                            else if (moves.robinHood === 'hide') {
                                robinHood.hidden = true;
                                robinHood.type = MERRY_MEN;
                            }
                            if (robinHoodPublic && moves.robinHood === 'hide') {
                                document
                                    .getElementById("".concat(robinHoodPublic.id, "-front"))
                                    .setAttribute('data-type', MERRY_MEN);
                                back = document.getElementById("".concat(robinHoodPublic.id, "-back"));
                                back.setAttribute('data-type', MERRY_MEN);
                                back.replaceChildren();
                            }
                            else if (robinHoodPublic && moves.robinHood === 'reveal') {
                                document
                                    .getElementById("".concat(robinHoodPublic.id, "-front"))
                                    .setAttribute('data-type', ROBIN_HOOD);
                                document
                                    .getElementById("".concat(robinHoodPublic.id, "-back"))
                                    .setAttribute('data-type', ROBIN_HOOD);
                            }
                            forces.push(robinHood);
                        }
                        return [4, this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(toSpaceId)].addCards(forces)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_startOfRound = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, balladNumber, eventNumber;
            return __generator(this, function (_b) {
                _a = notif.args, balladNumber = _a.balladNumber, eventNumber = _a.eventNumber;
                this.game.infoPanel.updateBalladInfo({ balladNumber: balladNumber, eventNumber: eventNumber });
                return [2];
            });
        });
    };
    return NotificationManager;
}());
var IconCounter = (function () {
    function IconCounter(config) {
        var iconCounterId = config.iconCounterId, containerId = config.containerId;
        this.iconCounterId = iconCounterId;
        this.containerId = containerId;
        this.setup(config);
    }
    IconCounter.prototype.setup = function (_a) {
        var icon = _a.icon, initialValue = _a.initialValue, extraIconClasses = _a.extraIconClasses, insert = _a.insert, dataAttributes = _a.dataAttributes;
        var container = document.getElementById(this.containerId);
        if (!container) {
            return;
        }
        container.insertAdjacentHTML(insert || "beforeend", tplIconCounter({ extraIconClasses: extraIconClasses, icon: icon, iconCounterId: this.iconCounterId, value: initialValue, dataAttributes: dataAttributes }));
        this.counter = new ebg.counter();
        this.counter.create("".concat(this.iconCounterId, "_counter"));
        this.counter.setValue(initialValue);
    };
    IconCounter.prototype.setValue = function (value) {
        this.counter.setValue(value);
        var node = document.getElementById(this.iconCounterId);
        if (!node) {
            return;
        }
        this.checkNone({ node: node, value: value });
    };
    IconCounter.prototype.incValue = function (value) {
        this.counter.incValue(value);
        var node = document.getElementById(this.iconCounterId);
        if (!node) {
            return;
        }
        this.checkNone({ node: node, value: this.counter.getValue() });
    };
    IconCounter.prototype.getValue = function () {
        return this.counter.getValue();
    };
    IconCounter.prototype.checkNone = function (_a) {
        var node = _a.node, value = _a.value;
        if (value === 0) {
            node.classList.add(GEST_NONE);
        }
        else {
            node.classList.remove(GEST_NONE);
        }
    };
    return IconCounter;
}());
var tplIconCounter = function (_a) {
    var icon = _a.icon, iconCounterId = _a.iconCounterId, value = _a.value, extraIconClasses = _a.extraIconClasses, dataAttributes = _a.dataAttributes;
    return "\n  <div id=\"".concat(iconCounterId, "\" class=\"gest_icon_counter_container").concat(value === 0 ? ' gest_none' : '', "\">\n    <span id=\"").concat(iconCounterId, "_counter\" class=\"gest_counter\"></span>\n    <div id=\"").concat(iconCounterId, "_icon\" class=\"gest_icon").concat(extraIconClasses ? " ".concat(extraIconClasses) : '', "\" ").concat(icon ? "data-icon=\"".concat(icon, "\"") : '').concat((dataAttributes || [])
        .map(function (dataAttribute) { return " ".concat(dataAttribute.key, "=\"").concat(dataAttribute.value, "\""); })
        .join(''), "></div>\n  </div>");
};
var PlayerManager = (function () {
    function PlayerManager(game) {
        console.log('Constructor PlayerManager');
        this.game = game;
        this.players = {};
        for (var playerId in game.gamedatas.players) {
            var player = game.gamedatas.players[playerId];
            this.players[playerId] = new GestPlayer({ player: player, game: this.game });
        }
    }
    PlayerManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.players[playerId];
    };
    PlayerManager.prototype.getPlayers = function () {
        return Object.values(this.players);
    };
    PlayerManager.prototype.getPlayerIds = function () {
        return Object.keys(this.players).map(Number);
    };
    PlayerManager.prototype.getRobinHoodPlayer = function () {
        return Object.values(this.players).filter(function (player) {
            return player.isRobinHood();
        })[0];
    };
    PlayerManager.prototype.getRobinHoodPlayerId = function () {
        return Object.values(this.players)
            .filter(function (player) { return player.isRobinHood(); })[0]
            .getPlayerId();
    };
    PlayerManager.prototype.getSheriffPlayer = function () {
        return Object.values(this.players).filter(function (player) { return !player.isRobinHood(); })[0];
    };
    PlayerManager.prototype.getSheriffPlayerId = function () {
        return Object.values(this.players)
            .filter(function (player) { return !player.isRobinHood(); })[0]
            .getPlayerId();
    };
    PlayerManager.prototype.updatePlayers = function (_a) {
        var gamedatas = _a.gamedatas;
        for (var playerId in gamedatas.players) {
            this.players[playerId].updatePlayer({ gamedatas: gamedatas });
        }
    };
    PlayerManager.prototype.clearInterface = function () {
        var _this = this;
        Object.keys(this.players).forEach(function (playerId) {
            _this.players[playerId].clearInterface();
        });
    };
    return PlayerManager;
}());
var GestPlayer = (function () {
    function GestPlayer(_a) {
        var game = _a.game, player = _a.player;
        this.counters = {
            RobinHood: {},
            Sheriff: {},
        };
        this.game = game;
        var playerId = player.id;
        this.playerId = Number(playerId);
        this.playerData = player;
        this.playerName = player.name;
        this.playerColor = player.color;
        this.side = player.side;
        var gamedatas = game.gamedatas;
        this.setupPlayer({ gamedatas: gamedatas });
    }
    GestPlayer.prototype.updatePlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        this.updatePlayerPanel({
            playerGamedatas: gamedatas.players[this.playerId],
        });
        if (this.side === 'RobinHood') {
            this.updateRobinHoodIconCounters({ gamedatas: gamedatas });
        }
        else if (this.side === 'Sheriff') {
            this.updateSheriffIconCounters({ gamedatas: gamedatas });
        }
    };
    GestPlayer.prototype.updateRobinHoodIconCounters = function (_a) {
        var gamedatas = _a.gamedatas;
        if (this.playerId !== this.game.getPlayerId()) {
            this.counters.RobinHood[CAMP].setValue(gamedatas.forces.supply.Camp);
            this.counters.RobinHood[MERRY_MEN].setValue(gamedatas.forces.supply.MerryMen);
        }
    };
    GestPlayer.prototype.updateRobinHoodIconCountersPrivate = function (_a) {
        var Camp = _a.Camp, MerryMen = _a.MerryMen, RobinHood = _a.RobinHood;
        this.counters.RobinHood[CAMP].setValue(Camp);
        this.counters.RobinHood[MERRY_MEN].setValue(MerryMen);
        this.counters.RobinHood[ROBIN_HOOD].setValue(RobinHood);
    };
    GestPlayer.prototype.updateSheriffIconCounters = function (_a) {
        var gamedatas = _a.gamedatas;
        if (this.playerId !== this.game.getPlayerId()) {
            this.counters.Sheriff[CARRIAGE].setValue(gamedatas.forces.supply.Carriage);
            this.counters.Sheriff[HENCHMEN].setValue(gamedatas.forces.supply.Henchmen);
        }
    };
    GestPlayer.prototype.updateSheriffIconCountersPrivate = function (_a) {
        var Henchmen = _a.Henchmen, TallageCarriage = _a.TallageCarriage, TributeCarriage = _a.TributeCarriage, TrapCarriage = _a.TrapCarriage;
        this.counters.Sheriff[TALLAGE_CARRIAGE].setValue(TallageCarriage);
        this.counters.Sheriff[TRIBUTE_CARRIAGE].setValue(TributeCarriage);
        this.counters.Sheriff[TRAP_CARRIAGE].setValue(TrapCarriage);
        this.counters.Sheriff[HENCHMEN].setValue(Henchmen);
    };
    GestPlayer.prototype.setupPlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        this.setupPlayerPanel({ gamedatas: gamedatas });
    };
    GestPlayer.prototype.setupRobinHoodIconCounters = function (_a) {
        var _b, _c, _d;
        var gamedatas = _a.gamedatas;
        if (this.playerId === this.game.getPlayerId()) {
            this.counters.RobinHood[CAMP] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: 'camp',
                iconCounterId: "gest_camps_counter_".concat(this.playerId),
                initialValue: ((_b = gamedatas.robinHoodForces) === null || _b === void 0 ? void 0 : _b.supply.Camp) || 0,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'true',
                    },
                    {
                        key: 'data-type',
                        value: CAMP,
                    },
                ],
            });
            this.counters.RobinHood[MERRY_MEN] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_merryMen_counter_".concat(this.playerId),
                initialValue: ((_c = gamedatas.robinHoodForces) === null || _c === void 0 ? void 0 : _c.supply.MerryMen) || 0,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'true',
                    },
                    {
                        key: 'data-type',
                        value: MERRY_MEN,
                    },
                ],
            });
            this.counters.RobinHood[ROBIN_HOOD] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_RobinHood_counter_".concat(this.playerId),
                initialValue: ((_d = gamedatas.robinHoodForces) === null || _d === void 0 ? void 0 : _d.supply.RobinHood) || 0,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'true',
                    },
                    {
                        key: 'data-type',
                        value: ROBIN_HOOD,
                    },
                ],
            });
        }
        else {
            this.counters.RobinHood[CAMP] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: 'camp',
                iconCounterId: "gest_camps_counter_".concat(this.playerId),
                initialValue: gamedatas.forces.supply.Camp,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'false',
                    },
                    {
                        key: 'data-type',
                        value: CAMP,
                    },
                ],
            });
            this.counters.RobinHood[MERRY_MEN] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_merryMen_counter_".concat(this.playerId),
                initialValue: gamedatas.forces.supply.MerryMen,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'false',
                    },
                    {
                        key: 'data-type',
                        value: MERRY_MEN,
                    },
                ],
            });
        }
    };
    GestPlayer.prototype.setupSheriffIconCounters = function (_a) {
        var _b, _c, _d, _e;
        var gamedatas = _a.gamedatas;
        if (this.playerId === this.game.getPlayerId()) {
            this.counters.Sheriff[TALLAGE_CARRIAGE] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_tallageCarriage_counter_".concat(this.playerId),
                initialValue: ((_b = gamedatas.sheriffForces) === null || _b === void 0 ? void 0 : _b.supply.TallageCarriage) || 0,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'true',
                    },
                    {
                        key: 'data-type',
                        value: TALLAGE_CARRIAGE,
                    },
                ],
            });
            this.counters.Sheriff[TRIBUTE_CARRIAGE] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_tributeCarriage_counter_".concat(this.playerId),
                initialValue: ((_c = gamedatas.sheriffForces) === null || _c === void 0 ? void 0 : _c.supply.TributeCarriage) || 0,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'true',
                    },
                    {
                        key: 'data-type',
                        value: TRIBUTE_CARRIAGE,
                    },
                ],
            });
            this.counters.Sheriff[TRAP_CARRIAGE] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_trapCarriage_counter_".concat(this.playerId),
                initialValue: ((_d = gamedatas.sheriffForces) === null || _d === void 0 ? void 0 : _d.supply.TrapCarriage) || 0,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'true',
                    },
                    {
                        key: 'data-type',
                        value: TRAP_CARRIAGE,
                    },
                ],
            });
            this.counters.Sheriff[HENCHMEN] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_henchmen_counter_".concat(this.playerId),
                initialValue: ((_e = gamedatas.sheriffForces) === null || _e === void 0 ? void 0 : _e.supply.Henchmen) || 0,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'true',
                    },
                    {
                        key: 'data-type',
                        value: HENCHMEN,
                    },
                ],
            });
        }
        else {
            this.counters.Sheriff[CARRIAGE] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_carriage_counter_".concat(this.playerId),
                initialValue: gamedatas.forces.supply.Carriage,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'false',
                    },
                    {
                        key: 'data-type',
                        value: CARRIAGE,
                    },
                ],
            });
            this.counters.Sheriff[HENCHMEN] = new IconCounter({
                containerId: "gest_player_panel_".concat(this.playerId),
                extraIconClasses: 'gest_force_side',
                icon: '',
                iconCounterId: "gest_henchmen_counter_".concat(this.playerId),
                initialValue: gamedatas.forces.supply.Henchmen,
                dataAttributes: [
                    {
                        key: 'data-revealed',
                        value: 'true',
                    },
                    {
                        key: 'data-type',
                        value: HENCHMEN,
                    },
                ],
            });
        }
    };
    GestPlayer.prototype.setupPlayerPanel = function (_a) {
        var gamedatas = _a.gamedatas;
        var playerGamedatas = gamedatas.players[this.playerId];
        var playerBoardDiv = document.getElementById("player_board_".concat(this.playerId));
        playerBoardDiv.insertAdjacentHTML('beforeend', tplPlayerPanel({ playerId: this.playerId }));
        this.counters.shillings = new IconCounter({
            containerId: "gest_player_panel_".concat(this.playerId),
            icon: 'shilling',
            iconCounterId: "gest_shillings_counter_".concat(this.playerId),
            initialValue: playerGamedatas.shillings,
        });
        if (this.side === 'RobinHood') {
            this.setupRobinHoodIconCounters({ gamedatas: gamedatas });
        }
        else if (this.side === 'Sheriff') {
            this.setupSheriffIconCounters({ gamedatas: gamedatas });
        }
        this.updatePlayerPanel({ playerGamedatas: playerGamedatas });
    };
    GestPlayer.prototype.updatePlayerPanel = function (_a) {
        var _b;
        var playerGamedatas = _a.playerGamedatas;
        if ((_b = this.game.framework().scoreCtrl) === null || _b === void 0 ? void 0 : _b[this.playerId]) {
            this.game
                .framework()
                .scoreCtrl[this.playerId].setValue(Number(playerGamedatas.score));
        }
        this.counters.shillings.setValue(playerGamedatas.shillings);
    };
    GestPlayer.prototype.clearInterface = function () { };
    GestPlayer.prototype.getColor = function () {
        return this.playerColor;
    };
    GestPlayer.prototype.getHexColor = function () {
        return this.playerHexColor;
    };
    GestPlayer.prototype.getName = function () {
        return this.playerName;
    };
    GestPlayer.prototype.getPlayerId = function () {
        return this.playerId;
    };
    GestPlayer.prototype.isRobinHood = function () {
        return this.side === 'RobinHood';
    };
    GestPlayer.prototype.isSheriff = function () {
        return this.side === 'Sheriff';
    };
    return GestPlayer;
}());
var tplPlayerPanel = function (_a) {
    var playerId = _a.playerId;
    return "<div id=\"gest_player_panel_".concat(playerId, "\" class=\"gest_player_panel\">\n\n          </div>");
};
var getSettingsConfig = function () {
    var _a, _b;
    return ({
        layout: {
            id: 'layout',
            config: (_a = {
                    twoColumnsLayout: {
                        id: 'twoColumnsLayout',
                        onChangeInSetup: true,
                        defaultValue: 'disabled',
                        label: _('Two column layout'),
                        type: 'select',
                        options: [
                            {
                                label: _('Enabled'),
                                value: 'enabled',
                            },
                            {
                                label: _('Disabled (single column)'),
                                value: 'disabled',
                            },
                        ],
                    },
                    columnSizes: {
                        id: 'columnSizes',
                        onChangeInSetup: true,
                        label: _('Column sizes'),
                        defaultValue: 50,
                        visibleCondition: {
                            id: 'twoColumnsLayout',
                            values: [PREF_ENABLED],
                        },
                        sliderConfig: {
                            step: 5,
                            padding: 0,
                            range: {
                                min: 30,
                                max: 70,
                            },
                        },
                        type: 'slider',
                    }
                },
                _a[PREF_SINGLE_COLUMN_MAP_SIZE] = {
                    id: PREF_SINGLE_COLUMN_MAP_SIZE,
                    onChangeInSetup: true,
                    label: _('Map size'),
                    defaultValue: 100,
                    visibleCondition: {
                        id: 'twoColumnsLayout',
                        values: [DISABLED],
                    },
                    sliderConfig: {
                        step: 5,
                        padding: 0,
                        range: {
                            min: 30,
                            max: 100,
                        },
                    },
                    type: 'slider',
                },
                _a[PREF_CARD_SIZE] = {
                    id: PREF_CARD_SIZE,
                    onChangeInSetup: false,
                    label: _("Size of cards"),
                    defaultValue: 100,
                    sliderConfig: {
                        step: 5,
                        padding: 0,
                        range: {
                            min: 50,
                            max: 200,
                        },
                    },
                    type: "slider",
                },
                _a[PREF_CARD_SIZE_IN_LOG] = {
                    id: PREF_CARD_SIZE_IN_LOG,
                    onChangeInSetup: true,
                    label: _('Size of cards in log'),
                    defaultValue: 0,
                    sliderConfig: {
                        step: 5,
                        padding: 0,
                        range: {
                            min: 0,
                            max: 110,
                        },
                    },
                    type: 'slider',
                },
                _a[PREF_CARD_INFO_IN_TOOLTIP] = {
                    id: PREF_CARD_INFO_IN_TOOLTIP,
                    onChangeInSetup: false,
                    defaultValue: ENABLED,
                    label: _('Show card info in tooltip'),
                    type: 'select',
                    options: [
                        {
                            label: _('Enabled'),
                            value: ENABLED,
                        },
                        {
                            label: _('Disabled (card image only)'),
                            value: DISABLED,
                        },
                    ],
                },
                _a),
        },
        gameplay: {
            id: 'gameplay',
            config: (_b = {},
                _b[PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY] = {
                    id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
                    onChangeInSetup: false,
                    defaultValue: DISABLED,
                    label: _('Confirm end of turn and player switch only'),
                    type: 'select',
                    options: [
                        {
                            label: _('Enabled'),
                            value: PREF_ENABLED,
                        },
                        {
                            label: _('Disabled (confirm every move)'),
                            value: PREF_DISABLED,
                        },
                    ],
                },
                _b[PREF_SHOW_ANIMATIONS] = {
                    id: PREF_SHOW_ANIMATIONS,
                    onChangeInSetup: false,
                    defaultValue: PREF_ENABLED,
                    label: _('Show animations'),
                    type: 'select',
                    options: [
                        {
                            label: _('Enabled'),
                            value: PREF_ENABLED,
                        },
                        {
                            label: _('Disabled'),
                            value: PREF_DISABLED,
                        },
                    ],
                },
                _b[PREF_ANIMATION_SPEED] = {
                    id: PREF_ANIMATION_SPEED,
                    onChangeInSetup: false,
                    label: _('Animation speed'),
                    defaultValue: 1600,
                    visibleCondition: {
                        id: PREF_SHOW_ANIMATIONS,
                        values: [PREF_ENABLED],
                    },
                    sliderConfig: {
                        step: 100,
                        padding: 0,
                        range: {
                            min: 100,
                            max: 2000,
                        },
                    },
                    type: 'slider',
                },
                _b),
        },
    });
};
var Settings = (function () {
    function Settings(game) {
        this.settings = {};
        this.selectedTab = "layout";
        this.tabs = [
            {
                id: "layout",
                name: _("Layout"),
            },
            {
                id: "gameplay",
                name: _("Gameplay"),
            },
        ];
        this.game = game;
        var gamedatas = game.gamedatas;
        this.setup({ gamedatas: gamedatas });
    }
    Settings.prototype.clearInterface = function () { };
    Settings.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
    };
    Settings.prototype.addButton = function (_a) {
        var gamedatas = _a.gamedatas;
        var configPanel = document.getElementById("info_panel_buttons");
        if (configPanel) {
            configPanel.insertAdjacentHTML("beforeend", tplSettingsButton());
        }
    };
    Settings.prototype.setupModal = function (_a) {
        var gamedatas = _a.gamedatas;
        this.modal = new Modal("settings_modal", {
            class: "settings_modal",
            closeIcon: "fa-times",
            titleTpl: '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>',
            title: _("Settings"),
            contents: tplSettingsModalContent({
                tabs: this.tabs,
            }),
            closeAction: "hide",
            verticalAlign: "flex-start",
            breakpoint: 740,
        });
    };
    Settings.prototype.setup = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.addButton({ gamedatas: gamedatas });
        this.setupModal({ gamedatas: gamedatas });
        this.setupModalContent();
        this.changeTab({ id: this.selectedTab });
        dojo.connect($("show_settings"), "onclick", function () { return _this.open(); });
        this.tabs.forEach(function (_a) {
            var id = _a.id;
            dojo.connect($("settings_modal_tab_".concat(id)), "onclick", function () {
                return _this.changeTab({ id: id });
            });
        });
    };
    Settings.prototype.setupModalContent = function () {
        var _this = this;
        var config = getSettingsConfig();
        var node = document.getElementById("setting_modal_content");
        if (!node) {
            return;
        }
        Object.entries(config).forEach(function (_a) {
            var tabId = _a[0], tabConfig = _a[1];
            node.insertAdjacentHTML("beforeend", tplSettingsModalTabContent({ id: tabId }));
            var tabContentNode = document.getElementById("settings_modal_tab_content_".concat(tabId));
            if (!tabContentNode) {
                return;
            }
            Object.values(tabConfig.config).forEach(function (setting) {
                var id = setting.id, type = setting.type, defaultValue = setting.defaultValue, visibleCondition = setting.visibleCondition;
                var localValue = localStorage.getItem(_this.getLocalStorageKey({ id: id }));
                _this.settings[id] = localValue || defaultValue;
                var methodName = _this.getMethodName({ id: id });
                if (setting.onChangeInSetup && localValue && _this[methodName]) {
                    _this[methodName](localValue);
                }
                if (setting.type === "select") {
                    var visible = !visibleCondition ||
                        (visibleCondition &&
                            visibleCondition.values.includes(_this.settings[visibleCondition.id]));
                    tabContentNode.insertAdjacentHTML("beforeend", tplPlayerPrefenceSelectRow({
                        setting: setting,
                        currentValue: _this.settings[setting.id],
                        visible: visible,
                    }));
                    var controlId_1 = "setting_".concat(setting.id);
                    $(controlId_1).addEventListener("change", function () {
                        var value = $(controlId_1).value;
                        _this.changeSetting({ id: setting.id, value: value });
                    });
                }
                else if (setting.type === "slider") {
                    var visible = !visibleCondition ||
                        (visibleCondition &&
                            visibleCondition.values.includes(_this.settings[visibleCondition.id]));
                    tabContentNode.insertAdjacentHTML("beforeend", tplPlayerPrefenceSliderRow({
                        id: setting.id,
                        label: setting.label,
                        visible: visible,
                    }));
                    var sliderConfig = __assign(__assign({}, setting.sliderConfig), { start: _this.settings[setting.id] });
                    noUiSlider.create($("setting_" + setting.id), sliderConfig);
                    $("setting_" + setting.id).noUiSlider.on("slide", function (arg) {
                        return _this.changeSetting({ id: setting.id, value: arg[0] });
                    });
                }
            });
        });
    };
    Settings.prototype.changeSetting = function (_a) {
        var id = _a.id, value = _a.value;
        var suffix = this.getSuffix({ id: id });
        this.settings[id] = value;
        localStorage.setItem(this.getLocalStorageKey({ id: id }), value);
        var methodName = this.getMethodName({ id: id });
        if (this[methodName]) {
            this[methodName](value);
        }
    };
    Settings.prototype.onChangeTwoColumnsLayoutSetting = function (value) {
        this.checkColumnSizesVisisble();
        var node = document.getElementById("play_area_container");
        if (node) {
            node.setAttribute("data-two-columns", value);
        }
        this.game.updateLayout();
    };
    Settings.prototype.onChangeColumnSizesSetting = function (value) {
        this.game.updateLayout();
    };
    Settings.prototype.onChangeSingleColumnMapSizeSetting = function (value) {
        this.game.updateLayout();
    };
    Settings.prototype.onChangeCardSizeSetting = function (value) {
        var node = document.getElementById("gest_card_area");
        if (node) {
            node.style.setProperty("--gestCardSizeScale", "".concat(Number(value) / 100));
        }
    };
    Settings.prototype.onChangeCardSizeInLogSetting = function (value) {
        var ROOT = document.documentElement;
        ROOT.style.setProperty("--logCardScale", "".concat(Number(value) / 100));
    };
    Settings.prototype.onChangeAnimationSpeedSetting = function (value) {
        var duration = 2100 - value;
        debug("onChangeAnimationSpeedSetting", duration);
        this.game.animationManager.getSettings().duration = duration;
    };
    Settings.prototype.onChangeShowAnimationsSetting = function (value) {
        if (value === PREF_ENABLED) {
            this.game.animationManager.getSettings().duration = Number(this.settings[PREF_ANIMATION_SPEED]);
        }
        else {
            this.game.animationManager.getSettings().duration = 0;
        }
        this.checkAnmimationSpeedVisisble();
    };
    Settings.prototype.onChangeCardInfoInTooltipSetting = function (value) {
        this.game.cardArea.updateTooltips();
        this.game.updateLogTooltips();
    };
    Settings.prototype.changeTab = function (_a) {
        var id = _a.id;
        var currentTab = document.getElementById("settings_modal_tab_".concat(this.selectedTab));
        var currentTabContent = document.getElementById("settings_modal_tab_content_".concat(this.selectedTab));
        currentTab.removeAttribute("data-state");
        if (currentTabContent) {
            currentTabContent.style.display = "none";
        }
        this.selectedTab = id;
        var tab = document.getElementById("settings_modal_tab_".concat(id));
        var tabContent = document.getElementById("settings_modal_tab_content_".concat(this.selectedTab));
        tab.setAttribute("data-state", "selected");
        if (tabContent) {
            tabContent.style.display = "";
        }
    };
    Settings.prototype.checkAnmimationSpeedVisisble = function () {
        var sliderNode = document.getElementById("setting_row_animationSpeed");
        if (!sliderNode) {
            return;
        }
        if (this.settings[PREF_SHOW_ANIMATIONS] === PREF_ENABLED) {
            sliderNode.style.display = "";
        }
        else {
            sliderNode.style.display = "none";
        }
    };
    Settings.prototype.checkColumnSizesVisisble = function () {
        var sliderNode = document.getElementById("setting_row_columnSizes");
        var mapSizeSliderNode = document.getElementById("setting_row_singleColumnMapSize");
        if (!(sliderNode && mapSizeSliderNode)) {
            return;
        }
        if (this.settings["twoColumnsLayout"] === PREF_ENABLED) {
            sliderNode.style.display = "";
            mapSizeSliderNode.style.display = "none";
        }
        else {
            sliderNode.style.display = "none";
            mapSizeSliderNode.style.display = "";
        }
    };
    Settings.prototype.getMethodName = function (_a) {
        var id = _a.id;
        return "onChange".concat(this.getSuffix({ id: id }), "Setting");
    };
    Settings.prototype.get = function (_a) {
        var id = _a.id;
        return this.settings[id] || null;
    };
    Settings.prototype.getSuffix = function (_a) {
        var id = _a.id;
        return id.charAt(0).toUpperCase() + id.slice(1);
    };
    Settings.prototype.getLocalStorageKey = function (_a) {
        var id = _a.id;
        return "".concat(this.game.framework().game_name, "-").concat(this.getSuffix({ id: id }));
    };
    Settings.prototype.open = function () {
        this.modal.show();
    };
    return Settings;
}());
var tplSettingsButton = function () {
    return "<div id=\"show_settings\">\n  <svg  xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 512\">\n    <g>\n      <path class=\"fa-secondary\" fill=\"currentColor\" d=\"M638.41 387a12.34 12.34 0 0 0-12.2-10.3h-16.5a86.33 86.33 0 0 0-15.9-27.4L602 335a12.42 12.42 0 0 0-2.8-15.7 110.5 110.5 0 0 0-32.1-18.6 12.36 12.36 0 0 0-15.1 5.4l-8.2 14.3a88.86 88.86 0 0 0-31.7 0l-8.2-14.3a12.36 12.36 0 0 0-15.1-5.4 111.83 111.83 0 0 0-32.1 18.6 12.3 12.3 0 0 0-2.8 15.7l8.2 14.3a86.33 86.33 0 0 0-15.9 27.4h-16.5a12.43 12.43 0 0 0-12.2 10.4 112.66 112.66 0 0 0 0 37.1 12.34 12.34 0 0 0 12.2 10.3h16.5a86.33 86.33 0 0 0 15.9 27.4l-8.2 14.3a12.42 12.42 0 0 0 2.8 15.7 110.5 110.5 0 0 0 32.1 18.6 12.36 12.36 0 0 0 15.1-5.4l8.2-14.3a88.86 88.86 0 0 0 31.7 0l8.2 14.3a12.36 12.36 0 0 0 15.1 5.4 111.83 111.83 0 0 0 32.1-18.6 12.3 12.3 0 0 0 2.8-15.7l-8.2-14.3a86.33 86.33 0 0 0 15.9-27.4h16.5a12.43 12.43 0 0 0 12.2-10.4 112.66 112.66 0 0 0 .01-37.1zm-136.8 44.9c-29.6-38.5 14.3-82.4 52.8-52.8 29.59 38.49-14.3 82.39-52.8 52.79zm136.8-343.8a12.34 12.34 0 0 0-12.2-10.3h-16.5a86.33 86.33 0 0 0-15.9-27.4l8.2-14.3a12.42 12.42 0 0 0-2.8-15.7 110.5 110.5 0 0 0-32.1-18.6A12.36 12.36 0 0 0 552 7.19l-8.2 14.3a88.86 88.86 0 0 0-31.7 0l-8.2-14.3a12.36 12.36 0 0 0-15.1-5.4 111.83 111.83 0 0 0-32.1 18.6 12.3 12.3 0 0 0-2.8 15.7l8.2 14.3a86.33 86.33 0 0 0-15.9 27.4h-16.5a12.43 12.43 0 0 0-12.2 10.4 112.66 112.66 0 0 0 0 37.1 12.34 12.34 0 0 0 12.2 10.3h16.5a86.33 86.33 0 0 0 15.9 27.4l-8.2 14.3a12.42 12.42 0 0 0 2.8 15.7 110.5 110.5 0 0 0 32.1 18.6 12.36 12.36 0 0 0 15.1-5.4l8.2-14.3a88.86 88.86 0 0 0 31.7 0l8.2 14.3a12.36 12.36 0 0 0 15.1 5.4 111.83 111.83 0 0 0 32.1-18.6 12.3 12.3 0 0 0 2.8-15.7l-8.2-14.3a86.33 86.33 0 0 0 15.9-27.4h16.5a12.43 12.43 0 0 0 12.2-10.4 112.66 112.66 0 0 0 .01-37.1zm-136.8 45c-29.6-38.5 14.3-82.5 52.8-52.8 29.59 38.49-14.3 82.39-52.8 52.79z\" opacity=\"0.4\"></path>\n      <path class=\"fa-primary\" fill=\"currentColor\" d=\"M420 303.79L386.31 287a173.78 173.78 0 0 0 0-63.5l33.7-16.8c10.1-5.9 14-18.2 10-29.1-8.9-24.2-25.9-46.4-42.1-65.8a23.93 23.93 0 0 0-30.3-5.3l-29.1 16.8a173.66 173.66 0 0 0-54.9-31.7V58a24 24 0 0 0-20-23.6 228.06 228.06 0 0 0-76 .1A23.82 23.82 0 0 0 158 58v33.7a171.78 171.78 0 0 0-54.9 31.7L74 106.59a23.91 23.91 0 0 0-30.3 5.3c-16.2 19.4-33.3 41.6-42.2 65.8a23.84 23.84 0 0 0 10.5 29l33.3 16.9a173.24 173.24 0 0 0 0 63.4L12 303.79a24.13 24.13 0 0 0-10.5 29.1c8.9 24.1 26 46.3 42.2 65.7a23.93 23.93 0 0 0 30.3 5.3l29.1-16.7a173.66 173.66 0 0 0 54.9 31.7v33.6a24 24 0 0 0 20 23.6 224.88 224.88 0 0 0 75.9 0 23.93 23.93 0 0 0 19.7-23.6v-33.6a171.78 171.78 0 0 0 54.9-31.7l29.1 16.8a23.91 23.91 0 0 0 30.3-5.3c16.2-19.4 33.7-41.6 42.6-65.8a24 24 0 0 0-10.5-29.1zm-151.3 4.3c-77 59.2-164.9-28.7-105.7-105.7 77-59.2 164.91 28.7 105.71 105.7z\"></path>\n    </g>\n  </svg>\n</div>";
};
var tplPlayerPrefenceSelectRow = function (_a) {
    var setting = _a.setting, currentValue = _a.currentValue, _b = _a.visible, visible = _b === void 0 ? true : _b;
    var values = setting.options
        .map(function (option) {
        return "<option value='".concat(option.value, "' ").concat(option.value === currentValue ? 'selected="selected"' : "", ">").concat(_(option.label), "</option>");
    })
        .join("");
    return "\n    <div id=\"setting_row_".concat(setting.id, "\" class=\"player_preference_row\"").concat(!visible ? " style=\"display: none;\"" : '', ">\n      <div class=\"player_preference_row_label\">").concat(_(setting.label), "</div>\n      <div class=\"player_preference_row_value\">\n        <select id=\"setting_").concat(setting.id, "\" class=\"\" style=\"display: block;\">\n        ").concat(values, "\n        </select>\n      </div>\n    </div>\n  ");
};
var tplSettingsModalTabContent = function (_a) {
    var id = _a.id;
    return "\n  <div id=\"settings_modal_tab_content_".concat(id, "\" style=\"display: none;\"></div>");
};
var tplSettingsModalTab = function (_a) {
    var id = _a.id, name = _a.name;
    return "\n  <div id=\"settings_modal_tab_".concat(id, "\" class=\"settings_modal_tab\">\n    <span>").concat(_(name), "</span>\n  </div>");
};
var tplSettingsModalContent = function (_a) {
    var tabs = _a.tabs;
    return "<div id=\"setting_modal_content\">\n    <div class=\"settings_modal_tabs\">\n  ".concat(tabs
        .map(function (_a) {
        var id = _a.id, name = _a.name;
        return tplSettingsModalTab({ id: id, name: name });
    })
        .join(""), "\n    </div>\n  </div>");
};
var tplPlayerPrefenceSliderRow = function (_a) {
    var label = _a.label, id = _a.id, _b = _a.visible, visible = _b === void 0 ? true : _b;
    return "\n  <div id=\"setting_row_".concat(id, "\" class=\"player_preference_row\"").concat(!visible ? " style=\"display: none;\"" : '', ">\n    <div class=\"player_preference_row_label\">").concat(_(label), "</div>\n    <div class=\"player_preference_row_value slider\">\n      <div id=\"setting_").concat(id, "\"></div>\n    </div>\n  </div>\n  ");
};
var CaptureState = (function () {
    function CaptureState(game) {
        this.game = game;
    }
    CaptureState.prototype.onEnteringState = function (args) {
        debug('Entering CaptureState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    CaptureState.prototype.onLeavingState = function () {
        debug('Leaving CaptureState');
    };
    CaptureState.prototype.setDescription = function (activePlayerId) { };
    CaptureState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to Capture Merry Men in'),
            args: {
                you: '${you}',
            },
        });
        this.args.spaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    _this.updateInterfaceConfirm({ space: space });
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    CaptureState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Capture in ${spaceName}?'),
            args: {
                spaceName: _(space.name),
            },
        });
        this.game.setSpaceSelected({ id: space.id });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actCapture',
                args: {
                    spaceId: space.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return CaptureState;
}());
var ChooseActionState = (function () {
    function ChooseActionState(game) {
        this.game = game;
    }
    ChooseActionState.prototype.onEnteringState = function (args) {
        debug('Entering ChooseActionState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    ChooseActionState.prototype.onLeavingState = function () {
        debug('Leaving ChooseActionState');
    };
    ChooseActionState.prototype.setDescription = function (activePlayerId) { };
    ChooseActionState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must choose an action or pass'),
            args: {
                you: '${you}',
            },
        });
        this.addActionButtons({ pass: false });
        this.game.addSecondaryActionButton({
            id: 'pass_btn',
            text: _('Pass'),
            callback: function () { return _this.updateInterfaceSelectBoxToPass(); },
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    ChooseActionState.prototype.updateInterfaceSelectBoxToPass = function () {
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a box to place your eligibility cylinder'),
            args: {
                you: '${you}',
            },
        });
        this.addActionButtons({ pass: true });
        this.game.addCancelButton();
    };
    ChooseActionState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var action = _a.action, pass = _a.pass;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: pass
                ? _('Pass and move eligibility cylinder to ${actionName}?')
                : _('Perform ${actionName}?'),
            args: {
                actionName: this.getActionName({ action: action }),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actChooseAction',
                args: {
                    action: action,
                    pass: pass,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    ChooseActionState.prototype.getActionName = function (_a) {
        var action = _a.action;
        switch (action) {
            case SINGLE_PLOT:
                return _('Single Plot');
            case EVENT:
                return _('Event');
            case PLOTS_AND_DEEDS:
                return _('Plots & Deeds');
            default:
                return '';
        }
    };
    ChooseActionState.prototype.addActionButtons = function (_a) {
        var _this = this;
        var pass = _a.pass;
        [SINGLE_PLOT, EVENT, PLOTS_AND_DEEDS].forEach(function (action) {
            if (!_this.args.track[action]) {
                return;
            }
            if (action === EVENT && !_this.args.canResolveEvent && !pass) {
                return;
            }
            _this.game.addPrimaryActionButton({
                id: "".concat(action, "_select"),
                text: _this.getActionName({ action: action }),
                callback: function () { return _this.updateInterfaceConfirm({ action: action, pass: pass }); },
            });
        });
    };
    return ChooseActionState;
}());
var ConfirmPartialTurnState = (function () {
    function ConfirmPartialTurnState(game) {
        this.game = game;
    }
    ConfirmPartialTurnState.prototype.onEnteringState = function (args) {
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    ConfirmPartialTurnState.prototype.onLeavingState = function () {
        debug("Leaving ConfirmTurnState");
    };
    ConfirmPartialTurnState.prototype.setDescription = function (activePlayerId) {
    };
    ConfirmPartialTurnState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _("${you} must confirm the switch of player. You will not be able to restart your turn"),
            args: {
                you: "${you}",
            },
        });
        this.game.addConfirmButton({
            callback: function () {
                return _this.game.takeAction({
                    action: "actConfirmPartialTurn",
                    atomicAction: false,
                });
            },
        });
        this.game.addUndoButtons(this.args);
    };
    return ConfirmPartialTurnState;
}());
var ConfirmTurnState = (function () {
    function ConfirmTurnState(game) {
        this.game = game;
    }
    ConfirmTurnState.prototype.onEnteringState = function (args) {
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    ConfirmTurnState.prototype.onLeavingState = function () {
        debug("Leaving ConfirmTurnState");
    };
    ConfirmTurnState.prototype.setDescription = function (activePlayerId) {
    };
    ConfirmTurnState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _("${you} must confirm or restart your turn"),
            args: {
                you: "${you}",
            },
        });
        this.game.addConfirmButton({
            callback: function () {
                return _this.game.takeAction({ action: "actConfirmTurn", atomicAction: false });
            },
        });
        this.game.addUndoButtons(this.args);
    };
    return ConfirmTurnState;
}());
var ConfiscateState = (function () {
    function ConfiscateState(game) {
        this.game = game;
    }
    ConfiscateState.prototype.onEnteringState = function (args) {
        debug('Entering ConfiscateState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    ConfiscateState.prototype.onLeavingState = function () {
        debug('Leaving ConfiscateState');
    };
    ConfiscateState.prototype.setDescription = function (activePlayerId) { };
    ConfiscateState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Parish to Confiscate in'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.spaces.forEach(function (space) {
            return _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () { return _this.updateInterfaceSelectCarriage({ space: space }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    ConfiscateState.prototype.updateInterfaceSelectCarriage = function (_a) {
        var _this = this;
        var space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select which type of Carriage to place'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.availableCarriageTypes.forEach(function (carriageType) {
            return _this.game.addPrimaryActionButton({
                id: "".concat(carriageType, "_btn"),
                text: carriageType,
                callback: function () { return _this.updateInterfaceConfirm({ space: space, carriageType: carriageType }); },
            });
        });
        this.game.addCancelButton();
    };
    ConfiscateState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var carriageType = _a.carriageType, space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Place ${carriageType} in ${spaceName}?'),
            args: {
                spaceName: _(space.name),
                carriageType: carriageType,
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actConfiscate',
                args: {
                    spaceId: space.id,
                    carriageType: carriageType,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return ConfiscateState;
}());
var DisperseState = (function () {
    function DisperseState(game) {
        this.game = game;
    }
    DisperseState.prototype.onEnteringState = function (args) {
        debug('Entering DisperseState');
        this.args = args;
        this.selectedOption = null;
        this.publicForcesCamps = [];
        this.publicForcesMerryMen = [];
        this.selectedCamps = [];
        this.selectedMerryMen = [];
        this.updateInterfaceInitialStep();
    };
    DisperseState.prototype.onLeavingState = function () {
        debug('Leaving DisperseState');
    };
    DisperseState.prototype.setDescription = function (activePlayerId) { };
    DisperseState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Parish to Disperse in'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args.options).forEach(function (_a) {
            var spaceId = _a[0], option = _a[1];
            return _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () {
                    _this.selectedOption = option;
                    _this.selectPublicForces();
                    _this.updateInterfaceSelectMerryMenAndCamps();
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    DisperseState.prototype.updateInterfaceSelectMerryMenAndCamps = function () {
        var _this = this;
        if (this.selectedMerryMen.length + this.selectedCamps.length === 2) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may select up to two pieces to remove'),
            args: {
                you: '${you}',
            },
        });
        this.setMerryMenSelectable();
        if (this.selectedMerryMen.length === this.publicForcesMerryMen.length) {
            this.setCampsSelectable();
        }
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
            extraClasses: this.selectedMerryMen.length + this.selectedCamps.length === 0
                ? DISABLED
                : '',
        });
        this.game.addCancelButton();
    };
    DisperseState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.selectedCamps.forEach(function (camp) {
            return _this.game.setElementSelected({ id: camp.id });
        });
        this.selectedMerryMen.forEach(function (merryMan) {
            return _this.game.setElementSelected({ id: merryMan.id });
        });
        this.game.clientUpdatePageTitle({
            text: _('Disperse in ${spaceName}?'),
            args: {
                spaceName: _(this.selectedOption.space.name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actDisperse',
                args: {
                    spaceId: _this.selectedOption.space.id,
                    camps: _this.selectedCamps.map(function (camp) { return ({
                        type: camp.type,
                        hidden: camp.hidden,
                    }); }),
                    merryMen: _this.selectedMerryMen.map(function (merryMan) { return ({
                        type: merryMan.type,
                        hidden: merryMan.hidden,
                    }); }),
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    DisperseState.prototype.selectPublicForces = function () {
        var _this = this;
        this.selectedOption.merryMen.forEach(function (_a) {
            var type = _a.type, hidden = _a.hidden;
            var merryMan = _this.game.gameMap.getForcePublic({
                type: type,
                hidden: hidden,
                spaceId: _this.selectedOption.space.id,
                exclude: _this.publicForcesMerryMen,
            });
            _this.publicForcesMerryMen.push(merryMan);
        });
        this.selectedOption.camps.forEach(function (_a) {
            var type = _a.type, hidden = _a.hidden;
            var camp = _this.game.gameMap.getForcePublic({
                type: type,
                hidden: hidden,
                spaceId: _this.selectedOption.space.id,
                exclude: _this.publicForcesCamps,
            });
            _this.publicForcesCamps.push(camp);
        });
    };
    DisperseState.prototype.setCampsSelectable = function () {
        var _this = this;
        this.selectedCamps.forEach(function (camp) {
            _this.game.setElementSelected({ id: camp.id });
            _this.game.setElementSelectable({
                id: camp.id,
                callback: function () {
                    _this.selectedCamps = _this.selectedCamps.filter(function (selected) { return selected.id !== camp.id; });
                    _this.updateInterfaceSelectMerryMenAndCamps();
                },
            });
        });
        this.publicForcesCamps
            .filter(function (publicForce) {
            return !_this.selectedCamps.some(function (camp) { return camp.id === publicForce.id; });
        })
            .forEach(function (camp) {
            _this.game.setElementSelectable({
                id: camp.id,
                callback: function () {
                    _this.selectedCamps.push(camp);
                    _this.updateInterfaceSelectMerryMenAndCamps();
                },
            });
        });
    };
    DisperseState.prototype.setMerryMenSelectable = function () {
        var _this = this;
        this.selectedMerryMen.forEach(function (merryMan) {
            _this.game.setElementSelected({ id: merryMan.id });
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () {
                    _this.selectedMerryMen = _this.selectedMerryMen.filter(function (selected) { return selected.id !== merryMan.id; });
                    _this.selectedCamps = [];
                    _this.updateInterfaceSelectMerryMenAndCamps();
                },
            });
        });
        this.publicForcesMerryMen
            .filter(function (publicForce) {
            return !_this.selectedMerryMen.some(function (merryMan) { return merryMan.id === publicForce.id; });
        })
            .forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () {
                    _this.selectedMerryMen.push(merryMan);
                    _this.updateInterfaceSelectMerryMenAndCamps();
                },
            });
        });
    };
    return DisperseState;
}());
var DonateState = (function () {
    function DonateState(game) {
        this.game = game;
    }
    DonateState.prototype.onEnteringState = function (args) {
        debug('Entering DonateState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    DonateState.prototype.onLeavingState = function () {
        debug('Leaving DonateState');
    };
    DonateState.prototype.setDescription = function (activePlayerId) { };
    DonateState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Parish to Donate in'),
            args: {
                you: '${you}',
            },
        });
        this.args.spaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () { return _this.updateInterfaceConfirm({ space: space }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    DonateState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Donate in ${spaceName}?'),
            args: {
                spaceName: _(space.name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actDonate',
                args: {
                    spaceId: space.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return DonateState;
}());
var EventATaleOfTwoLoversLightState = (function () {
    function EventATaleOfTwoLoversLightState(game) {
        this.game = game;
    }
    EventATaleOfTwoLoversLightState.prototype.onEnteringState = function (args) {
        debug('Entering EventATaleOfTwoLoversLightState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    EventATaleOfTwoLoversLightState.prototype.onLeavingState = function () {
        debug('Leaving EventATaleOfTwoLoversLightState');
    };
    EventATaleOfTwoLoversLightState.prototype.setDescription = function (activePlayerId) { };
    EventATaleOfTwoLoversLightState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args._private).forEach(function (_a) {
            var spaceId = _a[0], option = _a[1];
            return _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () { return _this.updateInterfaceSelectMerryMen(option); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventATaleOfTwoLoversLightState.prototype.updateInterfaceSelectMerryMen = function (_a) {
        var _this = this;
        var space = _a.space, merryMen = _a.merryMen, henchmen = _a.henchmen;
        this.game.clearPossible();
        if (merryMen.length === 1) {
            this.updateInterfaceSelectHenchmen({
                space: space,
                henchmen: henchmen,
                merryMan: merryMen[0],
            });
            return;
        }
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Merry Man to remove from the game'),
            args: {
                you: '${you}',
            },
        });
        merryMen.forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () {
                    return _this.updateInterfaceSelectHenchmen({ space: space, merryMan: merryMan, henchmen: henchmen });
                },
            });
        });
        this.game.addCancelButton();
    };
    EventATaleOfTwoLoversLightState.prototype.updateInterfaceSelectHenchmen = function (_a) {
        var _this = this;
        var space = _a.space, merryMan = _a.merryMan, henchmen = _a.henchmen;
        this.game.clearPossible();
        if (henchmen.length === 0) {
            this.updateInterfaceConfirm({ space: space, merryMan: merryMan, henchmenCount: 0 });
            return;
        }
        this.game.clientUpdatePageTitle({
            text: _('${you} must choose how many Henchmen to remove from the game'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: merryMan.id });
        var _loop_3 = function (i) {
            this_1.game.addPrimaryActionButton({
                id: "".concat(i, "_btn"),
                text: "".concat(i),
                callback: function () {
                    _this.updateInterfaceConfirm({ space: space, henchmenCount: i, merryMan: merryMan });
                },
            });
        };
        var this_1 = this;
        for (var i = 0; i <= Math.min(henchmen.length, 2); i++) {
            _loop_3(i);
        }
        this.game.addCancelButton();
    };
    EventATaleOfTwoLoversLightState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space, merryMan = _a.merryMan, henchmenCount = _a.henchmenCount;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Remove 1 Merry Man and ${count} Henchmen from ${spaceName} from the game?'),
            args: {
                spaceName: _(space.name),
                count: henchmenCount,
            },
        });
        this.game.setElementSelected({ id: merryMan.id });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventATaleOfTwoLoversLight',
                args: {
                    spaceId: space.id,
                    merryManId: merryMan.id,
                    henchmenCount: henchmenCount,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return EventATaleOfTwoLoversLightState;
}());
var EventGuyOfGisborneState = (function () {
    function EventGuyOfGisborneState(game) {
        this.game = game;
    }
    EventGuyOfGisborneState.prototype.onEnteringState = function (args) {
        debug('Entering EventGuyOfGisborneState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    EventGuyOfGisborneState.prototype.onLeavingState = function () {
        debug('Leaving EventGuyOfGisborneState');
    };
    EventGuyOfGisborneState.prototype.setDescription = function (activePlayerId) { };
    EventGuyOfGisborneState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may select a Merry Man to swap with Robin Hood'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.merryMen.forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () { return _this.updateInterfaceConfirm({ merryMan: merryMan }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventGuyOfGisborneState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var merryMan = _a.merryMan;
        this.game.clearPossible();
        this.game.setElementSelected({ id: merryMan.id });
        this.game.clientUpdatePageTitle({
            text: _('Swap Robin Hood with Merry Man in ${spaceName}?  '),
            args: {
                spaceName: _(this.game.gamedatas.spaces[merryMan.location].name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventGuyOfGisborne',
                args: {
                    merryManId: merryMan.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return EventGuyOfGisborneState;
}());
var EventBoatsBridgesDarkState = (function () {
    function EventBoatsBridgesDarkState(game) {
        this.selectedBorderId = '';
        this.game = game;
    }
    EventBoatsBridgesDarkState.prototype.onEnteringState = function (args) {
        debug('Entering EventBoatsBridgesDarkState');
        this.args = args;
        this.selectedBorderId = '';
        this.updateInterfaceInitialStep();
    };
    EventBoatsBridgesDarkState.prototype.onLeavingState = function () {
        debug('Leaving EventBoatsBridgesDarkState');
    };
    EventBoatsBridgesDarkState.prototype.setDescription = function (activePlayerId) { };
    EventBoatsBridgesDarkState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may select a River border to place the Bridge'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(RIVER_BORDERS).forEach(function (_a) {
            var borderId = _a[0], spaceIds = _a[1];
            return _this.game.setElementSelectable({
                id: borderId,
                callback: function () {
                    _this.selectedBorderId = borderId;
                    _this.updateInterfaceConfirm();
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventBoatsBridgesDarkState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.setElementSelected({ id: this.selectedBorderId });
        var node = document.getElementById(this.selectedBorderId);
        if (node) {
            node.setAttribute('data-has-bridge', 'true');
        }
        var spaceIds = RIVER_BORDERS[this.selectedBorderId];
        this.game.clientUpdatePageTitle({
            text: _('Place the Bridge on the border between ${spaceName} and ${spaceName2}?  '),
            args: {
                spaceName: this.game.gamedatas.spaces[spaceIds[0]].name,
                spaceName2: this.game.gamedatas.spaces[spaceIds[1]].name,
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventBoatsBridgesDark',
                args: {
                    borderId: _this.selectedBorderId,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.addCancelButton();
    };
    EventBoatsBridgesDarkState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addCancelButton({
            callback: function () {
                var node = document.getElementById(_this.selectedBorderId);
                if (node) {
                    node.removeAttribute('data-has-bridge');
                }
                _this.game.onCancel();
            },
        });
    };
    return EventBoatsBridgesDarkState;
}());
var EventBoatsBridgesLightState = (function () {
    function EventBoatsBridgesLightState(game) {
        this.game = game;
    }
    EventBoatsBridgesLightState.prototype.onEnteringState = function (args) {
        debug('Entering EventBoatsBridgesLightState');
        this.args = args;
        this.fromSpaceId = '';
        this.selectedMerryMenIds = [];
        this.updateInterfaceInitialStep();
    };
    EventBoatsBridgesLightState.prototype.onLeavingState = function () {
        debug('Leaving EventBoatsBridgesLightState');
    };
    EventBoatsBridgesLightState.prototype.setDescription = function (activePlayerId) { };
    EventBoatsBridgesLightState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a space to move Merry Men from'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args._private).forEach(function (_a) {
            var spaceId = _a[0], _b = _a[1], space = _b.space, merryMen = _b.merryMen;
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () {
                    _this.fromSpaceId = spaceId;
                    _this.updateInterfaceSelectMerryMen();
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventBoatsBridgesLightState.prototype.updateInterfaceSelectMerryMen = function () {
        var _this = this;
        if (this.selectedMerryMenIds.length ===
            this.args._private[this.fromSpaceId].merryMen.length) {
            this.updateInterfaceSelectDestination();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select Merry Men to move'),
            args: {
                you: '${you}',
            },
        });
        this.args._private[this.fromSpaceId].merryMen.forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () {
                    if (_this.selectedMerryMenIds.includes(merryMan.id)) {
                        _this.selectedMerryMenIds = _this.selectedMerryMenIds.filter(function (id) { return id !== merryMan.id; });
                    }
                    else {
                        _this.selectedMerryMenIds.push(merryMan.id);
                    }
                    _this.updateInterfaceSelectMerryMen();
                },
            });
        });
        this.selectedMerryMenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceSelectDestination(); },
            extraClasses: this.selectedMerryMenIds.length === 0 ? DISABLED : '',
        });
        this.game.addCancelButton();
    };
    EventBoatsBridgesLightState.prototype.updateInterfaceSelectDestination = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a space to move your Merry Men to'),
            args: {
                you: '${you}',
            },
        });
        this.selectedMerryMenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        SPACES.filter(function (id) { return ![_this.fromSpaceId, SHIRE_WOOD, OLLERTON_HILL].includes(id); }).forEach(function (spaceId) {
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () { return _this.updateInterfaceConfirm({ toSpaceId: spaceId }); },
            });
        });
        this.game.addCancelButton();
    };
    EventBoatsBridgesLightState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var toSpaceId = _a.toSpaceId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Move Merry Men from ${spaceName} to ${spaceName2}?  '),
            args: {
                spaceName: _(this.game.gamedatas.spaces[this.fromSpaceId].name),
                spaceName2: _(this.game.gamedatas.spaces[toSpaceId].name),
            },
        });
        this.selectedMerryMenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventBoatsBridgesLight',
                args: {
                    merryMenIds: _this.selectedMerryMenIds,
                    fromSpaceId: _this.fromSpaceId,
                    toSpaceId: toSpaceId,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return EventBoatsBridgesLightState;
}());
var EventAmbushLightState = (function () {
    function EventAmbushLightState(game) {
        this.selectedSpaceId = '';
        this.merryMenIds = [];
        this.game = game;
    }
    EventAmbushLightState.prototype.onEnteringState = function (args) {
        debug('Entering EventAmbushLightState');
        this.args = args;
        this.selectedSpaceId = '';
        this.merryMenIds = [];
        this.updateInterfaceInitialStep();
    };
    EventAmbushLightState.prototype.onLeavingState = function () {
        debug('Leaving EventAmbushLightState');
    };
    EventAmbushLightState.prototype.setDescription = function (activePlayerId) { };
    EventAmbushLightState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        if (this.args._private.spaceIds.length === 1) {
            this.selectedSpaceId = this.args._private.spaceIds[0];
            this.updateInterfaceSelectMerryMen();
            return;
        }
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a space with a Carriage'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.spaceIds.forEach(function (spaceId) {
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () {
                    _this.selectedSpaceId = spaceId;
                    _this.updateInterfaceSelectMerryMen();
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventAmbushLightState.prototype.updateInterfaceSelectMerryMen = function () {
        var _this = this;
        if (this.merryMenIds.length === this.args._private.merryMen.length) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may select Merry Men to move to ${spaceName}'),
            args: {
                spaceName: _(this.game.gamedatas.spaces[this.selectedSpaceId].name),
                you: '${you}',
            },
        });
        this.args._private.merryMen.forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () { return _this.handleMerryManClick({ merryMan: merryMan }); },
            });
        });
        this.merryMenIds.forEach(function (id) { return _this.game.setElementSelected({ id: id }); });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        this.game.addCancelButton();
    };
    EventAmbushLightState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Move Merry Men to ${spaceName}?'),
            args: {
                spaceName: this.game.gamedatas.spaces[this.selectedSpaceId].name,
            },
        });
        this.merryMenIds.forEach(function (id) { return _this.game.setElementSelected({ id: id }); });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventAmbushLight',
                args: {
                    spaceId: _this.selectedSpaceId,
                    merryMenIds: _this.merryMenIds,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    EventAmbushLightState.prototype.handleMerryManClick = function (_a) {
        var merryMan = _a.merryMan;
        if (this.merryMenIds.includes(merryMan.id)) {
            this.merryMenIds = this.merryMenIds.filter(function (id) { return id !== merryMan.id; });
        }
        else {
            this.merryMenIds.push(merryMan.id);
        }
        this.updateInterfaceSelectMerryMen();
    };
    return EventAmbushLightState;
}());
var EventMaidMarianDarkState = (function () {
    function EventMaidMarianDarkState(game) {
        this.game = game;
        this.carriageId = '';
        this.option = null;
        this.merryMenSpaceId = '';
    }
    EventMaidMarianDarkState.prototype.onEnteringState = function (args) {
        debug('Entering EventMaidMarianDarkState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    EventMaidMarianDarkState.prototype.onLeavingState = function () {
        debug('Leaving EventMaidMarianDarkState');
    };
    EventMaidMarianDarkState.prototype.setDescription = function (activePlayerId) { };
    EventMaidMarianDarkState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        if (this.args._private.carriages.length === 1) {
            this.carriageId = this.args._private.carriages[0].id;
            this.updateInterfaceSelectParish();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Carriage to remove to the Used Carriages box'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.carriages.forEach(function (carriage) {
            _this.game.setElementSelectable({
                id: carriage.id,
                callback: function () {
                    _this.carriageId = carriage.id;
                    _this.updateInterfaceSelectParish();
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventMaidMarianDarkState.prototype.updateInterfaceSelectParish = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Parish to set to Submissive'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.spaces.forEach(function (option) {
            var space = option.space;
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    _this.option = option;
                    if (option.hasMerryMen) {
                        _this.updateInterfaceSelectMerrySpace();
                    }
                    else {
                        _this.updateInterfaceConfirm();
                    }
                },
            });
        });
        this.game.setElementSelected({ id: this.carriageId });
        this.game.addCancelButton();
    };
    EventMaidMarianDarkState.prototype.updateInterfaceSelectMerrySpace = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a space to move all Merry Men in ${spaceName} to'),
            args: {
                you: '${you}',
                spaceName: _(this.option.space.name),
            },
        });
        this.option.adjacentSpacesIds.forEach(function (id) {
            var space = _this.game.gamedatas.spaces[id];
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    _this.merryMenSpaceId = space.id;
                    _this.updateInterfaceConfirm();
                },
            });
        });
        this.game.setElementSelected({ id: this.carriageId });
        this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(this.option.space.id)]
            .getCards()
            .forEach(function (_a) {
            var id = _a.id;
            return _this.game.setElementSelected({ id: id });
        });
        this.game.addCancelButton();
    };
    EventMaidMarianDarkState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        var text = _('Remove Carriage, set ${spaceName} to Submissive and move Merry Men to ${spaceNameMerryMen}?');
        if (!this.merryMenSpaceId) {
            text = _('Remove Carriage and set ${spaceName} to Submissive?');
        }
        this.game.setElementSelected({ id: this.carriageId });
        if (this.merryMenSpaceId) {
            this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(this.option.space.id)]
                .getCards()
                .forEach(function (_a) {
                var id = _a.id;
                return _this.game.setElementSelected({ id: id });
            });
        }
        this.game.clientUpdatePageTitle({
            text: text,
            args: {
                spaceName: _(this.option.space.name),
                spaceNameMerryMen: this.merryMenSpaceId
                    ? _(this.game.gamedatas.spaces[this.merryMenSpaceId].name)
                    : '',
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventMaidMarianDark',
                args: {
                    carriageId: _this.carriageId,
                    spaceId: _this.option.space.id,
                    merryMenSpaceId: _this.merryMenSpaceId || null,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return EventMaidMarianDarkState;
}());
var EventReplaceHenchmenState = (function () {
    function EventReplaceHenchmenState(game) {
        this.selectedForces = [];
        this.selectableForces = [];
        this.showSelected = [];
        this.placeRobinHood = false;
        this.game = game;
    }
    EventReplaceHenchmenState.prototype.onEnteringState = function (args) {
        debug('Entering EventReplaceHenchmenState');
        this.args = args;
        this.selectedForces = [];
        this.selectableForces = [];
        this.showSelected = [];
        this.placeRobinHood = false;
        this.selectableForces = this.args._private.forces;
        this.showSelected = this.args._private.showSelected || [];
        this.updateInterfaceInitialStep();
    };
    EventReplaceHenchmenState.prototype.onLeavingState = function () {
        debug('Leaving EventReplaceHenchmenState');
    };
    EventReplaceHenchmenState.prototype.setDescription = function (activePlayerId, args) { };
    EventReplaceHenchmenState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        if (this.selectedForces.length === this.args._private.max) {
            this.updateInterfacePlaceRobinHood();
            return;
        }
        this.game.clearPossible();
        this.updatePageTitle();
        this.selectableForces.forEach(function (force) {
            _this.game.setElementSelectable({
                id: force.id,
                callback: function () { return _this.handleForceClick({ force: force }); },
            });
        });
        this.selectedForces.forEach(function (force) {
            return _this.game.setElementSelected({ id: force.id });
        });
        this.showSelected.forEach(function (force) {
            return _this.game.setElementSelected({ id: force.id });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfacePlaceRobinHood(); },
            extraClasses: this.selectedForces.length < this.args._private.min ? DISABLED : '',
        });
        if (this.selectedForces.length > 0) {
            this.game.addCancelButton();
        }
        else {
            this.game.addPassButton({
                optionalAction: this.args.optionalAction,
            });
            this.game.addUndoButtons(this.args);
        }
    };
    EventReplaceHenchmenState.prototype.updateInterfacePlaceRobinHood = function () {
        var _this = this;
        if (!this.args._private.robinHoodInSupply) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Place Robin Hood?'),
            args: {},
        });
        this.selectedForces.forEach(function (_a) {
            var id = _a.id;
            return _this.game.setElementSelected({ id: id });
        });
        this.game.addPrimaryActionButton({
            id: 'yes_btn',
            text: _('Yes'),
            callback: function () {
                _this.placeRobinHood = true;
                _this.updateInterfaceConfirm();
            },
        });
        this.game.addPrimaryActionButton({
            id: 'no_btn',
            text: _('No'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        this.game.addCancelButton();
    };
    EventReplaceHenchmenState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Replace Henchmen with Merry Men?'),
            args: {
                count: this.selectedForces.length,
            },
        });
        this.selectedForces.forEach(function (_a) {
            var id = _a.id;
            return _this.game.setElementSelected({ id: id });
        });
        this.showSelected.forEach(function (force) {
            return _this.game.setElementSelected({ id: force.id });
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventReplaceHenchmen',
                args: {
                    henchmenIds: _this.getCallbackArgs(),
                    placeRobinHood: _this.placeRobinHood,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    EventReplaceHenchmenState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} may select Henchmen to replace with Merry Men (${count} remaining)'),
            args: {
                you: '${you}',
                count: this.args._private.max - this.selectedForces.length,
            },
        });
    };
    EventReplaceHenchmenState.prototype.getCallbackArgs = function () {
        return this.selectedForces.map(function (_a) {
            var id = _a.id;
            return id;
        });
    };
    EventReplaceHenchmenState.prototype.handleForceClick = function (_a) {
        var force = _a.force;
        if (this.selectedForces.some(function (_a) {
            var id = _a.id;
            return id === force.id;
        })) {
            this.selectedForces = this.selectedForces.filter(function (_a) {
                var id = _a.id;
                return id !== force.id;
            });
        }
        else {
            this.selectedForces.push(force);
        }
        this.updateInterfaceInitialStep();
    };
    return EventReplaceHenchmenState;
}());
var EventRoyalPardonLightState = (function () {
    function EventRoyalPardonLightState(game) {
        this.game = game;
    }
    EventRoyalPardonLightState.prototype.onEnteringState = function (args) {
        debug('Entering EventRoyalPardonLightState');
        this.args = args;
        this.merryMenIds = [];
        this.updateInterfaceInitialStep();
    };
    EventRoyalPardonLightState.prototype.onLeavingState = function () {
        debug('Leaving EventRoyalPardonLightState');
    };
    EventRoyalPardonLightState.prototype.setDescription = function (activePlayerId) { };
    EventRoyalPardonLightState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        if (this.merryMenIds.length === this.args._private.count) {
            this.updateInterfaceSelectSpace();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select Merry Men to release from Prison (${count} remaining)'),
            args: {
                you: '${you}',
                count: this.args._private.count - this.merryMenIds.length,
            },
        });
        this.args._private.forces.forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () { return _this.handleMerryManClick({ merryMan: merryMan }); },
            });
        });
        this.merryMenIds.forEach(function (id) { return _this.game.setElementSelected({ id: id }); });
        if (this.merryMenIds.length > 0) {
            this.game.addCancelButton();
        }
        else {
            this.game.addPassButton({
                optionalAction: this.args.optionalAction,
            });
            this.game.addUndoButtons(this.args);
        }
    };
    EventRoyalPardonLightState.prototype.updateInterfaceSelectSpace = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a space to place your Merry Men'),
            args: {
                you: '${you}',
            },
        });
        this.merryMenIds.forEach(function (id) { return _this.game.setElementSelected({ id: id }); });
        this.args._private.spaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    _this.updateInterfaceConfirm({ space: space });
                },
            });
        });
        this.game.addCancelButton();
    };
    EventRoyalPardonLightState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Place ${count} Merry Men in ${spaceName}?'),
            args: {
                spaceName: _(space.name),
                count: this.merryMenIds.length,
            },
        });
        this.merryMenIds.forEach(function (id) { return _this.game.setElementSelected({ id: id }); });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventRoyalPardonLight',
                args: {
                    merryMenIds: _this.merryMenIds,
                    spaceId: space.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    EventRoyalPardonLightState.prototype.handleMerryManClick = function (_a) {
        var merryMan = _a.merryMan;
        if (this.merryMenIds.includes(merryMan.id)) {
            this.merryMenIds = this.merryMenIds.filter(function (id) { return id !== merryMan.id; });
        }
        else {
            this.merryMenIds.push(merryMan.id);
        }
        this.updateInterfaceInitialStep();
    };
    return EventRoyalPardonLightState;
}());
var EventSelectForcesState = (function () {
    function EventSelectForcesState(game) {
        this.selectedForces = [];
        this.selectableForces = [];
        this.showSelected = [];
        this.game = game;
    }
    EventSelectForcesState.prototype.onEnteringState = function (args) {
        debug('Entering EventSelectForcesState');
        this.args = args;
        this.selectedForces = [];
        this.selectableForces = [];
        this.showSelected = [];
        this.fromSpaceId = null;
        if (this.args._private.type === 'private') {
            this.selectableForces = this.args._private.forces;
            this.showSelected = this.args._private.showSelected || [];
        }
        else if (this.args._private.type === 'public') {
            this.getSelectablePublicForces({ forces: this.args._private.forces });
            this.getShowSelectedPublicForces({
                forces: this.args._private.showSelected || [],
            });
        }
        this.updateInterfaceInitialStep();
    };
    EventSelectForcesState.prototype.onLeavingState = function () {
        debug('Leaving EventSelectForcesState');
    };
    EventSelectForcesState.prototype.setDescription = function (activePlayerId, args) {
        if (args.titleOther) {
            this.game.clientUpdatePageTitle({
                text: _(args.titleOther),
                args: {
                    actplayer: '${actplayer}',
                },
                nonActivePlayers: true,
            });
        }
    };
    EventSelectForcesState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        if (this.selectedForces.length === this.args._private.max) {
            this.updateInterfaceConfirm();
            return;
        }
        var selectable = this.selectableForces.filter(function (force) {
            return _this.fromSpaceId === null ? true : force.location === _this.fromSpaceId;
        });
        if (selectable.length === this.selectedForces.length) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clearPossible();
        this.updatePageTitle();
        selectable.forEach(function (force) {
            _this.game.setElementSelectable({
                id: force.id,
                callback: function () { return _this.handleForceClick({ force: force }); },
            });
        });
        this.selectedForces.forEach(function (force) {
            return _this.game.setElementSelected({ id: force.id });
        });
        this.showSelected.forEach(function (force) {
            return _this.game.setElementSelected({ id: force.id });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
            extraClasses: this.selectedForces.length < this.args._private.min ? DISABLED : '',
        });
        if (this.selectedForces.length > 0) {
            this.game.addCancelButton();
        }
        else {
            this.game.addPassButton({
                optionalAction: this.args.optionalAction,
                text: this.args.passButtonText || undefined,
            });
            this.game.addUndoButtons(this.args);
        }
    };
    EventSelectForcesState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _(this.args.confirmText),
            args: {
                count: this.selectedForces.length,
            },
        });
        this.selectedForces.forEach(function (_a) {
            var id = _a.id;
            return _this.game.setElementSelected({ id: id });
        });
        this.showSelected.forEach(function (force) {
            return _this.game.setElementSelected({ id: force.id });
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventSelectForces',
                args: {
                    selectedForces: _this.getCallbackArgs(),
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    EventSelectForcesState.prototype.getSelectablePublicForces = function (_a) {
        var _this = this;
        var forces = _a.forces;
        forces.forEach(function (_a) {
            var type = _a.type, hidden = _a.hidden, spaceId = _a.spaceId;
            var force = _this.game.gameMap.getForcePublic({
                type: type,
                hidden: hidden,
                spaceId: spaceId,
                exclude: _this.selectableForces,
            });
            _this.selectableForces.push(force);
        });
    };
    EventSelectForcesState.prototype.getShowSelectedPublicForces = function (_a) {
        var _this = this;
        var forces = _a.forces;
        forces.forEach(function (_a) {
            var type = _a.type, hidden = _a.hidden, spaceId = _a.spaceId;
            var force = _this.game.gameMap.getForcePublic({
                type: type,
                hidden: hidden,
                spaceId: spaceId,
                exclude: _this.showSelected,
            });
            _this.showSelected.push(force);
        });
    };
    EventSelectForcesState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _(this.args.title),
            args: {
                you: '${you}',
                count: this.args._private.max - this.selectedForces.length,
            },
        });
    };
    EventSelectForcesState.prototype.getCallbackArgs = function () {
        if (this.args._private.type === 'private') {
            return this.selectedForces.map(function (_a) {
                var id = _a.id;
                return id;
            });
        }
        else {
            return this.selectedForces.map(function (_a) {
                var type = _a.type, hidden = _a.hidden, location = _a.location;
                return ({
                    type: type,
                    hidden: hidden,
                    spaceId: location,
                });
            });
        }
    };
    EventSelectForcesState.prototype.checkFromSpaceId = function () {
        if (!(this.args._private.conditions || []).includes(ONE_SPACE)) {
            return;
        }
        if (this.selectedForces.length > 0) {
            this.fromSpaceId = this.selectedForces[0].location;
        }
        else if (this.selectedForces.length === 0) {
            this.fromSpaceId = null;
        }
    };
    EventSelectForcesState.prototype.handleForceClick = function (_a) {
        var force = _a.force;
        if (this.selectedForces.some(function (_a) {
            var id = _a.id;
            return id === force.id;
        })) {
            this.selectedForces = this.selectedForces.filter(function (_a) {
                var id = _a.id;
                return id !== force.id;
            });
        }
        else {
            this.selectedForces.push(force);
        }
        this.checkFromSpaceId();
        this.updateInterfaceInitialStep();
    };
    return EventSelectForcesState;
}());
var EventSelectSpaceState = (function () {
    function EventSelectSpaceState(game) {
        this.game = game;
    }
    EventSelectSpaceState.prototype.onEnteringState = function (args) {
        debug('Entering EventSelectSpaceState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    EventSelectSpaceState.prototype.onLeavingState = function () {
        debug('Leaving EventSelectSpaceState');
    };
    EventSelectSpaceState.prototype.setDescription = function (activePlayerId, args) {
        if (args.titleOther) {
            this.game.clientUpdatePageTitle({
                text: _(args.titleOther),
                args: {
                    actplayer: '${actplayer}'
                },
                nonActivePlayers: true,
            });
        }
    };
    EventSelectSpaceState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _(this.args.title),
            args: {
                you: '${you}',
            },
        });
        this.args.spaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () { return _this.updateInterfaceConfirm({ space: space }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventSelectSpaceState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _(this.args.confirmText),
            args: {
                spaceName: _(space.name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventSelectSpace',
                args: {
                    spaceId: space.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return EventSelectSpaceState;
}());
var EventWillStutelyLightState = (function () {
    function EventWillStutelyLightState(game) {
        this.game = game;
    }
    EventWillStutelyLightState.prototype.onEnteringState = function (args) {
        debug('Entering EventWillStutelyLightState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    EventWillStutelyLightState.prototype.onLeavingState = function () {
        debug('Leaving EventWillStutelyLightState');
    };
    EventWillStutelyLightState.prototype.setDescription = function (activePlayerId, args) { };
    EventWillStutelyLightState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Merry Man to move'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args._private).forEach(function (_a) {
            var merryManId = _a[0], _b = _a[1], merryMan = _b.merryMan, adjacentParishIds = _b.adjacentParishIds;
            _this.game.setElementSelectable({
                id: merryManId,
                callback: function () {
                    return _this.updateInterfaceSelectAdjacentParish({
                        merryMan: merryMan,
                        adjacentParishIds: adjacentParishIds,
                    });
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventWillStutelyLightState.prototype.updateInterfaceSelectAdjacentParish = function (_a) {
        var _this = this;
        var adjacentParishIds = _a.adjacentParishIds, merryMan = _a.merryMan;
        if (adjacentParishIds.length === 1) {
            this.updateInterfaceConfirm({ merryMan: merryMan, parishId: adjacentParishIds[0] });
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Parish to move your Merry Man to'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: merryMan.id });
        adjacentParishIds.forEach(function (parishId) {
            _this.game.addPrimaryActionButton({
                id: "".concat(parishId, "_btn"),
                text: _(_this.game.gamedatas.spaces[parishId].name),
                callback: function () { return _this.updateInterfaceConfirm({ merryMan: merryMan, parishId: parishId }); },
            });
        });
        this.game.addCancelButton();
    };
    EventWillStutelyLightState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var merryMan = _a.merryMan, parishId = _a.parishId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Move your Merry Man to ${spaceName}?'),
            args: {
                spaceName: _(this.game.gamedatas.spaces[parishId].name),
            },
        });
        this.game.setElementSelected({ id: merryMan.id });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventWillStutelyLight',
                args: {
                    merryManId: merryMan.id,
                    parishId: parishId,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return EventWillStutelyLightState;
}());
var FortuneEventDayOfMarketRobinHoodState = (function () {
    function FortuneEventDayOfMarketRobinHoodState(game) {
        this.game = game;
    }
    FortuneEventDayOfMarketRobinHoodState.prototype.onEnteringState = function (args) {
        debug('Entering FortuneEventDayOfMarketRobinHoodState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    FortuneEventDayOfMarketRobinHoodState.prototype.onLeavingState = function () {
        debug('Leaving FortuneEventDayOfMarketRobinHoodState');
    };
    FortuneEventDayOfMarketRobinHoodState.prototype.setDescription = function (activePlayerId) { };
    FortuneEventDayOfMarketRobinHoodState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may select a Merry Man to remove'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.merryMen.forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () { return _this.updateInterfaceConfirm({ merryMan: merryMan }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    FortuneEventDayOfMarketRobinHoodState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var merryMan = _a.merryMan;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Remove your Merry Man to gain ${amount} Shillings?'),
            args: {
                amount: this.args._private.amount,
            },
        });
        this.game.setElementSelected({ id: merryMan.id });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actFortuneEventDayOfMarketRobinHood',
                args: {
                    merryManId: merryMan.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return FortuneEventDayOfMarketRobinHoodState;
}());
var FortuneEventDayOfMarketSheriffState = (function () {
    function FortuneEventDayOfMarketSheriffState(game) {
        this.selectedHenchmenIds = [];
        this.game = game;
    }
    FortuneEventDayOfMarketSheriffState.prototype.onEnteringState = function (args) {
        debug('Entering FortuneEventDayOfMarketSheriffState');
        this.args = args;
        this.selectedHenchmenIds = [];
        this.updateInterfaceInitialStep();
    };
    FortuneEventDayOfMarketSheriffState.prototype.onLeavingState = function () {
        debug('Leaving FortuneEventDayOfMarketSheriffState');
    };
    FortuneEventDayOfMarketSheriffState.prototype.setDescription = function (activePlayerId) { };
    FortuneEventDayOfMarketSheriffState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.updatePageTitle();
        this.args.henchmen.forEach(function (henchman) {
            _this.game.setElementSelectable({
                id: henchman.id,
                callback: function () { return _this.handleHenchmenClick({ henchman: henchman }); },
            });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    FortuneEventDayOfMarketSheriffState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Return ${count} Henchmen to Available to gain ${count} Shillings?'),
            args: {
                count: this.selectedHenchmenIds.length,
            },
        });
        this.selectedHenchmenIds.forEach(function (henchmanId) {
            return _this.game.setElementSelected({ id: henchmanId });
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actFortuneEventDayOfMarketSheriff',
                args: {
                    henchmenIds: _this.selectedHenchmenIds,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    FortuneEventDayOfMarketSheriffState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} may select Henchmen to remove (up to ${count} remaining)'),
            args: {
                you: '${you}',
                count: this.args.maxNumber - this.selectedHenchmenIds.length
            },
        });
    };
    FortuneEventDayOfMarketSheriffState.prototype.handleHenchmenClick = function (_a) {
        var henchman = _a.henchman;
        if (this.selectedHenchmenIds.includes(henchman.id)) {
            this.game.removeSelectedFromElement({ id: henchman.id });
            this.selectedHenchmenIds = this.selectedHenchmenIds.filter(function (id) { return id !== henchman.id; });
        }
        else {
            this.game.setElementSelected({ id: henchman.id });
            this.selectedHenchmenIds.push(henchman.id);
        }
        this.updatePageTitle();
        if (this.selectedHenchmenIds.length === this.args.maxNumber) {
            this.updateInterfaceConfirm();
        }
    };
    return FortuneEventDayOfMarketSheriffState;
}());
var FortuneEventQueenEleanorState = (function () {
    function FortuneEventQueenEleanorState(game) {
        this.game = game;
    }
    FortuneEventQueenEleanorState.prototype.onEnteringState = function (args) {
        debug('Entering FortuneEventQueenEleanorState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    FortuneEventQueenEleanorState.prototype.onLeavingState = function () {
        debug('Leaving FortuneEventQueenEleanorState');
    };
    FortuneEventQueenEleanorState.prototype.setDescription = function (activePlayerId) { };
    FortuneEventQueenEleanorState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Remove a Noble Knight from the Traveller deck to the Victims Pile?'),
            args: {
                you: '${you}',
            },
        });
        this.game.addPrimaryActionButton({
            id: 'yes_btn',
            text: _('Yes'),
            callback: function () { return _this.updateInterfaceConfirm({ removeNobleKnight: true }); },
        });
        this.game.addPrimaryActionButton({
            id: 'no_btn',
            text: _('No'),
            callback: function () { return _this.updateInterfaceConfirm({ removeNobleKnight: false }); },
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    FortuneEventQueenEleanorState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var removeNobleKnight = _a.removeNobleKnight;
        this.game.clearPossible();
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actFortuneEventQueenEleanor',
                args: {
                    removeNobleKnight: removeNobleKnight,
                },
            });
        };
        callback();
    };
    return FortuneEventQueenEleanorState;
}());
var HireState = (function () {
    function HireState(game) {
        this.game = game;
    }
    HireState.prototype.onEnteringState = function (args) {
        debug('Entering HireState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    HireState.prototype.onLeavingState = function () {
        debug('Leaving HireState');
    };
    HireState.prototype.setDescription = function (activePlayerId) { };
    HireState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: this.args.optionalAction
                ? _('${you} may select a space to Hire in')
                : _('${you} must select a space to Hire in'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args.options).forEach(function (_a) {
            var spaceId = _a[0], _b = _a[1], action = _b.action, space = _b.space, max = _b.max;
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () {
                    if (action === 'place') {
                        _this.updateIntefaceSelectNumber({ action: action, space: space, max: max });
                    }
                    else {
                        _this.updateInterfaceConfirm({ action: action, space: space });
                    }
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    HireState.prototype.updateIntefaceSelectNumber = function (_a) {
        var _this = this;
        var max = _a.max, space = _a.space, action = _a.action;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select the number of Henchmen to place'),
            args: {
                you: '${you}',
            },
        });
        var _loop_4 = function (i) {
            this_2.game.addPrimaryActionButton({
                id: "place_".concat(i, "_btn"),
                text: "".concat(i),
                callback: function () {
                    return _this.updateInterfaceConfirm({
                        count: i,
                        action: action,
                        space: space,
                    });
                },
            });
        };
        var this_2 = this;
        for (var i = 1; i <= max; i++) {
            _loop_4(i);
        }
        this.game.addCancelButton();
    };
    HireState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var _b = _a.count, count = _b === void 0 ? 0 : _b, space = _a.space, action = _a.action;
        this.game.clearPossible();
        var textMap = {
            place: _('Place ${count} Henchmen in ${spaceName}'),
            submit: _('Set ${spaceName} to Submissive?'),
        };
        this.game.clientUpdatePageTitle({
            text: textMap[action],
            args: {
                spaceName: _(space.name),
                count: count,
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actHire',
                args: {
                    spaceId: space.id,
                    count: count,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return HireState;
}());
var InspireState = (function () {
    function InspireState(game) {
        this.game = game;
    }
    InspireState.prototype.onEnteringState = function (args) {
        debug('Entering InspireState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    InspireState.prototype.onLeavingState = function () {
        debug('Leaving InspireState');
    };
    InspireState.prototype.setDescription = function (activePlayerId) { };
    InspireState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Merry Men to reveal'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.forEach(function (_a) {
            var space = _a.space, merryMan = _a.merryMan, isSubmissive = _a.isSubmissive;
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () {
                    return _this.updateInterfaceConfirm({ merryMan: merryMan, space: space, isSubmissive: isSubmissive });
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    InspireState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var merryMan = _a.merryMan, space = _a.space, isSubmissive = _a.isSubmissive;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: isSubmissive
                ? _('Reveal Merry Man and set ${spaceName} to Revolting?')
                : _('Reveal Merry Man and move Royal Favour one step towards Justice?'),
            args: {
                spaceName: _(space.name),
            },
        });
        this.game.setElementSelected({ id: merryMan.id });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actInspire',
                args: {
                    merryMenId: merryMan.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return InspireState;
}());
var MoveCarriageState = (function () {
    function MoveCarriageState(game) {
        this.game = game;
    }
    MoveCarriageState.prototype.onEnteringState = function (args) {
        debug('Entering MoveCarriageState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    MoveCarriageState.prototype.onLeavingState = function () {
        debug('Leaving MoveCarriageState');
    };
    MoveCarriageState.prototype.setDescription = function (activePlayerId) { };
    MoveCarriageState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Carriage to move'),
            args: {
                you: '${you}',
            },
        });
        this.setCarriagesSelectable();
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    MoveCarriageState.prototype.updateInterfaceSelectTo = function (_a) {
        var _this = this;
        var option = _a.option;
        if (option.to.length === 1) {
            this.updateInterfaceBringHenchman({
                carriage: option.carriage,
                to: option.to[0],
                from: option.from,
                canBringHenchman: option.canBringHenchman,
            });
            return;
        }
        this.game.clearPossible();
        this.game.setElementSelected({ id: option.carriage.id });
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to move you Carriage to'),
            args: {
                you: '${you}',
            },
        });
        option.to.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    _this.updateInterfaceBringHenchman({
                        carriage: option.carriage,
                        to: space,
                        from: option.from,
                        canBringHenchman: option.canBringHenchman,
                    });
                },
            });
        });
        this.game.addCancelButton();
    };
    MoveCarriageState.prototype.updateInterfaceBringHenchman = function (_a) {
        var _this = this;
        var carriage = _a.carriage, from = _a.from, to = _a.to, canBringHenchman = _a.canBringHenchman;
        if (!canBringHenchman) {
            this.updateInterfaceConfirm({
                carriage: carriage,
                to: to,
                from: from,
                bringHenchman: false,
            });
            return;
        }
        this.game.clearPossible();
        this.game.setElementSelected({ id: carriage.id });
        this.game.clientUpdatePageTitle({
            text: _('Bring one Henchman along with Carriage?'),
            args: {},
        });
        this.game.addPrimaryActionButton({
            id: 'yes_btn',
            text: _('Yes'),
            callback: function () {
                return _this.updateInterfaceConfirm({
                    carriage: carriage,
                    from: from,
                    to: to,
                    bringHenchman: true,
                });
            },
        });
        this.game.addPrimaryActionButton({
            id: 'no_btn',
            text: _('No'),
            callback: function () {
                return _this.updateInterfaceConfirm({
                    carriage: carriage,
                    from: from,
                    to: to,
                    bringHenchman: false,
                });
            },
        });
        this.game.addCancelButton();
    };
    MoveCarriageState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var carriage = _a.carriage, from = _a.from, to = _a.to, bringHenchman = _a.bringHenchman;
        this.game.clearPossible();
        this.game.setElementSelected({ id: carriage.id });
        this.game.clientUpdatePageTitle({
            text: bringHenchman
                ? _('Move Carriage and Henchman from ${fromName} to ${toName}?')
                : _('Move Carriage from ${fromName} to ${toName}?'),
            args: {
                fromName: _(from.name),
                toName: _(to.name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actMoveCarriage',
                args: {
                    carriageId: carriage.id,
                    bringHenchman: bringHenchman,
                    toSpaceId: to.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    MoveCarriageState.prototype.setCarriagesSelectable = function () {
        var _this = this;
        var _a;
        if (!((_a = this.args._private) === null || _a === void 0 ? void 0 : _a.options)) {
            return;
        }
        Object.entries(this.args._private.options).forEach(function (_a) {
            var carriageId = _a[0], option = _a[1];
            _this.game.setElementSelectable({
                id: carriageId,
                callback: function () {
                    _this.updateInterfaceSelectTo({
                        option: option,
                    });
                },
            });
        });
    };
    return MoveCarriageState;
}());
var MoveForcesState = (function () {
    function MoveForcesState(game) {
        this.game = game;
        this.localMoves = {};
    }
    MoveForcesState.prototype.addLocalMove = function (_a) {
        var fromSpaceId = _a.fromSpaceId, force = _a.force;
        if (this.localMoves[fromSpaceId]) {
            this.localMoves[fromSpaceId].push(force);
        }
        else {
            this.localMoves[fromSpaceId] = [force];
        }
    };
    MoveForcesState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.revertLocalMoves()];
                        case 1:
                            _a.sent();
                            this.game.onCancel();
                            return [2];
                    }
                });
            }); },
        });
    };
    MoveForcesState.prototype.revertLocalMoves = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        Object.entries(this.localMoves).forEach(function (_a) {
                            var spaceId = _a[0], forces = _a[1];
                            promises.push(_this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(spaceId)].addCards(forces.map(function (force) {
                                return __assign(__assign({}, force), { location: spaceId });
                            })));
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    return MoveForcesState;
}());
var PatrolState = (function () {
    function PatrolState(game) {
        this.selectedHenchmenIds = [];
        this.game = game;
    }
    PatrolState.prototype.onEnteringState = function (args) {
        debug('Entering PatrolState');
        this.selectedHenchmenIds = [];
        this.selectedSpace = null;
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    PatrolState.prototype.onLeavingState = function () {
        debug('Leaving PatrolState');
    };
    PatrolState.prototype.setDescription = function (activePlayerId) { };
    PatrolState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to Patrol'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args.options).forEach(function (_a) {
            var spaceId = _a[0], _b = _a[1], space = _b.space, adjacentHenchmen = _b.adjacentHenchmen;
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () {
                    _this.selectedSpace = space;
                    if (adjacentHenchmen.length > 0) {
                        _this.updateInterfaceSelectHenchmen();
                    }
                    else {
                        _this.updateInterfaceConfirm();
                    }
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    PatrolState.prototype.updateInterfaceSelectHenchmen = function () {
        var _this = this;
        var adjacentHenchmen = this.args.options[this.selectedSpace.id].adjacentHenchmen;
        if (this.selectedHenchmenIds.length === adjacentHenchmen.length ||
            adjacentHenchmen.length === 0) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select Henchmen to move to ${spaceName}'),
            args: {
                you: '${you}',
                spaceName: _(this.selectedSpace.name),
            },
        });
        adjacentHenchmen.forEach(function (henchman) {
            _this.game.setElementSelectable({
                id: henchman.id,
                callback: function () { return _this.handleHenchmenClick({ henchman: henchman }); },
            });
        });
        this.selectedHenchmenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        this.game.addCancelButton();
    };
    PatrolState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: this.selectedHenchmenIds.length > 0
                ? _('Move ${count} Henchmen to ${spaceName} and Patrol?')
                : _('Patrol in ${spaceName} without moving Henchmen?'),
            args: {
                spaceName: _(this.selectedSpace.name),
                count: this.selectedHenchmenIds.length,
            },
        });
        this.selectedHenchmenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actPatrol',
                args: {
                    spaceId: _this.selectedSpace.id,
                    henchmenIds: _this.selectedHenchmenIds,
                },
            });
        };
        this.game.addConfirmButton({
            callback: callback,
        });
        this.game.addCancelButton();
    };
    PatrolState.prototype.handleHenchmenClick = function (_a) {
        var henchman = _a.henchman;
        if (this.selectedHenchmenIds.includes(henchman.id)) {
            this.selectedHenchmenIds = this.selectedHenchmenIds.filter(function (id) { return id !== henchman.id; });
        }
        else {
            this.selectedHenchmenIds.push(henchman.id);
        }
        this.updateInterfaceSelectHenchmen();
    };
    return PatrolState;
}());
var PlaceHenchmenState = (function (_super) {
    __extends(PlaceHenchmenState, _super);
    function PlaceHenchmenState(game) {
        return _super.call(this, game) || this;
    }
    PlaceHenchmenState.prototype.onEnteringState = function (args) {
        debug('Entering PlaceHenchmenState');
        this.args = args;
        this.placedHenchmen = [];
        this.spaceId = null;
        this.updateInterfaceInitialStep();
    };
    PlaceHenchmenState.prototype.onLeavingState = function () {
        debug('Leaving PlaceHenchmenState');
    };
    PlaceHenchmenState.prototype.setDescription = function (activePlayerId) { };
    PlaceHenchmenState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        if (this.placedHenchmen.length === this.args.maxNumber) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Parish to place a Henchman in (${count} remaining)'),
            args: {
                you: '${you}',
                count: this.args.maxNumber - this.placedHenchmen.length,
            },
        });
        Object.entries(this.args.spaces)
            .filter(function (_a) {
            var spaceId = _a[0], space = _a[1];
            return _this.spaceId === null ? true : spaceId === _this.spaceId;
        })
            .forEach(function (_a) {
            var spaceId = _a[0], space = _a[1];
            return _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2, this.handlePlacement({ spaceId: spaceId })];
                }); }); },
            });
        });
        if (this.placedHenchmen.length > 0) {
            this.game.addSecondaryActionButton({
                id: 'done_btn',
                text: _('Done'),
                callback: function () { return _this.updateInterfaceConfirm(); },
            });
            this.addCancelButton();
        }
        else {
            this.game.addPassButton({
                optionalAction: this.args.optionalAction,
            });
            this.game.addUndoButtons(this.args);
        }
    };
    PlaceHenchmenState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Confirm placement?'),
            args: {},
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actPlaceHenchmen',
                args: {
                    placedHenchmen: _this.placedHenchmen.map(function (force) { return ({
                        henchmanId: force.id,
                        spaceId: force.location,
                    }); }),
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.addCancelButton();
    };
    PlaceHenchmenState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, Promise.all(this.placedHenchmen.map(function (henchman) {
                                return _this.game.forceManager.removeCard(henchman);
                            }))];
                        case 1:
                            _a.sent();
                            this.game.onCancel();
                            return [2];
                    }
                });
            }); },
        });
    };
    PlaceHenchmenState.prototype.handlePlacement = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var henchman;
            var _this = this;
            var spaceId = _b.spaceId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        henchman = this.args.henchmen.find(function (force) { return !_this.placedHenchmen.some(function (placed) { return placed.id === force.id; }); });
                        henchman.location = spaceId;
                        this.placedHenchmen.push(henchman);
                        return [4, this.game.gameMap.forces["".concat(HENCHMEN, "_").concat(spaceId)].addCard(henchman)];
                    case 1:
                        _c.sent();
                        if (this.args.conditions.includes(ONE_SPACE)) {
                            this.spaceId = spaceId;
                        }
                        this.updateInterfaceInitialStep();
                        return [2];
                }
            });
        });
    };
    return PlaceHenchmenState;
}(PlaceForcesState));
var PlaceMerryManInSpaceState = (function () {
    function PlaceMerryManInSpaceState(game) {
        this.game = game;
    }
    PlaceMerryManInSpaceState.prototype.onEnteringState = function (args) {
        debug('Entering PlaceMerryManInSpaceState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    PlaceMerryManInSpaceState.prototype.onLeavingState = function () {
        debug('Leaving PlaceMerryManInSpaceState');
    };
    PlaceMerryManInSpaceState.prototype.setDescription = function (activePlayerId) { };
    PlaceMerryManInSpaceState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to place a Merry Man in'),
            args: {
                you: '${you}',
            },
        });
        Object.values(this.args._private.spaces).forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    if (_this.args._private.robinHoodInSupply &&
                        !_this.args._private.merryMenInSupply) {
                        _this.updateInterfaceConfirm({ space: space, placeRobinHood: true });
                    }
                    else if (_this.args._private.robinHoodInSupply) {
                        _this.updateInterfacePlaceRobinHood({ space: space });
                    }
                    else {
                        _this.updateInterfaceConfirm({ space: space });
                    }
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    PlaceMerryManInSpaceState.prototype.updateInterfacePlaceRobinHood = function (_a) {
        var _this = this;
        var space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Place Robin Hood?'),
            args: {},
        });
        this.game.addPrimaryActionButton({
            id: 'yes_btn',
            text: _('Yes'),
            callback: function () {
                return _this.updateInterfaceConfirm({ space: space, placeRobinHood: true });
            },
        });
        this.game.addPrimaryActionButton({
            id: 'no_btn',
            text: _('No'),
            callback: function () {
                return _this.updateInterfaceConfirm({ space: space, placeRobinHood: false });
            },
        });
        this.game.addCancelButton();
    };
    PlaceMerryManInSpaceState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space, _b = _a.placeRobinHood, placeRobinHood = _b === void 0 ? false : _b;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: placeRobinHood
                ? _('Place Robin Hood in ${spaceName}?')
                : _('Place a Merry Man in ${spaceName}?'),
            args: {
                spaceName: _(space.name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actPlaceMerryManInSpace',
                args: {
                    spaceId: space.id,
                    placeRobinHood: placeRobinHood,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return PlaceMerryManInSpaceState;
}());
var RecruitState = (function () {
    function RecruitState(game) {
        this.game = game;
    }
    RecruitState.prototype.onEnteringState = function (args) {
        debug('Entering RecruitState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    RecruitState.prototype.onLeavingState = function () {
        debug('Leaving RecruitState');
    };
    RecruitState.prototype.setDescription = function (activePlayerId) { };
    RecruitState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a space to Recruit in'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args._private.options).forEach(function (_a) {
            var spaceId = _a[0], option = _a[1];
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () { return _this.updateInterfaceSelectOption(option); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    RecruitState.prototype.updateInterfaceSelectOption = function (_a) {
        var _this = this;
        var space = _a.space, recruitOptions = _a.recruitOptions, merryMen = _a.merryMen;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select what to Recruit'),
            args: {
                you: '${you}',
            },
        });
        this.game.setSpaceSelected({ id: space.id });
        recruitOptions.forEach(function (option) {
            _this.game.addPrimaryActionButton({
                id: "".concat(option, "_btn"),
                text: _this.getOptionName({ option: option }),
                callback: function () {
                    if (_this.args._private.robinHoodInSupply &&
                        (option === PLACE_MERRY_MAN || option === PLACE_TWO_MERRY_MEN)) {
                        _this.updateInterfaceRecruitRobinHood({
                            space: space,
                            recruitOption: option,
                        });
                    }
                    else if (option === REPLACE_MERRY_MAN_WITH_CAMP) {
                        _this.updateInterfaceSelectMerryMan({
                            space: space,
                            recruitOption: option,
                            merryMen: merryMen,
                        });
                    }
                    else {
                        _this.updateInterfaceConfirm({ space: space, recruitOption: option });
                    }
                },
            });
        });
        this.game.addCancelButton();
    };
    RecruitState.prototype.updateInterfaceRecruitRobinHood = function (_a) {
        var _this = this;
        var space = _a.space, recruitOption = _a.recruitOption;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Recruit Robin Hood?'),
            args: {
                you: '${you}',
            },
        });
        this.game.addPrimaryActionButton({
            id: 'yes_btn',
            text: _('Yes'),
            callback: function () {
                return _this.updateInterfaceConfirm({
                    space: space,
                    recruitOption: recruitOption,
                    recruitRobinHood: true,
                });
            },
        });
        this.game.addPrimaryActionButton({
            id: 'no_btn',
            text: _('No'),
            callback: function () {
                return _this.updateInterfaceConfirm({
                    space: space,
                    recruitOption: recruitOption,
                    recruitRobinHood: false,
                });
            },
        });
        this.game.addCancelButton();
    };
    RecruitState.prototype.updateInterfaceSelectMerryMan = function (_a) {
        var _this = this;
        var space = _a.space, recruitOption = _a.recruitOption, merryMen = _a.merryMen;
        if (merryMen.length === 1) {
            this.updateInterfaceConfirm({
                space: space,
                recruitOption: recruitOption,
                merryManId: merryMen[0].id,
            });
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Merry Man'),
            args: {
                you: '${you}',
            },
        });
        this.game.setSpaceSelected({ id: space.id });
        merryMen.forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () {
                    _this.updateInterfaceConfirm({
                        space: space,
                        recruitOption: recruitOption,
                        merryManId: merryMan.id,
                    });
                },
            });
        });
        this.game.addCancelButton();
    };
    RecruitState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space, recruitOption = _a.recruitOption, merryManId = _a.merryManId, recruitRobinHood = _a.recruitRobinHood;
        this.game.clearPossible();
        if (merryManId) {
            this.game.setElementSelected({ id: merryManId });
        }
        this.game.clientUpdatePageTitle({
            text: _('${recruitOption} in ${spaceName}?'),
            args: {
                recruitOption: this.getOptionName({ option: recruitOption }),
                spaceName: _(space.name),
            },
        });
        this.game.setSpaceSelected({ id: space.id });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRecruit',
                args: {
                    spaceId: space.id,
                    recruitOption: recruitOption,
                    merryManId: merryManId,
                    recruitRobinHood: recruitRobinHood,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    RecruitState.prototype.getOptionName = function (_a) {
        var option = _a.option;
        switch (option) {
            case PLACE_MERRY_MAN:
                return _('Place one Merry Man');
            case PLACE_TWO_MERRY_MEN:
                return _('Place two Merry Man');
            case REPLACE_MERRY_MAN_WITH_CAMP:
                return _('Replace one Merry Man with a Camp');
            case FLIP_ALL_MERRY_MAN_TO_HIDDEN:
                return _('Flip all Merry Men to hidden');
            default:
                return ';';
        }
    };
    return RecruitState;
}());
var RemoveCampState = (function () {
    function RemoveCampState(game) {
        this.game = game;
    }
    RemoveCampState.prototype.onEnteringState = function (args) {
        debug('Entering RemoveCampState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    RemoveCampState.prototype.onLeavingState = function () {
        debug('Leaving RemoveCampState');
    };
    RemoveCampState.prototype.setDescription = function (activePlayerId) { };
    RemoveCampState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Camp to remove'),
            args: {
                you: '${you}',
            },
        });
        var camps = [];
        this.args.camps.forEach(function (camp) {
            var selectedCamp = _this.game.gameMap.getForcePublic({
                type: CAMP,
                spaceId: camp.location,
                hidden: camp.hidden,
                exclude: camps,
            });
            camps.push(selectedCamp);
            _this.game.setElementSelectable({
                id: selectedCamp.id,
                callback: function () { return _this.updateInterfaceConfirm({ camp: selectedCamp }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    RemoveCampState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var camp = _a.camp;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Remove camp from ${spaceName}?'),
            args: {
                spaceName: _(this.game.gamedatas.spaces[camp.location].name),
            },
        });
        this.game.setElementSelected({ id: camp.id });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRemoveCamp',
                args: {
                    spaceId: camp.location,
                    hidden: camp.hidden,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return RemoveCampState;
}());
var RemoveTravellerState = (function () {
    function RemoveTravellerState(game) {
        this.game = game;
    }
    RemoveTravellerState.prototype.onEnteringState = function (args) {
        debug('Entering RemoveTravellerState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    RemoveTravellerState.prototype.onLeavingState = function () {
        debug('Leaving RemoveTravellerState');
    };
    RemoveTravellerState.prototype.setDescription = function (activePlayerId) { };
    RemoveTravellerState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.updatePageTitle();
        var camps = [];
        this.args.from.forEach(function (location) {
            _this.game.addPrimaryActionButton({
                id: "".concat(location, "_btn"),
                text: _this.getLocationName({ location: location }),
                callback: function () { return _this.updateInterfaceConfirm({ location: location }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    RemoveTravellerState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var location = _a.location;
        this.game.clearPossible();
        this.updatePageTitleConfirm({ location: location });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRemoveTraveller',
                args: {
                    from: location,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    RemoveTravellerState.prototype.updatePageTitle = function () {
        if (this.args.cardType === MONK) {
            this.game.clientUpdatePageTitle({
                text: _('${you} must choose where to remove a Monk from'),
                args: {
                    you: '${you}',
                },
            });
        }
    };
    RemoveTravellerState.prototype.updatePageTitleConfirm = function (_a) {
        var location = _a.location;
        if (this.args.cardType === MONK) {
            this.game.clientUpdatePageTitle({
                text: _('Remove a Monk from the ${locationName}'),
                args: {
                    locationName: this.getLocationName({ location: location }),
                },
            });
        }
    };
    RemoveTravellerState.prototype.getLocationName = function (_a) {
        var location = _a.location;
        switch (location) {
            case TRAVELLERS_DECK:
                return _('Travellers Deck');
            case TRAVELLERS_DISCARD:
                return _('Discard pile');
            default:
                return '';
        }
    };
    return RemoveTravellerState;
}());
var RideState = (function () {
    function RideState(game) {
        this.selectedSpace = null;
        this.selectedHenchmenIds = [];
        this.game = game;
    }
    RideState.prototype.onEnteringState = function (args) {
        debug('Entering RideState');
        this.selectedHenchmenIds = [];
        this.selectedSpace = null;
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    RideState.prototype.onLeavingState = function () {
        debug('Leaving RideState');
    };
    RideState.prototype.setDescription = function (activePlayerId) { };
    RideState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Parish to move Henchmen to'),
            args: {
                you: '${you}',
            },
        });
        this.args.spaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    _this.selectedSpace = space;
                    _this.updateInterfaceSelectHenchmen();
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    RideState.prototype.updateInterfaceSelectHenchmen = function () {
        var _this = this;
        if (this.selectedHenchmenIds.length === 4 ||
            this.selectedHenchmenIds.length === this.args.henchmen.length) {
            this.updateInterfaceConfirm();
            return;
        }
        else if (this.args.henchmen.length === 1) {
            this.selectedHenchmenIds.push(this.args.henchmen[0].id);
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select Henchmen to move to ${spaceName}'),
            args: {
                you: '${you}',
                spaceName: _(this.selectedSpace.name),
            },
        });
        this.args.henchmen.forEach(function (henchman) {
            _this.game.setElementSelectable({
                id: henchman.id,
                callback: function () { return _this.handleHenchmenClick({ henchman: henchman }); },
            });
        });
        this.selectedHenchmenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
            extraClasses: this.selectedHenchmenIds.length === 0 ? DISABLED : '',
        });
        this.game.addCancelButton();
    };
    RideState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: this.selectedHenchmenIds.length > 0
                ? _('Move ${count} Henchmen to ${spaceName} and Ride?')
                : _('Ride in ${spaceName}?'),
            args: {
                spaceName: _(this.selectedSpace.name),
                count: this.selectedHenchmenIds.length,
            },
        });
        this.selectedHenchmenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRide',
                args: {
                    spaceId: _this.selectedSpace.id,
                    henchmenIds: _this.selectedHenchmenIds,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    RideState.prototype.handleHenchmenClick = function (_a) {
        var henchman = _a.henchman;
        if (this.selectedHenchmenIds.includes(henchman.id)) {
            this.selectedHenchmenIds = this.selectedHenchmenIds.filter(function (id) { return id !== henchman.id; });
        }
        else {
            this.selectedHenchmenIds.push(henchman.id);
        }
        this.updateInterfaceSelectHenchmen();
    };
    return RideState;
}());
var RobState = (function () {
    function RobState(game) {
        this.selectedMerryMenIds = [];
        this.game = game;
    }
    RobState.prototype.onEnteringState = function (args) {
        debug('Entering RobState');
        this.args = args;
        this.selectedMerryMenIds = [];
        this.updateInterfaceInitialStep();
    };
    RobState.prototype.onLeavingState = function () {
        debug('Leaving RobState');
    };
    RobState.prototype.setDescription = function (activePlayerId) { };
    RobState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to Rob'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args._private.options).forEach(function (_a) {
            var spaceId = _a[0], option = _a[1];
            return _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () { return _this.updateInterfaceSelectTarget({ option: option }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    RobState.prototype.updateInterfaceSelectTarget = function (_a) {
        var _this = this;
        var option = _a.option;
        this.game.clearPossible();
        var targets = this.getTargets({ option: option });
        if (targets.length === 1) {
            this.updateInterfaceSelectMerryMen({
                space: option.space,
                target: targets[0],
                merryMen: option.merryMen,
            });
            return;
        }
        this.game.setSpaceSelected({ id: option.space.id });
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a target'),
            args: {
                you: '${you}',
            },
        });
        targets.forEach(function (target) {
            _this.game.addPrimaryActionButton({
                id: "".concat(target, "_btn"),
                text: _(_this.getTargetName({ target: target })),
                callback: function () {
                    return _this.updateInterfaceSelectMerryMen({
                        space: option.space,
                        target: target,
                        merryMen: option.merryMen,
                    });
                },
            });
        });
        this.game.addCancelButton();
    };
    RobState.prototype.updateInterfaceSelectMerryMen = function (_a) {
        var _this = this;
        var space = _a.space, target = _a.target, merryMen = _a.merryMen;
        this.game.clearPossible();
        if (merryMen.length === 1) {
            this.selectedMerryMenIds.push(merryMen[0].id);
            this.updateInterfaceConfirm({
                space: space,
                target: target,
            });
            return;
        }
        this.game.setSpaceSelected({ id: space.id });
        this.game.clientUpdatePageTitle({
            text: _('${you} must select Merry Men to Rob with'),
            args: {
                you: '${you}',
            },
        });
        merryMen.forEach(function (merryMan) {
            return _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () { return _this.handleMerryManClick({ merryMan: merryMan }); },
            });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm({ space: space, target: target }); },
            extraClasses: DISABLED,
        });
        this.game.addSecondaryActionButton({
            id: 'select_all_btn',
            text: _('Select all'),
            callback: function () {
                _this.selectedMerryMenIds = merryMen.map(function (merryMan) { return merryMan.id; });
                _this.updateInterfaceConfirm({ space: space, target: target });
            },
        });
        this.game.addCancelButton();
    };
    RobState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space, target = _a.target;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Rob ${target} in ${spaceName} with ${count} Merry Men?'),
            args: {
                spaceName: _(space.name),
                target: this.getTargetName({ target: target }),
                count: this.selectedMerryMenIds.length,
            },
        });
        this.selectedMerryMenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRob',
                args: {
                    target: target,
                    spaceId: space.id,
                    merryMenIds: _this.selectedMerryMenIds,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    RobState.prototype.getTargets = function (_a) {
        var option = _a.option;
        var targets = [];
        if (option.treasury) {
            targets.push('treasury');
        }
        if (option.traveller) {
            targets.push('traveller');
        }
        Object.entries(option.carriages).forEach(function (_a) {
            var type = _a[0], count = _a[1];
            if (count > 0) {
                targets.push(type);
            }
        });
        return targets;
    };
    RobState.prototype.getTargetName = function (_a) {
        var target = _a.target;
        switch (target) {
            case 'treasury':
                return _("the Sheriff's Treasury");
            case 'traveller':
                return _('a random Traveller');
                return;
            case 'HiddenCarriage':
            case 'TallageCarriage':
            case 'TrapCarriage':
            case 'TributeCarriage':
                return _(target);
        }
    };
    RobState.prototype.handleMerryManClick = function (_a) {
        var merryMan = _a.merryMan;
        if (this.selectedMerryMenIds.includes(merryMan.id)) {
            this.game.removeSelectedFromElement({ id: merryMan.id });
            this.selectedMerryMenIds = this.selectedMerryMenIds.filter(function (id) { return id !== merryMan.id; });
            if (this.selectedMerryMenIds.length === 0) {
                document.getElementById('done_btn').classList.add(DISABLED);
            }
        }
        else {
            this.game.setElementSelected({ id: merryMan.id });
            this.selectedMerryMenIds.push(merryMan.id);
            document.getElementById('done_btn').classList.remove(DISABLED);
        }
    };
    return RobState;
}());
var RoyalInspectionPlaceRobinHoodState = (function () {
    function RoyalInspectionPlaceRobinHoodState(game) {
        this.game = game;
    }
    RoyalInspectionPlaceRobinHoodState.prototype.onEnteringState = function (args) {
        debug('Entering RoyalInspectionPlaceRobinHoodState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    RoyalInspectionPlaceRobinHoodState.prototype.onLeavingState = function () {
        debug('Leaving RoyalInspectionPlaceRobinHoodState');
    };
    RoyalInspectionPlaceRobinHoodState.prototype.setDescription = function (activePlayerId) { };
    RoyalInspectionPlaceRobinHoodState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Forest to place Robin Hood in'),
            args: {
                you: '${you}',
            },
        });
        Object.values(this.args._private.spaces).forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    _this.updateInterfaceConfirm({ space: space });
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    RoyalInspectionPlaceRobinHoodState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space, _b = _a.placeRobinHood, placeRobinHood = _b === void 0 ? false : _b;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Place Robin Hood in ${spaceName}?'),
            args: {
                spaceName: _(space.name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRoyalInspectionPlaceRobinHood',
                args: {
                    spaceId: space.id,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return RoyalInspectionPlaceRobinHoodState;
}());
var RoyalInspectionRedeploymentRobinHoodState = (function () {
    function RoyalInspectionRedeploymentRobinHoodState(game) {
        this.game = game;
    }
    RoyalInspectionRedeploymentRobinHoodState.prototype.onEnteringState = function (args) {
        var _this = this;
        debug('Entering RoyalInspectionRedeploymentRobinHoodState');
        this.args = args;
        this.localMoves = {};
        this.optionalMoves = {};
        Object.keys(this.args._private.merryMenMayMove).forEach(function (key) {
            _this.optionalMoves[key] = null;
        });
        this.requiredMoves = {};
        Object.keys(this.args._private.merryMenMustMove).forEach(function (key) {
            _this.requiredMoves[key] = null;
        });
        this.updateInterfaceInitialStep();
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.onLeavingState = function () {
        debug('Leaving RoyalInspectionRedeploymentRobinHoodState');
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.setDescription = function (activePlayerId, args) {
        if (args.source === 'Event14_TemporaryTruce') {
            this.game.clientUpdatePageTitle({
                text: _('${actplayer} may move all Merry Men to Camps or Forests'),
                args: {
                    actplayer: '${actplayer}',
                },
                nonActivePlayers: true,
            });
        }
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        if (!Object.values(this.requiredMoves).some(function (dest) { return dest === null; })) {
            this.updateInterfaceOptionalMoves();
            return;
        }
        this.updatePageTitle();
        Object.entries(this.args._private.merryMenMustMove).forEach(function (_a) {
            var merryManId = _a[0], option = _a[1];
            if (_this.requiredMoves[merryManId] !== null) {
                return;
            }
            _this.game.setElementSelectable({
                id: merryManId,
                callback: function () { return _this.updateInterfaceSelectDestination({ option: option }); },
            });
        });
        if (Object.values(this.requiredMoves).some(function (dest) { return dest !== null; })) {
            this.addCancelButton();
        }
        else {
            this.game.addPassButton({
                optionalAction: this.args.optionalAction,
            });
            this.game.addUndoButtons(this.args);
        }
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.updateInterfaceSelectDestination = function (_a) {
        var _this = this;
        var option = _a.option, _b = _a.optionalMove, optionalMove = _b === void 0 ? false : _b;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to move your Merry Man to'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: option.merryMan.id });
        option.spaceIds.forEach(function (spaceId) {
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () { return __awaiter(_this, void 0, void 0, function () {
                    var merryMan;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (optionalMove) {
                                    this.optionalMoves[option.merryMan.id] = spaceId;
                                }
                                else {
                                    this.requiredMoves[option.merryMan.id] = spaceId;
                                }
                                merryMan = option.merryMan;
                                this.addLocalMove({
                                    fromSpaceId: merryMan.location,
                                    force: merryMan,
                                });
                                merryMan.location = spaceId;
                                return [4, this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(spaceId)].addCard(merryMan)];
                            case 1:
                                _a.sent();
                                if (optionalMove) {
                                    this.updateInterfaceOptionalMoves();
                                }
                                else {
                                    this.updateInterfaceInitialStep();
                                }
                                return [2];
                        }
                    });
                }); },
            });
        });
        this.addCancelButton();
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.updateInterfaceOptionalMoves = function () {
        var _this = this;
        this.game.clearPossible();
        if (!Object.values(this.optionalMoves).some(function (dest) { return dest === null; })) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clientUpdatePageTitle({
            text: _('${you} may select other Merry Man to move to a Forest or a Parish with a Camp'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args._private.merryMenMayMove).forEach(function (_a) {
            var merryManId = _a[0], option = _a[1];
            if (_this.optionalMoves[merryManId] !== null) {
                return;
            }
            _this.game.setElementSelectable({
                id: merryManId,
                callback: function () {
                    return _this.updateInterfaceSelectDestination({
                        option: option,
                        optionalMove: true,
                    });
                },
            });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        this.addCancelButton();
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Confirm moves?'),
            args: {},
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRoyalInspectionRedeploymentRobinHood',
                args: {
                    requiredMoves: _this.requiredMoves,
                    optionalMoves: _this.optionalMoves,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.addCancelButton();
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.addLocalMove = function (_a) {
        var fromSpaceId = _a.fromSpaceId, force = _a.force;
        if (this.localMoves[fromSpaceId]) {
            this.localMoves[fromSpaceId].push(force);
        }
        else {
            this.localMoves[fromSpaceId] = [force];
        }
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.revertLocalMoves()];
                        case 1:
                            _a.sent();
                            this.game.onCancel();
                            return [2];
                    }
                });
            }); },
        });
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.revertLocalMoves = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        Object.entries(this.localMoves).forEach(function (_a) {
                            var spaceId = _a[0], forces = _a[1];
                            promises.push(_this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(spaceId)].addCards(forces.map(function (force) {
                                return __assign(__assign({}, force), { location: spaceId });
                            })));
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    RoyalInspectionRedeploymentRobinHoodState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Merry Man to move'),
            args: {
                you: '${you}',
            },
        });
    };
    return RoyalInspectionRedeploymentRobinHoodState;
}());
var RoyalInspectionRedeploymentSheriffState = (function () {
    function RoyalInspectionRedeploymentSheriffState(game) {
        this.game = game;
    }
    RoyalInspectionRedeploymentSheriffState.prototype.onEnteringState = function (args) {
        var _this = this;
        debug('Entering RoyalInspectionRedeploymentSheriffState');
        this.args = args;
        this.optionalMoves = {};
        this.localMoves = {};
        Object.keys(this.args.henchmenMayMove).forEach(function (key) {
            _this.optionalMoves[key] = null;
        });
        this.requiredMoves = {};
        Object.keys(this.args.henchmenMustMove).forEach(function (key) {
            _this.requiredMoves[key] = null;
        });
        this.updateInterfaceInitialStep();
    };
    RoyalInspectionRedeploymentSheriffState.prototype.onLeavingState = function () {
        debug('Leaving RoyalInspectionRedeploymentSheriffState');
    };
    RoyalInspectionRedeploymentSheriffState.prototype.setDescription = function (activePlayerId, args) {
        if (args.source === 'Event14_TemporaryTruce') {
            this.game.clientUpdatePageTitle({
                text: _('${actplayer} may move all Henchmen to Submissive spaces'),
                args: {
                    actplayer: '${actplayer}',
                },
                nonActivePlayers: true,
            });
        }
    };
    RoyalInspectionRedeploymentSheriffState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        if (!Object.values(this.requiredMoves).some(function (dest) { return dest === null; })) {
            this.updateInterfaceOptionalMoves();
            return;
        }
        this.updatePageTitle();
        Object.entries(this.args.henchmenMustMove).forEach(function (_a) {
            var henchmanId = _a[0], option = _a[1];
            if (_this.requiredMoves[henchmanId] !== null) {
                return;
            }
            _this.game.setElementSelectable({
                id: henchmanId,
                callback: function () { return _this.updateInterfaceSelectDestination({ option: option }); },
            });
        });
        if (Object.values(this.requiredMoves).some(function (dest) { return dest !== null; })) {
            this.addCancelButton();
        }
        else {
            this.game.addPassButton({
                optionalAction: this.args.optionalAction,
            });
            this.game.addUndoButtons(this.args);
        }
    };
    RoyalInspectionRedeploymentSheriffState.prototype.updateInterfaceSelectDestination = function (_a) {
        var _this = this;
        var option = _a.option, _b = _a.optionalMove, optionalMove = _b === void 0 ? false : _b;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to move your Henchman to'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: option.henchman.id });
        option.spaceIds.forEach(function (spaceId) {
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2, this.handleDestinationSelected({ option: option, spaceId: spaceId, optionalMove: optionalMove })];
                }); }); },
            });
        });
        this.addCancelButton();
    };
    RoyalInspectionRedeploymentSheriffState.prototype.updateInterfaceOptionalMoves = function () {
        var _this = this;
        this.game.clearPossible();
        if (!Object.values(this.optionalMoves).some(function (dest) { return dest === null; })) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clientUpdatePageTitle({
            text: this.args.source === 'Event14_TemporaryTruce'
                ? _('${you} may select other Henchmen to move to Submissive Spaces')
                : _('${you} may select other Henchmen to move to Nottingham'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args.henchmenMayMove).forEach(function (_a) {
            var henchmanId = _a[0], option = _a[1];
            if (_this.optionalMoves[henchmanId] !== null) {
                return;
            }
            _this.game.setElementSelectable({
                id: henchmanId,
                callback: function () {
                    if (option.spaceIds.length === 1) {
                        _this.handleDestinationSelected({
                            option: option,
                            optionalMove: true,
                            spaceId: option.spaceIds[0],
                        });
                    }
                    else {
                        _this.updateInterfaceSelectDestination({
                            option: option,
                            optionalMove: true,
                        });
                    }
                },
            });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        this.addCancelButton();
    };
    RoyalInspectionRedeploymentSheriffState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Confirm moves?'),
            args: {},
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRoyalInspectionRedeploymentSheriff',
                args: {
                    requiredMoves: _this.requiredMoves,
                    optionalMoves: _this.optionalMoves,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.addCancelButton();
    };
    RoyalInspectionRedeploymentSheriffState.prototype.addLocalMove = function (_a) {
        var fromSpaceId = _a.fromSpaceId, force = _a.force;
        if (this.localMoves[fromSpaceId]) {
            this.localMoves[fromSpaceId].push(force);
        }
        else {
            this.localMoves[fromSpaceId] = [force];
        }
    };
    RoyalInspectionRedeploymentSheriffState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.revertLocalMoves()];
                        case 1:
                            _a.sent();
                            this.game.onCancel();
                            return [2];
                    }
                });
            }); },
        });
    };
    RoyalInspectionRedeploymentSheriffState.prototype.revertLocalMoves = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        Object.entries(this.localMoves).forEach(function (_a) {
                            var spaceId = _a[0], forces = _a[1];
                            promises.push(_this.game.gameMap.forces["".concat(HENCHMEN, "_").concat(spaceId)].addCards(forces.map(function (force) {
                                return __assign(__assign({}, force), { location: spaceId });
                            })));
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    RoyalInspectionRedeploymentSheriffState.prototype.handleDestinationSelected = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var henchman;
            var optionalMove = _b.optionalMove, spaceId = _b.spaceId, option = _b.option;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (optionalMove) {
                            this.optionalMoves[option.henchman.id] = spaceId;
                        }
                        else {
                            this.requiredMoves[option.henchman.id] = spaceId;
                        }
                        henchman = option.henchman;
                        this.addLocalMove({
                            fromSpaceId: henchman.location,
                            force: henchman,
                        });
                        henchman.location = spaceId;
                        return [4, this.game.gameMap.forces["".concat(HENCHMEN, "_").concat(spaceId)].addCard(henchman)];
                    case 1:
                        _c.sent();
                        if (optionalMove) {
                            this.updateInterfaceOptionalMoves();
                        }
                        else {
                            this.updateInterfaceInitialStep();
                        }
                        return [2];
                }
            });
        });
    };
    RoyalInspectionRedeploymentSheriffState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Henchman to move'),
            args: {
                you: '${you}',
            },
        });
    };
    return RoyalInspectionRedeploymentSheriffState;
}());
var RoyalInspectionReturnMerryMenFromPrisonState = (function () {
    function RoyalInspectionReturnMerryMenFromPrisonState(game) {
        this.selectedMerryMenIds = [];
        this.game = game;
    }
    RoyalInspectionReturnMerryMenFromPrisonState.prototype.onEnteringState = function (args) {
        debug('Entering RoyalInspectionReturnMerryMenFromPrisonState');
        this.args = args;
        this.selectedMerryMenIds = [];
        this.updateInterfaceInitialStep();
    };
    RoyalInspectionReturnMerryMenFromPrisonState.prototype.onLeavingState = function () {
        debug('Leaving RoyalInspectionReturnMerryMenFromPrisonState');
    };
    RoyalInspectionReturnMerryMenFromPrisonState.prototype.setDescription = function (activePlayerId) { };
    RoyalInspectionReturnMerryMenFromPrisonState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.updatePageTitle();
        this.args._private.merryMen.forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () { return _this.handleMerryManClick({ merryMan: merryMan }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    RoyalInspectionReturnMerryMenFromPrisonState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Return ${count} Merry Men to Available Forces?'),
            args: {
                count: this.selectedMerryMenIds.length,
            },
        });
        this.selectedMerryMenIds.forEach(function (id) {
            return _this.game.setElementSelected({ id: id });
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRoyalInspectionReturnMerryMenFromPrison',
                args: {
                    merryManIds: _this.selectedMerryMenIds,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    RoyalInspectionReturnMerryMenFromPrisonState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} must select Merry Men to return to Available Forces (${count} remaining)'),
            args: {
                you: '${you}',
                count: this.args._private.numberToReturn - this.selectedMerryMenIds.length,
            },
        });
    };
    RoyalInspectionReturnMerryMenFromPrisonState.prototype.handleMerryManClick = function (_a) {
        var merryMan = _a.merryMan;
        if (this.selectedMerryMenIds.includes(merryMan.id)) {
            this.game.removeSelectedFromElement({ id: merryMan.id });
            this.selectedMerryMenIds = this.selectedMerryMenIds.filter(function (id) { return id !== merryMan.id; });
        }
        else {
            this.game.setElementSelected({ id: merryMan.id });
            this.selectedMerryMenIds.push(merryMan.id);
        }
        if (this.selectedMerryMenIds.length === this.args._private.numberToReturn) {
            this.updateInterfaceConfirm();
        }
    };
    return RoyalInspectionReturnMerryMenFromPrisonState;
}());
var RoyalInspectionSwapRobinHoodState = (function () {
    function RoyalInspectionSwapRobinHoodState(game) {
        this.game = game;
    }
    RoyalInspectionSwapRobinHoodState.prototype.onEnteringState = function (args) {
        debug('Entering RoyalInspectionSwapRobinHoodState');
        this.args = args;
        this.localMoves = {};
        this.updateInterfaceInitialStep();
    };
    RoyalInspectionSwapRobinHoodState.prototype.onLeavingState = function () {
        debug('Leaving RoyalInspectionSwapRobinHoodState');
    };
    RoyalInspectionSwapRobinHoodState.prototype.setDescription = function (activePlayerId) { };
    RoyalInspectionSwapRobinHoodState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may select a Merry Man to swap with Robin Hood'),
            args: {
                you: '${you}',
            },
        });
        Object.values(this.args._private.merryMen).forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () { return __awaiter(_this, void 0, void 0, function () {
                    var robinHood, currentRobinHoodLocation, currentMerryManLocation;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                robinHood = this.args._private.robinHood;
                                currentRobinHoodLocation = robinHood.location;
                                currentMerryManLocation = merryMan.location;
                                merryMan.location = currentRobinHoodLocation;
                                robinHood.location = currentMerryManLocation;
                                return [4, Promise.all([
                                        this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(merryMan.location)].addCard(merryMan),
                                        this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(robinHood.location)].addCard(robinHood),
                                    ])];
                            case 1:
                                _a.sent();
                                this.addLocalMove({
                                    fromSpaceId: currentRobinHoodLocation,
                                    force: robinHood,
                                });
                                this.addLocalMove({
                                    fromSpaceId: currentMerryManLocation,
                                    force: merryMan,
                                });
                                this.updateInterfaceConfirm({ merryManId: merryMan.id });
                                return [2];
                        }
                    });
                }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    RoyalInspectionSwapRobinHoodState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var merryManId = _a.merryManId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Confirm swap?'),
            args: {},
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actRoyalInspectionSwapRobinHood',
                args: {
                    merryManId: merryManId,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.addCancelButton();
    };
    RoyalInspectionSwapRobinHoodState.prototype.addLocalMove = function (_a) {
        var fromSpaceId = _a.fromSpaceId, force = _a.force;
        if (this.localMoves[fromSpaceId]) {
            this.localMoves[fromSpaceId].push(force);
        }
        else {
            this.localMoves[fromSpaceId] = [force];
        }
    };
    RoyalInspectionSwapRobinHoodState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.revertLocalMoves()];
                        case 1:
                            _a.sent();
                            this.game.onCancel();
                            return [2];
                    }
                });
            }); },
        });
    };
    RoyalInspectionSwapRobinHoodState.prototype.revertLocalMoves = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        Object.entries(this.localMoves).forEach(function (_a) {
                            var spaceId = _a[0], forces = _a[1];
                            promises.push(_this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(spaceId)].addCards(forces.map(function (force) {
                                return __assign(__assign({}, force), { location: spaceId });
                            })));
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    return RoyalInspectionSwapRobinHoodState;
}());
var SelectDeedState = (function () {
    function SelectDeedState(game) {
        this.game = game;
    }
    SelectDeedState.prototype.onEnteringState = function (args) {
        debug('Entering SelectDeedState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    SelectDeedState.prototype.onLeavingState = function () {
        debug('Leaving SelectDeedState');
    };
    SelectDeedState.prototype.setDescription = function (activePlayerId) { };
    SelectDeedState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Deed'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args._private.options).forEach(function (_a) {
            var deedId = _a[0], name = _a[1];
            _this.game.addPrimaryActionButton({
                id: "".concat(deedId, "_btn"),
                text: _(name),
                callback: function () {
                    _this.updateInterfaceConfirm({ deedId: deedId, name: name });
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    SelectDeedState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var deedId = _a.deedId, name = _a.name;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Perform ${deedName}?'),
            args: {
                deedName: _(name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actSelectDeed',
                args: {
                    deedId: deedId,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return SelectDeedState;
}());
var SelectEventEffectState = (function () {
    function SelectEventEffectState(game) {
        this.game = game;
    }
    SelectEventEffectState.prototype.onEnteringState = function (args) {
        debug('Entering SelectEventEffectState');
        this.args = args;
        this.staticData = this.game.getStaticCardData({
            cardId: this.args.card.id,
        });
        this.updateInterfaceInitialStep();
    };
    SelectEventEffectState.prototype.onLeavingState = function () {
        debug('Leaving SelectEventEffectState');
    };
    SelectEventEffectState.prototype.setDescription = function (activePlayerId) { };
    SelectEventEffectState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select which effect on the current Event card to execute'),
            args: {
                you: '${you}',
            },
        });
        this.addOptionButtons();
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    SelectEventEffectState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var effect = _a.effect;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Execute ${option}?'),
            args: {
                option: effect === 'light'
                    ? _(this.staticData.titleLight)
                    : _(this.staticData.titleDark),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actSelectEventEffect',
                args: {
                    effect: effect,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    SelectEventEffectState.prototype.addOptionButtons = function () {
        var _this = this;
        if (this.staticData.titleLight && this.args.canPerformLightEffect) {
            this.game.addPrimaryActionButton({
                id: "light_option_btn",
                text: _(this.staticData.titleLight),
                callback: function () { return _this.updateInterfaceConfirm({ effect: 'light' }); },
            });
        }
        if (this.staticData.titleDark && this.args.canPerformDarkEffect) {
            this.game.addPrimaryActionButton({
                id: "darkt_option_btn",
                text: _(this.staticData.titleDark),
                callback: function () { return _this.updateInterfaceConfirm({ effect: 'dark' }); },
            });
        }
    };
    return SelectEventEffectState;
}());
var SelectPlotState = (function () {
    function SelectPlotState(game) {
        this.game = game;
    }
    SelectPlotState.prototype.onEnteringState = function (args) {
        debug('Entering SelectPlotState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    SelectPlotState.prototype.onLeavingState = function () {
        debug('Leaving SelectPlotState');
    };
    SelectPlotState.prototype.setDescription = function (activePlayerId) { };
    SelectPlotState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: this.args.extraOptionId
                ? _('${you} must select a Plot')
                : _('${you} must select an option'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args.options).forEach(function (_a) {
            var plotId = _a[0], plotName = _a[1];
            _this.game.addPrimaryActionButton({
                id: "".concat(plotId, "_btn"),
                text: _(plotName),
                callback: function () { return _this.updateInterfaceConfirm({ plotId: plotId, plotName: plotName }); },
            });
        });
        if (this.args.extraOptionId) {
            this.addExtraOptionButton();
        }
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
            text: _('Skip Plot')
        });
        this.game.addUndoButtons(this.args);
    };
    SelectPlotState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var plotId = _a.plotId, plotName = _a.plotName, extraOptionId = _a.extraOptionId;
        this.game.clearPossible();
        if (plotId) {
            this.game.clientUpdatePageTitle({
                text: _('Perform ${plotName} Plot?'),
                args: {
                    plotName: _(plotName),
                },
            });
        }
        else if (extraOptionId) {
            this.game.clientUpdatePageTitle({
                text: _('${extraOptionText}?'),
                args: {
                    extraOptionText: _(this.getExtraOptionText({ extraOptionId: extraOptionId })),
                },
            });
        }
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actSelectPlot',
                args: {
                    plotId: plotId,
                    extraOptionId: extraOptionId,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    SelectPlotState.prototype.getExtraOptionText = function (_a) {
        var extraOptionId = _a.extraOptionId;
        switch (extraOptionId) {
            case GAIN_TWO_SHILLINGS:
                return _('Gain 2 Shillings');
        }
    };
    SelectPlotState.prototype.addExtraOptionButton = function () {
        var _this = this;
        var extraOptionId = this.args.extraOptionId;
        switch (extraOptionId) {
            case GAIN_TWO_SHILLINGS:
                this.game.addPrimaryActionButton({
                    id: "extraOp_btn",
                    text: _(this.getExtraOptionText({ extraOptionId: extraOptionId })),
                    callback: function () { return _this.updateInterfaceConfirm({ extraOptionId: extraOptionId }); },
                });
                break;
        }
    };
    return SelectPlotState;
}());
var SelectTravellerCardOptionState = (function () {
    function SelectTravellerCardOptionState(game) {
        this.game = game;
    }
    SelectTravellerCardOptionState.prototype.onEnteringState = function (args) {
        debug('Entering SelectTravellerCardOptionState');
        this.args = args;
        this.staticData = this.game.getStaticCardData({
            cardId: this.args.card.id,
        });
        this.updateInterfaceInitialStep();
    };
    SelectTravellerCardOptionState.prototype.onLeavingState = function () {
        debug('Leaving SelectTravellerCardOptionState');
    };
    SelectTravellerCardOptionState.prototype.setDescription = function (activePlayerId) { };
    SelectTravellerCardOptionState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select one of the options on the Traveller card'),
            args: {
                you: '${you}',
            },
        });
        this.addOptionButtons();
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    SelectTravellerCardOptionState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var option = _a.option;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Select ${option}?'),
            args: {
                option: option === 'light'
                    ? _(this.staticData.titleLight)
                    : _(this.staticData.titleDark),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actSelectTravellerCardOption',
                args: {
                    option: option,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    SelectTravellerCardOptionState.prototype.addOptionButtons = function () {
        var _this = this;
        if (this.staticData.titleLight && this.args.lightOptionAvailable) {
            this.game.addPrimaryActionButton({
                id: "light_option_btn",
                text: _(this.staticData.titleLight),
                callback: function () { return _this.updateInterfaceConfirm({ option: 'light' }); },
            });
        }
        if (this.staticData.titleDark && this.args.darkOptionAvailable) {
            this.game.addPrimaryActionButton({
                id: "darkt_option_btn",
                text: _(this.staticData.titleDark),
                callback: function () { return _this.updateInterfaceConfirm({ option: 'dark' }); },
            });
        }
    };
    return SelectTravellerCardOptionState;
}());
var SetupRobinHoodState = (function () {
    function SetupRobinHoodState(game) {
        this.robinHood = null;
        this.merryMen = [];
        this.game = game;
    }
    SetupRobinHoodState.prototype.onEnteringState = function (args) {
        debug('Entering SetupRobinHoodState');
        this.args = args;
        this.robinHood = null;
        this.merryMen = [];
        this.updateInterfaceInitialStep();
    };
    SetupRobinHoodState.prototype.onLeavingState = function () {
        debug('Leaving SetupRobinHoodState');
    };
    SetupRobinHoodState.prototype.setDescription = function (activePlayerId) { };
    SetupRobinHoodState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to place Robin Hood'),
            args: {
                you: '${you}',
            },
        });
        this.setSpacesSelectable();
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    SetupRobinHoodState.prototype.updateInterfacePlaceMerryMen = function () {
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to place a Merry Man'),
            args: {
                you: '${you}',
            },
        });
        this.setSpacesSelectable();
        this.addCancelButton();
    };
    SetupRobinHoodState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Place Robin Hood and Merry Men?'),
            args: {},
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actSetupRobinHood',
                args: {
                    robinHood: _this.robinHood.location,
                    merryMen: _this.merryMen.map(function (force) { return ({
                        id: force.id,
                        location: force.location,
                    }); }),
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.addCancelButton();
    };
    SetupRobinHoodState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addCancelButton({
            callback: function () {
                var rhPlayer = _this.game.playerManager.getRobinHoodPlayer();
                if (_this.robinHood) {
                    _this.game.forceManager.removeCard(_this.robinHood);
                    rhPlayer.counters.RobinHood[ROBIN_HOOD].incValue(1);
                }
                _this.merryMen.forEach(function (merryMan) {
                    _this.game.forceManager.removeCard(merryMan);
                    rhPlayer.counters.RobinHood[MERRY_MEN].incValue(1);
                });
                _this.game.onCancel();
            },
        });
    };
    SetupRobinHoodState.prototype.setSpacesSelectable = function () {
        var _this = this;
        [SHIRE_WOOD, SOUTHWELL_FOREST, REMSTON].forEach(function (spaceId) {
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () { return _this.handleButtonClick(spaceId); },
            });
        });
    };
    SetupRobinHoodState.prototype.handleButtonClick = function (spaceId) {
        var _this = this;
        var rhPlayer = this.game.playerManager.getRobinHoodPlayer();
        if (this.robinHood === null) {
            var robinHood = this.args._private.robinHood;
            robinHood.location = spaceId;
            rhPlayer.counters.RobinHood[ROBIN_HOOD].incValue(-1);
            this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(spaceId)].addCard(robinHood);
            this.robinHood = robinHood;
        }
        else {
            var merryMan = this.args._private.merryMen.find(function (force) {
                return !_this.merryMen.some(function (placedMerryMan) { return placedMerryMan.id === force.id; });
            });
            merryMan.location = spaceId;
            rhPlayer.counters.RobinHood[MERRY_MEN].incValue(-1);
            this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(spaceId)].addCard(merryMan);
            this.merryMen.push(merryMan);
        }
        if (this.merryMen.length >= 3) {
            this.updateInterfaceConfirm();
        }
        else {
            this.updateInterfacePlaceMerryMen();
        }
    };
    return SetupRobinHoodState;
}());
var SneakState = (function (_super) {
    __extends(SneakState, _super);
    function SneakState(game) {
        var _this = _super.call(this, game) || this;
        _this.selectedOption = null;
        return _this;
    }
    SneakState.prototype.onEnteringState = function (args) {
        debug('Entering SneakState');
        this.args = args;
        this.selectedOption = null;
        this.moves = {};
        this.localMoves = {};
        this.updateInterfaceInitialStep();
    };
    SneakState.prototype.onLeavingState = function () {
        debug('Leaving SneakState');
    };
    SneakState.prototype.setDescription = function (activePlayerId) { };
    SneakState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a space to move Merry Men from'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args._private.options).forEach(function (_a) {
            var spaceId = _a[0], option = _a[1];
            _this.game.setSpaceSelectable({
                id: spaceId,
                callback: function () {
                    _this.selectedOption = option;
                    _this.udpateInterfaceSelectMerryMan();
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    SneakState.prototype.udpateInterfaceSelectMerryMan = function () {
        var _this = this;
        this.game.clearPossible();
        var movedMerryMen = Object.values(this.moves).flat();
        if (movedMerryMen.length === this.selectedOption.merryMen.length) {
            this.updateInterfaceConfirm();
            return;
        }
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Merry Man to move'),
            args: {
                you: '${you}',
            },
        });
        this.selectedOption.merryMen
            .filter(function (merryMan) { return !movedMerryMen.includes(merryMan.id); })
            .forEach(function (merryMan) {
            _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () { return _this.updateInterfaceSelectAdjacentSpace({ merryMan: merryMan }); },
            });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
            extraClasses: movedMerryMen.length === 0 ? DISABLED : '',
        });
        this.addCancelButton();
    };
    SneakState.prototype.updateInterfaceSelectAdjacentSpace = function (_a) {
        var _this = this;
        var merryMan = _a.merryMan;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select an adjacent space to move your Merry Man to'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: merryMan.id });
        this.selectedOption.adjacentSpaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () { return __awaiter(_this, void 0, void 0, function () {
                    var fromSpaceId;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                fromSpaceId = merryMan.location;
                                merryMan.location = space.id;
                                this.addLocalMove({ force: merryMan, fromSpaceId: fromSpaceId });
                                if (this.moves[space.id]) {
                                    this.moves[space.id].push(merryMan.id);
                                }
                                else {
                                    this.moves[space.id] = [merryMan.id];
                                }
                                return [4, this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(space.id)].addCard(merryMan)];
                            case 1:
                                _a.sent();
                                this.udpateInterfaceSelectMerryMan();
                                return [2];
                        }
                    });
                }); },
            });
        });
        this.addCancelButton();
    };
    SneakState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Confirm moves?'),
            args: {},
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actSneak',
                args: {
                    spaceId: _this.selectedOption.space.id,
                    moves: _this.moves,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.addCancelButton();
    };
    return SneakState;
}(MoveForcesState));
var SwashbuckleState = (function () {
    function SwashbuckleState(game) {
        this.game = game;
    }
    SwashbuckleState.prototype.onEnteringState = function (args) {
        debug('Entering SwashbuckleState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    SwashbuckleState.prototype.onLeavingState = function () {
        debug('Leaving SwashbuckleState');
    };
    SwashbuckleState.prototype.setDescription = function (activePlayerId) { };
    SwashbuckleState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        if (this.args._private.length === 1) {
            this.updateInterfaceSelectRobinHoodDestination(this.args._private[0]);
            return;
        }
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Merry Man'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.forEach(function (option) {
            _this.game.setElementSelectable({
                id: option.merryMan.id,
                callback: function () { return _this.updateInterfaceSelectRobinHoodDestination(option); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    SwashbuckleState.prototype.updateInterfaceSelectRobinHoodDestination = function (_a) {
        var _this = this;
        var merryMan = _a.merryMan, merryMenInSpace = _a.merryMenInSpace, spaces = _a.spaces, fromPrison = _a.fromPrison;
        this.game.clearPossible();
        var text = '';
        if (merryMan.type === ROBIN_HOOD) {
            text = fromPrison
                ? _('${you} must select Space to place Robin Hood in')
                : _('${you} must select Space to move Robin Hood to');
        }
        else {
            text = fromPrison
                ? _('${you} must select Space to place your Merry Man in')
                : _('${you} must select Space to move your Merry Man to');
        }
        this.game.setElementSelected({ id: merryMan.id });
        this.game.clientUpdatePageTitle({
            text: text,
            args: {
                you: '${you}',
            },
        });
        spaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    if (fromPrison) {
                        _this.updateInterfaceConfirm({
                            spaceRobinHood: space,
                            robinHood: merryMan,
                            fromPrison: fromPrison,
                        });
                    }
                    else if (merryMenInSpace.length > 0) {
                        _this.updateInterfaceSelectMerryMan({
                            spaceRobinHood: space,
                            robinHood: merryMan,
                            merryMenInSpace: merryMenInSpace,
                            spaces: spaces,
                            fromPrison: fromPrison,
                        });
                    }
                    else {
                        _this.updateInterfaceConfirm({
                            spaceRobinHood: space,
                            robinHood: merryMan,
                            fromPrison: fromPrison,
                        });
                    }
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    SwashbuckleState.prototype.updateInterfaceSelectMerryMan = function (_a) {
        var _this = this;
        var spaceRobinHood = _a.spaceRobinHood, robinHood = _a.robinHood, merryMenInSpace = _a.merryMenInSpace, spaces = _a.spaces, fromPrison = _a.fromPrison;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may select a Merry Man to move or skip'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: robinHood.id });
        merryMenInSpace.forEach(function (merryMan) {
            return _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () {
                    return _this.updateInterfaceSelectSpaceMerryMan({
                        spaceRobinHood: spaceRobinHood,
                        merryManId: merryMan.id,
                        robinHood: robinHood,
                        spaces: spaces,
                        fromPrison: fromPrison,
                    });
                },
            });
        });
        this.game.addSecondaryActionButton({
            id: 'skip_btn',
            text: _('Skip'),
            callback: function () {
                return _this.updateInterfaceConfirm({ spaceRobinHood: spaceRobinHood, robinHood: robinHood, fromPrison: fromPrison });
            },
        });
        this.game.addCancelButton();
    };
    SwashbuckleState.prototype.updateInterfaceSelectSpaceMerryMan = function (_a) {
        var _this = this;
        var spaceRobinHood = _a.spaceRobinHood, merryManId = _a.merryManId, spaces = _a.spaces, robinHood = _a.robinHood, fromPrison = _a.fromPrison;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to move the Merry Man to'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: merryManId });
        spaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    return _this.updateInterfaceConfirm({
                        spaceRobinHood: spaceRobinHood,
                        merryManId: merryManId,
                        merryManSpace: space,
                        robinHood: robinHood,
                        fromPrison: fromPrison,
                    });
                },
            });
        });
        this.game.addCancelButton();
    };
    SwashbuckleState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var fromPrison = _a.fromPrison, spaceRobinHood = _a.spaceRobinHood, merryManId = _a.merryManId, merryManSpace = _a.merryManSpace, robinHood = _a.robinHood;
        this.game.clearPossible();
        var text = robinHood.type === ROBIN_HOOD
            ? _('Move Robin Hood to ${robinHoodspaceName} and the Merry Man to ${merryManSpaceName}?')
            : _('Move one Merry Man to ${robinHoodspaceName} and your other Merry Man to ${merryManSpaceName}?');
        if (fromPrison && robinHood.type === ROBIN_HOOD) {
            text = _('Place Robin Hood Revealed in ${robinHoodspaceName}?');
        }
        else if (fromPrison) {
            text = _('Place your Merry Man Revealed in ${robinHoodspaceName}?');
        }
        else if (!merryManId && robinHood.type === ROBIN_HOOD) {
            text = _('Move Robin Hood to ${robinHoodspaceName}?');
        }
        else if (!merryManId) {
            text = _('Move your Merry Man to ${robinHoodspaceName}?');
        }
        this.game.setElementSelected({ id: robinHood.id });
        if (merryManId) {
            this.game.setElementSelected({ id: merryManId });
        }
        this.game.clientUpdatePageTitle({
            text: text,
            args: {
                robinHoodspaceName: _(spaceRobinHood.name),
                merryManSpaceName: merryManSpace ? _(merryManSpace.name) : '',
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actSwashbuckle',
                args: {
                    robinHoodId: robinHood.id,
                    robinHoodSpaceId: spaceRobinHood.id,
                    merryManSpaceId: merryManSpace === null || merryManSpace === void 0 ? void 0 : merryManSpace.id,
                    merryManId: merryManId,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return SwashbuckleState;
}());
var TurncoatState = (function () {
    function TurncoatState(game) {
        this.game = game;
    }
    TurncoatState.prototype.onEnteringState = function (args) {
        debug('Entering TurncoatState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    TurncoatState.prototype.onLeavingState = function () {
        debug('Leaving TurncoatState');
    };
    TurncoatState.prototype.setDescription = function (activePlayerId) { };
    TurncoatState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Revolting Parish'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.spaces.forEach(function (space) {
            _this.game.setSpaceSelectable({
                id: space.id,
                callback: function () {
                    if (_this.args._private.robinHoodInSupply) {
                        _this.updateInterfacePlaceRobinHood({ space: space });
                    }
                    else {
                        _this.updateInterfaceConfirm({ space: space });
                    }
                },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    TurncoatState.prototype.updateInterfacePlaceRobinHood = function (_a) {
        var _this = this;
        var space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Place Robin Hood?'),
            args: {},
        });
        this.game.addPrimaryActionButton({
            id: 'yes_btn',
            text: _('Yes'),
            callback: function () {
                return _this.updateInterfaceConfirm({ space: space, placeRobinHood: true });
            },
        });
        this.game.addPrimaryActionButton({
            id: 'no_btn',
            text: _('No'),
            callback: function () {
                return _this.updateInterfaceConfirm({ space: space, placeRobinHood: false });
            },
        });
        this.game.addCancelButton();
    };
    TurncoatState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space, _b = _a.placeRobinHood, placeRobinHood = _b === void 0 ? false : _b;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Replace Henchman with Merry Man in ${spaceName}?'),
            args: {
                spaceName: _(space.name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actTurncoat',
                args: {
                    spaceId: space.id,
                    placeRobinHood: placeRobinHood,
                },
            });
        };
        if (this.game.settings.get({
            id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
        }) === PREF_ENABLED) {
            callback();
        }
        else {
            this.game.addConfirmButton({
                callback: callback,
            });
        }
        this.game.addCancelButton();
    };
    return TurncoatState;
}());
var tplCardTooltipContainer = function (_a) {
    var card = _a.card, content = _a.content;
    return "<div class=\"gest_card_tooltip\">\n  <div class=\"gest_card_tooltip_inner_container\">\n    ".concat(content, "\n  </div>\n  ").concat(card, "\n</div>");
};
var tplGestCardTooltip = function (_a) {
    var card = _a.card, game = _a.game, _b = _a.imageOnly, imageOnly = _b === void 0 ? false : _b;
    var cardHtml = "<div class=\"gest_card_side\" data-card-id=\"".concat(card.id.split('_')[0], "\"></div>");
    if (imageOnly) {
        return "<div class=\"gest_card_only_tooltip\">".concat(cardHtml, "</div>");
    }
    return tplCardTooltipContainer({
        card: cardHtml,
        content: "\n    <span class=\"gest_title\">".concat(_(card.title), "</span>\n    <span>").concat(card.type === 'travellerCard'
            ? game.format_string_recursive(_('Strength: ${strength}'), {
                strength: card.strength,
            })
            : game.format_string_recursive(_('Carriages: ${carriages}'), {
                carriages: card.carriageMoves,
            }), "</span>\n    <span class=\"gest_section_title\">").concat(_(card.titleLight), "</span>\n    <span class=\"gest_tooltip_text\">").concat(_(card.textLight), "</span>\n    <span class=\"gest_section_title\">").concat(_(card.titleDark), "</span>\n    <span class=\"gest_tooltip_text\">").concat(_(card.textDark), "</span>\n    "),
    });
};
var tplTravellerTooltip = function (info) {
    return "\n  <div class=\"gest_traveller_tooltip\">\n    <div class=\"gest_traveller_image\" data-image=\"".concat(info.image, "\"></div>\n    <div class=\"gest_traveller_stats_container\">\n      <span class=\"gest_traveller_name\">").concat(_(info.name), "</span>\n      <div class=\"gest_row\">\n        <span class=\"gest_traveller_defense\">").concat(_('Defense'), ": ").concat(info.defense, "</span>\n      </div>\n      <div class=\"gest_row\">\n        <span class=\"gest_rob_result\">").concat(_('Success: '), "</span>\n        <span>").concat(_(info.success), "</span>\n      </div>\n      <div class=\"gest_row\">\n        <span class=\"gest_rob_result\">").concat(_('Failure: '), "</span>\n        <span>").concat(_(info.failure), "</span>\n      </div>\n    </div>\n  </div>");
};
var tplCarriageTooltip = function (game, type) {
    var info = carriagesRobInfo().find(function (data) { return data.image === type; });
    return "\n          <div class=\"gest_carriage_tooltip gest_row\">\n            <div class=\"gest_force_side\" data-type=\"".concat(info.image, "\" data-revealed=\"true\"></div>\n            <div>\n              <span class=\"gest_title\">").concat(_(info.name), "</span>\n              <div><span class=\"gest_section_title\">").concat(_('Defense'), ": ").concat(info.defense, "</span></div>\n              <div style=\"margin-top: 8px;\">\n                <span class=\"gest_section_title\">").concat(_('If reaches Nottingham:'), "</span>\n              </div>\n              <div>\n                <span>").concat(_(info.nottingham), "</span>\n              </div>\n              <div style=\"margin-top: 8px;\">\n                <span class=\"gest_section_title\">").concat(_('If Robbed:'), "</span>\n              </div>\n              <div><span>").concat(game.format_string_recursive(_(info.success), {
        tkn_boldItalicText_success: _('Success: '),
    }), "</span></div>\n              <div>\n                <span>").concat(game.format_string_recursive(_(info.failure), {
        tkn_boldItalicText_failure: _('Failure: '),
    }), "</span></div>\n            </div>\n          </div>   \n          \n          \n  ");
};
var tplTooltipWithIcon = function (_a) {
    var title = _a.title, text = _a.text, iconHtml = _a.iconHtml, iconWidth = _a.iconWidth;
    return "<div class=\"gest_icon_tooltip\">\n            <div class=\"gest_icon_tooltip_icon\"".concat(iconWidth ? "style=\"min-width: ".concat(iconWidth, "px;\"") : '', ">\n              ").concat(iconHtml, "\n            </div>\n            <div class=\"gest_icon_tooltip_content\">\n              ").concat(title ? "<span class=\"gest_tooltip_title\" >".concat(title, "</span>") : '', "\n              <span class=\"gest_tooltip_text\">").concat(text, "</span>\n            </div>\n          </div>");
};
var tplTextTooltip = function (_a) {
    var text = _a.text;
    return "<span class=\"gest_text_tooltip\">".concat(text, "</span>");
};
var TooltipManager = (function () {
    function TooltipManager(game) {
        this.idRegex = /id="[a-z]*_[0-9]*_[0-9]*"/;
        this.game = game;
    }
    TooltipManager.prototype.addTextToolTip = function (_a) {
        var nodeId = _a.nodeId, text = _a.text;
        this.game.framework().addTooltip(nodeId, _(text), '', 500);
    };
    TooltipManager.prototype.removeTooltip = function (nodeId) {
        this.game.framework().removeTooltip(nodeId);
    };
    TooltipManager.prototype.setupTooltips = function () { };
    TooltipManager.prototype.addCardTooltip = function (_a) {
        var nodeId = _a.nodeId, cardId = _a.cardId;
        var card = this.game.gamedatas.staticData.cards[cardId];
        var html = tplGestCardTooltip({
            card: card,
            game: this.game,
            imageOnly: this.game.settings.get({ id: PREF_CARD_INFO_IN_TOOLTIP }) === DISABLED,
        });
        this.game.framework().addTooltipHtml(nodeId, html, 500);
    };
    TooltipManager.prototype.addCarriageTooltip = function (_a) {
        var nodeId = _a.nodeId, type = _a.type;
        this.game
            .framework()
            .addTooltipHtml(nodeId, tplCarriageTooltip(this.game, type), 500);
    };
    TooltipManager.prototype.addTravellersTooltips = function () {
        var _this = this;
        var config = getTravellersConfig();
        TRAVELLERS.forEach(function (traveller) {
            _this.game
                .framework()
                .addTooltipHtml("gest_traveller_".concat(traveller, "_counter_row"), tplTravellerTooltip(config.find(function (data) { return data.image === traveller; })), 500);
        });
    };
    TooltipManager.prototype.addGameMapTooltips = function () {
        this.game
            .framework()
            .addTooltipHtml('royalInspectionTrack_unrest', royalInspectionUnrest({ game: this.game }), 500);
        this.game
            .framework()
            .addTooltipHtml('royalInspectionTrack_mischief', royalInspectionMischief({ game: this.game }), 500);
        this.game
            .framework()
            .addTooltipHtml('royalInspectionTrack_governance', royalInspectionGovernance({ game: this.game }), 500);
        this.game
            .framework()
            .addTooltipHtml('royalInspectionTrack_redeployment', royalInspectionRedployment({ game: this.game }), 500);
        this.game
            .framework()
            .addTooltipHtml('royalInspectionTrack_reset', royalInspectionReset({ game: this.game }), 500);
    };
    return TooltipManager;
}());
