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
var MIN_PLAY_AREA_WIDTH = 1500;
var MIN_NOTIFICATION_MS = 1200;
var ENABLED = 'enabled';
var DISABLED = 'disabled';
var GEST_SELECTABLE = 'gest_selectable';
var GEST_SELECTED = 'gest_selected';
var DISCARD = 'discard';
var PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY = 'confirmEndOfTurnPlayerSwitchOnly';
var PREF_SHOW_ANIMATIONS = 'showAnimations';
var PREF_ANIMATION_SPEED = 'animationSpeed';
var PREF_CARD_INFO_IN_TOOLTIP = 'cardInfoInTooltip';
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
var GAIN_TWO_SHILLINGS = 'gainTwoShillings';
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
            eventAmbushDark: new EventAmbushDarkState(this),
            hire: new HireState(this),
            moveCarriage: new MoveCarriageState(this),
            patrol: new PatrolState(this),
            placeMerryManInSpace: new PlaceMerryManInSpaceState(this),
            recruit: new RecruitState(this),
            ride: new RideState(this),
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
        this.settings = new Settings(this);
        this.animationManager = new AnimationManager(this, {
            duration: this.settings.get({ id: PREF_SHOW_ANIMATIONS }) === DISABLED
                ? 0
                : 2100 - this.settings.get({ id: PREF_ANIMATION_SPEED }),
        });
        this.forceManager = new ForceManager(this);
        this.markerManager = new MarkerManager(this);
        this.gameMap = new GameMap(this);
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
        dojo.query(".".concat(GEST_SELECTABLE)).removeClass(GEST_SELECTABLE);
        dojo.query(".".concat(GEST_SELECTED)).removeClass(GEST_SELECTED);
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
        var RIGHT_COLUMN = 1500;
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
        var card = this.gamedatas.staticData.cards[cardId];
        this.tooltipManager.addCardTooltip({
            nodeId: "gest_tooltip_".concat(tooltipId),
            card: card,
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
    };
    ForceManager.prototype.setupFrontDiv = function (force, div) {
        div.classList.add('gest_force_side');
        div.setAttribute('data-type', force.type);
        if ([TALLAGE_CARRIAGE, TRIBUTE_CARRIAGE, TRAP_CARRIAGE].includes(force.type)) {
            div.replaceChildren(force.type.substring(0, 3));
        }
        if (force.type === ROBIN_HOOD && !force.hidden) {
            div.replaceChildren('RH');
        }
        if (force.type === CAMP) {
            div.replaceChildren('C');
        }
        if (force.type === MERRY_MEN) {
            div.replaceChildren('M');
        }
    };
    ForceManager.prototype.setupBackDiv = function (force, div) {
        div.classList.add('gest_force_side');
        div.setAttribute('data-type', force.type);
        if (force.id.startsWith('fake')) {
            return;
        }
        if (force.type === ROBIN_HOOD) {
            div.insertAdjacentHTML('beforeend', '<div>*</div>');
        }
        if ([TALLAGE_CARRIAGE, TRIBUTE_CARRIAGE, TRAP_CARRIAGE].includes(force.type)) {
            div.insertAdjacentHTML('afterbegin', "<span>*".concat(force.type.substring(0, 3), "</span>"));
        }
    };
    ForceManager.prototype.isCardVisible = function (force) {
        if (force.type === ROBIN_HOOD) {
            console.log('robin hood back', force);
        }
        return !force.hidden;
    };
    return ForceManager;
}(CardManager));
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
var SPACES_CONFIG = (_a = {},
    _a[BINGHAM] = (_b = {},
        _b[HENCHMEN] = {
            top: 1271,
            left: 737,
            width: 89,
            height: 143,
        },
        _b[CAMP] = {
            top: 1219,
            left: 869,
            width: 50,
            height: 50,
        },
        _b[MERRY_MEN] = {
            top: 1255,
            left: 931,
            width: 82,
            height: 170,
        },
        _b[CARRIAGE] = {
            top: 1419,
            left: 805,
            width: 100,
            height: 50,
        },
        _b),
    _a[BLYTH] = (_c = {},
        _c[HENCHMEN] = {
            top: 583,
            left: 641,
            width: 100,
            height: 160,
        },
        _c[CAMP] = {
            top: 488,
            left: 585,
            width: 50,
            height: 50,
        },
        _c[MERRY_MEN] = {
            top: 562,
            left: 525,
            width: 100,
            height: 160,
        },
        _c[CARRIAGE] = {
            top: 500,
            left: 772,
            width: 50,
            height: 100,
        },
        _c),
    _a[MANSFIELD] = (_d = {},
        _d[HENCHMEN] = {
            top: 1128,
            left: 313,
            width: 100,
            height: 150,
        },
        _d[CAMP] = {
            top: 855,
            left: 273,
            width: 50,
            height: 50,
        },
        _d[MERRY_MEN] = {
            top: 847,
            left: 329,
            width: 100,
            height: 145,
        },
        _d[CARRIAGE] = {
            top: 1028,
            left: 253,
            width: 50,
            height: 100,
        },
        _d),
    _a[NEWARK] = (_e = {},
        _e[HENCHMEN] = {
            top: 706,
            left: 1081,
            width: 100,
            height: 145,
        },
        _e[CAMP] = {
            top: 1108,
            left: 916,
            width: 50,
            height: 50,
        },
        _e[MERRY_MEN] = {
            top: 1035,
            left: 977,
            width: 100,
            height: 170,
        },
        _e[CARRIAGE] = {
            top: 650,
            left: 1136,
            width: 100,
            height: 50,
        },
        _e),
    _a[NOTTINGHAM] = (_f = {},
        _f[HENCHMEN] = {
            top: 1131,
            left: 474,
            width: 175,
            height: 100,
        },
        _f[MERRY_MEN] = {
            top: 1047,
            left: 474,
            width: 170,
            height: 79,
        },
        _f[CARRIAGE] = {
            top: 1108,
            left: 634,
            width: 50,
            height: 100,
        },
        _f),
    _a[OLLERTON_HILL] = (_g = {},
        _g[CAMP] = {
            top: 880,
            left: 778,
            width: 50,
            height: 50,
        },
        _g),
    _a[REMSTON] = (_h = {},
        _h[HENCHMEN] = {
            top: 1401,
            left: 624,
            width: 100,
            height: 160,
        },
        _h[CAMP] = {
            top: 1318,
            left: 507,
            width: 50,
            height: 50,
        },
        _h[MERRY_MEN] = {
            top: 1373,
            left: 416,
            width: 100,
            height: 160,
        },
        _h[CARRIAGE] = {
            top: 1537,
            left: 511,
            width: 100,
            height: 50,
        },
        _h),
    _a[RETFORD] = (_j = {},
        _j[HENCHMEN] = {
            top: 335,
            left: 971,
            width: 100,
            height: 143,
        },
        _j[CAMP] = {
            top: 262,
            left: 766,
            width: 50,
            height: 50,
        },
        _j[MERRY_MEN] = {
            top: 335,
            left: 866,
            width: 100,
            height: 143,
        },
        _j[CARRIAGE] = {
            top: 227,
            left: 989,
            width: 50,
            height: 100,
        },
        _j),
    _a[SHIRE_WOOD] = (_k = {},
        _k[HENCHMEN] = {
            top: 787,
            left: 467,
            width: 160,
            height: 68,
        },
        _k[CAMP] = {
            top: 924,
            left: 610,
            width: 50,
            height: 50,
        },
        _k[MERRY_MEN] = {
            top: 904,
            left: 467,
            width: 140,
            height: 100,
        },
        _k[CARRIAGE] = {
            top: 855,
            left: 467,
            width: 50,
            height: 50,
        },
        _k),
    _a[SOUTHWELL_FOREST] = (_l = {},
        _l[HENCHMEN] = {
            top: 955,
            left: 671,
            width: 84,
            height: 124,
        },
        _l[CAMP] = {
            top: 1153,
            left: 762,
            width: 50,
            height: 50,
        },
        _l[MERRY_MEN] = {
            top: 1005,
            left: 762,
            width: 100,
            height: 100,
        },
        _l[CARRIAGE] = {
            top: 949,
            left: 771,
            width: 50,
            height: 50,
        },
        _l),
    _a[TUXFORD] = (_m = {},
        _m[HENCHMEN] = {
            top: 832,
            left: 864,
            width: 100,
            height: 161,
        },
        _m[CAMP] = {
            top: 645,
            left: 864,
            width: 50,
            height: 50,
        },
        _m[MERRY_MEN] = {
            top: 532,
            left: 932,
            width: 100,
            height: 161,
        },
        _m[CARRIAGE] = {
            top: 724,
            left: 823,
            width: 50,
            height: 100,
        },
        _m),
    _a);
var JUSTICE_TRACK_CONFIG = [
    {
        id: 'justiceTrack_1',
        top: 922,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_2',
        top: 821,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_3',
        top: 720,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_4',
        top: 619,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_5',
        top: 518,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_6',
        top: 417,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'justiceTrack_7',
        top: 316,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
];
var ORDER_TRACK = [
    {
        id: 'orderTrack_1',
        top: 1047,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_2',
        top: 1148,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_3',
        top: 1249,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_4',
        top: 1350,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_5',
        top: 1451,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_6',
        top: 1552,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
    {
        id: 'orderTrack_7',
        top: 1653,
        left: 112,
        extraClasses: 'gest_marker_space gest_justice_order_track',
    },
];
var ROYAL_INSPECTION_TRACK = [
    {
        id: 'royalInspectionTrack_unrest',
        top: 880,
        left: 1211,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_mischief',
        top: 974,
        left: 1211,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_governance',
        top: 1065,
        left: 1211,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_redeployment',
        top: 1156,
        left: 1211,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_reset',
        top: 1246,
        left: 1211,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
    {
        id: 'royalInspectionTrack_balad',
        top: 728,
        left: 1233,
        extraClasses: 'gest_marker_space gest_royal_inspection_track',
    },
];
var PARISH_STATUS_BOXES = [
    {
        id: 'parishStatusBox_Retford',
        top: 222,
        left: 883,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Blyth',
        top: 461,
        left: 669,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Tuxford',
        top: 716,
        left: 890,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Newark',
        top: 904,
        left: 1060,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Mansfield',
        top: 1004,
        left: 311,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Bingham',
        top: 1294,
        left: 834,
        extraClasses: 'gest_parish_status_box',
    },
    {
        id: 'parishStatusBox_Remston',
        top: 1399,
        left: 528,
        extraClasses: 'gest_parish_status_box',
    },
];
var INITIATIVE_TRACK = [
    {
        id: 'initiativeTrack_singlePlot',
        top: 1614,
        left: 1094,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
    {
        id: 'initiativeTrack_event',
        top: 1606,
        left: 1191,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
    {
        id: 'initiativeTrack_plotsAndDeeds',
        top: 1598,
        left: 1286,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
    {
        id: 'initiativeTrack_firstEligible',
        top: 1803,
        left: 1146,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
    {
        id: 'initiativeTrack_secondEligible',
        top: 1791,
        left: 1269,
        extraClasses: 'gest_marker_space gest_initiative_track',
    },
];
var UNIQUE_SPACES = [
    {
        id: 'Carriage_usedCarriages',
        top: 523,
        left: 249,
    },
    {
        id: "".concat(MERRY_MEN, "_prison"),
        top: 165,
        left: 1182,
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
                });
            });
        });
        this.forces['Carriage_usedCarriages'] = new LineStock(this.game.forceManager, document.getElementById('Carriage_usedCarriages'), {
            center: true,
        });
        this.forces["".concat(MERRY_MEN, "_prison")] = new LineStock(this.game.forceManager, document.getElementById("".concat(MERRY_MEN, "_prison")), {
            center: true,
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
            if (!spaceData) {
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
    };
    GameMap.prototype.setupGameMap = function (_a) {
        var gamedatas = _a.gamedatas;
        document
            .getElementById('play_area_container')
            .insertAdjacentHTML('afterbegin', tplGameMap({ gamedatas: gamedatas }));
        this.setupParishStatusMarkers({ gamedatas: gamedatas });
        this.setupForces({ gamedatas: gamedatas });
        this.updateTrackMarkers({ gamedatas: gamedatas });
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
                return;
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
            return force.hidden === hidden;
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
        var selected = this.getForcePublic({
            type: force.type,
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
            markers[0].side = status === SUBMISSIVE ? 'front' : 'back';
            this.game.markerManager.updateCardInformations(marker);
        }
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
    return "\n  <div id=\"gest_game_map\">\n    ".concat(tplTrack({ config: JUSTICE_TRACK_CONFIG }), "\n    ").concat(tplTrack({ config: ORDER_TRACK }), "\n    ").concat(tplTrack({ config: PARISH_STATUS_BOXES }), "\n    ").concat(tplTrack({ config: ROYAL_INSPECTION_TRACK }), "\n    ").concat(tplTrack({ config: INITIATIVE_TRACK }), "\n    ").concat(tplTrack({ config: UNIQUE_SPACES }), "\n    ").concat(tplSpaces(), "\n  </div>");
};
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
    InfoPanel.prototype.setup = function (_a) {
        var gamedatas = _a.gamedatas;
        var node = document.getElementById("player_boards");
        if (!node) {
            return;
        }
        node.insertAdjacentHTML("afterbegin", tplInfoPanel());
    };
    return InfoPanel;
}());
var tplInfoPanel = function () { return "<div class='player-board' id=\"info_panel\"></div>"; };
var LOG_TOKEN_BOLD_TEXT = 'boldText';
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
    var text = _a.text, tooltipId = _a.tooltipId;
    return "<span ".concat(tooltipId ? "id=\"".concat(tooltipId, "\"") : '', " style=\"font-weight: 700;\">").concat(_(text), "</span>");
};
var tplLogTokenPlayerName = function (_a) {
    var name = _a.name, color = _a.color;
    return "<span class=\"playername\" style=\"color:#".concat(color, ";\">").concat(name, "</span>");
};
var tplLogTokenCard = function (id) {
    return "<div class=\"gest_log_card gest_card\" data-card-id=\"".concat(id, "\"></div>");
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
            'parishStatus',
            'payShillings',
            'placeForceAll',
            'placeForce',
            'placeForcePrivate',
            'placeMerryMen',
            'placeMerryMenPrivate',
            'putCardInVictimsPile',
            'redeploymentSheriff',
            'removeCardFromGame',
            'returnTravellersDiscardToMainDeck',
            'returnToSupply',
            'returnToSupplyPrivate',
            'sneakMerryMen',
            'sneakMerryMenPrivate',
        ];
        notifs.forEach(function (notifName) {
            _this.subscriptions.push(dojo.subscribe(notifName, _this, function (notifDetails) {
                debug("notif_".concat(notifName), notifDetails);
                var promise = _this["notif_".concat(notifName)](notifDetails);
                var promises = promise ? [promise] : [];
                var minDuration = 1;
                var msg = _this.game.format_string_recursive(notifDetails.log, notifDetails.args);
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
                'placeMerryMen',
                'returnToSupply',
                'moveCarriagePublic',
                'placeForce',
                'sneakMerryMen',
                'moveMerryMenPublic',
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
            var data;
            var _this = this;
            return __generator(this, function (_a) {
                data = notif.args.forces;
                Object.entries(data).forEach(function (_a) {
                    var spaceId = _a[0], forces = _a[1];
                    forces.forEach(function (force) { return _this.game.gameMap.addPrivateForce({ force: force }); });
                });
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
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
    };
    NotificationManager.prototype.notif_drawAndRevealTravellerCard = function (notif) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
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
    NotificationManager.prototype.notif_placeForce = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, force, spaceId, count;
            return __generator(this, function (_b) {
                _a = notif.args, force = _a.force, spaceId = _a.spaceId, count = _a.count;
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
            var forces;
            var _this = this;
            return __generator(this, function (_a) {
                forces = notif.args.forces;
                forces.forEach(function (force) { return _this.game.gameMap.addPrivateForce({ force: force }); });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeForcePrivate = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var forces;
            var _this = this;
            return __generator(this, function (_a) {
                forces = notif.args.forces;
                forces.forEach(function (force) { return _this.game.gameMap.addPrivateForce({ force: force }); });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_placeMerryMen = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var merryMenCounts;
            var _this = this;
            return __generator(this, function (_a) {
                merryMenCounts = notif.args.merryMenCounts;
                Object.entries(merryMenCounts).forEach(function (_a) {
                    var spaceId = _a[0], countHidden = _a[1];
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
            var _a, robinHood, merryMen;
            var _this = this;
            return __generator(this, function (_b) {
                _a = notif.args, robinHood = _a.robinHood, merryMen = _a.merryMen;
                if (robinHood) {
                    this.game.gameMap.addPrivateForce({ force: robinHood });
                }
                merryMen.forEach(function (merryMan) {
                    return _this.game.gameMap.addPrivateForce({ force: merryMan });
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_putCardInVictimsPile = function (notif) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
    };
    NotificationManager.prototype.notif_redeploymentSheriff = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var forces, promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forces = notif.args.forces;
                        promises = [];
                        forces.forEach(function (force) {
                            promises.push(_this.game.gameMap.forces["".concat(HENCHMEN, "_").concat(force.location)].addCard(force));
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        this.game.gameMap.forces["".concat(CARRIAGE, "_").concat(USED_CARRIAGES)].removeAll();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_removeCardFromGame = function (notif) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
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
    NotificationManager.prototype.notif_returnToSupply = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, force, spaceId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, force = _a.force, spaceId = _a.spaceId;
                        return [4, this.game.gameMap.returnToSupplyPublic({
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
    NotificationManager.prototype.notif_returnToSupplyPrivate = function (notif) {
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
                            return _this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(force.location)].addCard(force);
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
                            promises.push(_this.game.gameMap.forces["".concat(MERRY_MEN, "_").concat(move.to.spaceId)].addCard(selectedForce));
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
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
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
    return NotificationManager;
}());
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
    PlayerManager.prototype.getRobinHoodPlayerId = function () {
        return Object.values(this.players)
            .filter(function (player) { return player.isRobinHood(); })[0]
            .getPlayerId();
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
            shillings: new ebg.counter(),
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
    };
    GestPlayer.prototype.setupPlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        var playerGamedatas = gamedatas.players[this.playerId];
        this.setupPlayerPanel({ playerGamedatas: playerGamedatas });
    };
    GestPlayer.prototype.setupPlayerPanel = function (_a) {
        var playerGamedatas = _a.playerGamedatas;
        var playerBoardDiv = document.getElementById("player_board_".concat(this.playerId));
        playerBoardDiv.insertAdjacentHTML('beforeend', tplPlayerPanel({ playerId: this.playerId }));
        this.counters.shillings.create("shillings_counter_".concat(this.playerId));
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
    return GestPlayer;
}());
var tplPlayerPanel = function (_a) {
    var playerId = _a.playerId;
    return "<div id=\"gest_player_panel_".concat(playerId, "\" class=\"gest_player_panel\">\n            <div class=\"gest_player_panel_shillings_counter\">\n              <span>Shillings: </span><span id=\"shillings_counter_").concat(playerId, "\"></span>\n            </div>\n          </div>");
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
                            max: 90,
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
        var configPanel = document.getElementById("info_panel");
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
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
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
            if (_this.args[action]) {
                _this.game.addPrimaryActionButton({
                    id: "".concat(action, "_select"),
                    text: _this.getActionName({ action: action }),
                    callback: function () { return _this.updateInterfaceConfirm({ action: action, pass: pass }); },
                });
            }
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
            return _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
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
            return _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_btn"),
                text: _(option.space.name),
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
            text: _('Dispers in ${spaceName}?'),
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
var EventAmbushDarkState = (function () {
    function EventAmbushDarkState(game) {
        this.game = game;
    }
    EventAmbushDarkState.prototype.onEnteringState = function (args) {
        debug('Entering EventAmbushDarkState');
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    EventAmbushDarkState.prototype.onLeavingState = function () {
        debug('Leaving EventAmbushDarkState');
    };
    EventAmbushDarkState.prototype.setDescription = function (activePlayerId) { };
    EventAmbushDarkState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Forest space'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args.options)
            .filter(function (_a) {
            var spaceId = _a[0], possible = _a[1];
            return possible;
        })
            .forEach(function (_a) {
            var spaceId = _a[0], possible = _a[1];
            _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_btn"),
                text: _(spaceId),
                callback: function () { return _this.updateInterfaceConfirm({ spaceId: spaceId }); },
            });
        });
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        this.game.addUndoButtons(this.args);
    };
    EventAmbushDarkState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var spaceId = _a.spaceId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Reveal all Merry Men in ${spaceName}?'),
            args: {
                spaceName: spaceId,
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actEventAmbushDark',
                args: {
                    spaceId: spaceId,
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
    return EventAmbushDarkState;
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
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
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
            text: _('${you} must select a space to Hire in'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args.options).forEach(function (_a) {
            var spaceId = _a[0], _b = _a[1], action = _b.action, space = _b.space, max = _b.max;
            _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_btn"),
                text: _(space.name),
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
        var _loop_3 = function (i) {
            this_1.game.addPrimaryActionButton({
                id: "place_".concat(i, "_btn"),
                text: "".concat(i),
                callback: function () { return _this.updateInterfaceConfirm({
                    count: i,
                    action: action,
                    space: space
                }); }
            });
        };
        var this_1 = this;
        for (var i = 1; i <= max; i++) {
            _loop_3(i);
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
    MoveCarriageState.prototype.updateInterfaceBringHenchman = function (_a) {
        var _this = this;
        var carriage = _a.carriage, from = _a.from, to = _a.to;
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
                    if (option.canBringHenchman) {
                        _this.updateInterfaceBringHenchman({
                            carriage: option.carriage,
                            from: option.from,
                            to: option.to,
                        });
                    }
                    else {
                        _this.updateInterfaceConfirm({
                            carriage: option.carriage,
                            from: option.from,
                            to: option.to,
                            bringHenchman: false,
                        });
                    }
                },
            });
        });
    };
    return MoveCarriageState;
}());
var PatrolState = (function () {
    function PatrolState(game) {
        this.selectedHenchmenIds = [];
        this.game = game;
    }
    PatrolState.prototype.onEnteringState = function (args) {
        debug('Entering PatrolState');
        this.selectedHenchmenIds = [];
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
            text: _('${you} must select a Space to move Henchmen to'),
            args: {
                you: '${you}',
            },
        });
        Object.entries(this.args.options).forEach(function (_a) {
            var spaceId = _a[0], _b = _a[1], space = _b.space, adjacentHenchmen = _b.adjacentHenchmen;
            _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_btn"),
                text: _(space.name),
                callback: function () {
                    if (adjacentHenchmen.length > 0) {
                        _this.updateInterfaceSelectHenchmen({ space: space, adjacentHenchmen: adjacentHenchmen });
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
    PatrolState.prototype.updateInterfaceSelectHenchmen = function (_a) {
        var _this = this;
        var adjacentHenchmen = _a.adjacentHenchmen, space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select Henchmen to move to ${spaceName}'),
            args: {
                you: '${you}',
                spaceName: _(space.name),
            },
        });
        adjacentHenchmen.forEach(function (henchman) {
            _this.game.setElementSelectable({
                id: henchman.id,
                callback: function () { return _this.handleHenchmenClick({ henchman: henchman }); },
            });
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm({ space: space }); },
        });
        this.game.addCancelButton();
    };
    PatrolState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var space = _a.space;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: this.selectedHenchmenIds.length > 0
                ? _('Move ${count} Henchmen to ${spaceName} and Patrol?')
                : _('Patrol in ${spaceName}?'),
            args: {
                spaceName: _(space.name),
                count: this.selectedHenchmenIds.length,
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actPatrol',
                args: {
                    spaceId: space.id,
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
    PatrolState.prototype.handleHenchmenClick = function (_a) {
        var henchman = _a.henchman;
        if (this.selectedHenchmenIds.includes(henchman.id)) {
            this.game.removeSelectedFromElement({ id: henchman.id });
            this.selectedHenchmenIds = this.selectedHenchmenIds.filter(function (id) { return id !== henchman.id; });
        }
        else {
            this.game.setElementSelected({ id: henchman.id });
            this.selectedHenchmenIds.push(henchman.id);
        }
    };
    return PatrolState;
}());
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
            text: _('${you} must select a Space place a Merry Man in'),
            args: {
                you: '${you}',
            },
        });
        Object.values(this.args._private.spaces).forEach(function (space) {
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
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
            _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_btn"),
                text: _(option.space.name),
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
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Merry Man'),
            args: {
                you: '${you}',
            },
        });
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
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
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
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
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
            this.game.removeSelectedFromElement({ id: henchman.id });
            this.selectedHenchmenIds = this.selectedHenchmenIds.filter(function (id) { return id !== henchman.id; });
        }
        else {
            this.game.setElementSelected({ id: henchman.id });
            this.selectedHenchmenIds.push(henchman.id);
        }
        if (this.selectedHenchmenIds.length === 4) {
            this.updateInterfaceConfirm();
        }
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
            return _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_btn"),
                text: _(option.space.name),
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
                        merryMen: option.merryMen
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
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
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
    RoyalInspectionRedeploymentRobinHoodState.prototype.setDescription = function (activePlayerId) { };
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
        if (!Object.values(this.requiredMoves).some(function (dest) { return dest !== null; })) {
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
            _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_btn"),
                text: _(_this.args._private.spaces[spaceId].name),
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
        this.optionalMoveIds = [];
        this.localMoves = {};
        this.requiredMoves = {};
        Object.keys(this.args.henchmenMustMove).forEach(function (key) {
            _this.requiredMoves[key] = null;
        });
        this.updateInterfaceInitialStep();
    };
    RoyalInspectionRedeploymentSheriffState.prototype.onLeavingState = function () {
        debug('Leaving RoyalInspectionRedeploymentSheriffState');
    };
    RoyalInspectionRedeploymentSheriffState.prototype.setDescription = function (activePlayerId) { };
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
        if (!Object.values(this.requiredMoves).some(function (dest) { return dest !== null; })) {
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
        var option = _a.option;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to move your Henchman to'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: option.henchman.id });
        option.spaceIds.forEach(function (spaceId) {
            _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_btn"),
                text: _(_this.args.spaces[spaceId].name),
                callback: function () { return __awaiter(_this, void 0, void 0, function () {
                    var henchman;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.requiredMoves[option.henchman.id] = spaceId;
                                henchman = option.henchman;
                                this.addLocalMove({
                                    fromSpaceId: henchman.location,
                                    force: henchman,
                                });
                                henchman.location = spaceId;
                                return [4, this.game.gameMap.forces["".concat(HENCHMEN, "_").concat(spaceId)].addCard(henchman)];
                            case 1:
                                _a.sent();
                                this.updateInterfaceInitialStep();
                                return [2];
                        }
                    });
                }); },
            });
        });
        this.addCancelButton();
    };
    RoyalInspectionRedeploymentSheriffState.prototype.updateInterfaceOptionalMoves = function () {
        var _this = this;
        this.game.clearPossible();
        if (this.optionalMoveIds.length ===
            Object.keys(this.args.henchmenMayMove).length) {
            this.updateInterfaceConfirm();
        }
        this.game.clientUpdatePageTitle({
            text: _('${you} may select other Henchmen to move to Nottingham'),
            args: {
                you: '${you}',
            },
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        Object.entries(this.args.henchmenMayMove).forEach(function (_a) {
            var henchmanId = _a[0], option = _a[1];
            if (_this.optionalMoveIds.includes(henchmanId)) {
                return;
            }
            _this.game.setElementSelectable({
                id: henchmanId,
                callback: function () { return __awaiter(_this, void 0, void 0, function () {
                    var henchman;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.optionalMoveIds.push(henchmanId);
                                henchman = option.henchman;
                                henchman.location = NOTTINGHAM;
                                return [4, this.game.gameMap.forces["".concat(HENCHMEN, "_").concat(NOTTINGHAM)].addCard(henchman)];
                            case 1:
                                _a.sent();
                                this.updateInterfaceOptionalMoves();
                                return [2];
                        }
                    });
                }); },
            });
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
                    optionalMoves: _this.optionalMoveIds,
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
        if (this.staticData.titleLight) {
            this.game.addPrimaryActionButton({
                id: "light_option_btn",
                text: _(this.staticData.titleLight),
                callback: function () { return _this.updateInterfaceConfirm({ option: 'light' }); },
            });
        }
        if (this.staticData.titleDark) {
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
        this.robinHoodLocation = null;
        this.merryMenLocations = [];
        this.game = game;
    }
    SetupRobinHoodState.prototype.onEnteringState = function (args) {
        debug('Entering SetupRobinHoodState');
        this.args = args;
        this.robinHoodLocation = null;
        this.merryMenLocations = [];
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
        this.addSpaceButtons();
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
        this.addSpaceButtons();
        this.game.addCancelButton();
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
                    robinHood: _this.robinHoodLocation,
                    merryMen: _this.merryMenLocations,
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
    SetupRobinHoodState.prototype.addSpaceButtons = function () {
        var _this = this;
        [SHIRE_WOOD, SOUTHWELL_FOREST, REMSTON].forEach(function (spaceId) {
            _this.game.addPrimaryActionButton({
                id: "".concat(spaceId, "_select"),
                text: _(_this.game.gamedatas.spaces[spaceId].name),
                callback: function () { return _this.handleButtonClick(spaceId); },
            });
        });
    };
    SetupRobinHoodState.prototype.handleButtonClick = function (spaceId) {
        if (this.robinHoodLocation === null) {
            this.robinHoodLocation = spaceId;
        }
        else {
            this.merryMenLocations.push(spaceId);
        }
        if (this.merryMenLocations.length >= 3) {
            this.updateInterfaceConfirm();
        }
        else {
            this.updateInterfacePlaceMerryMen();
        }
    };
    return SetupRobinHoodState;
}());
var SneakState = (function () {
    function SneakState(game) {
        this.selectedSpace = null;
        this.selectedMerryMen = [];
        this.game = game;
    }
    SneakState.prototype.onEnteringState = function (args) {
        debug('Entering SneakState');
        this.args = args;
        this.selectedSpace = null;
        this.selectedMerryMen = [];
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
            text: _('${you} must select Merry Men to move'),
            args: {
                you: '${you}',
            },
        });
        this.game.addPrimaryActionButton({
            id: 'done_btn',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceSelectAdjacentSpace(); },
            extraClasses: this.selectedSpace === null || this.selectedMerryMen.length === 0
                ? 'disabled'
                : '',
        });
        this.setMerryMenSelectable();
        this.game.addPassButton({
            optionalAction: this.args.optionalAction,
        });
        if (this.selectedSpace !== null) {
            this.game.addCancelButton();
        }
        else {
            this.game.addUndoButtons(this.args);
        }
    };
    SneakState.prototype.updateInterfaceSelectAdjacentSpace = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select an adjacent space to move to'),
            args: {
                you: '${you}',
            },
        });
        this.selectedMerryMen.forEach(function (merryManId) {
            return _this.game.setElementSelected({ id: merryManId });
        });
        var option = this.args._private.options[this.selectedSpace];
        option.adjacentSpaces.forEach(function (space) {
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
                callback: function () { return _this.updateInterfaceConfirm({ toSpace: space }); },
            });
        });
        this.game.addCancelButton();
    };
    SneakState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var toSpace = _a.toSpace;
        this.game.clearPossible();
        this.selectedMerryMen.forEach(function (merryManId) {
            return _this.game.setElementSelected({ id: merryManId });
        });
        this.game.clientUpdatePageTitle({
            text: _('Move Merry Men to ${spacesName}?'),
            args: {
                spacesName: _(toSpace.name),
            },
        });
        var callback = function () {
            _this.game.clearPossible();
            _this.game.takeAction({
                action: 'actSneak',
                args: {
                    fromSpaceId: _this.selectedSpace,
                    toSpaceId: toSpace.id,
                    merryMenIds: _this.selectedMerryMen,
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
    SneakState.prototype.setMerryMenSelectable = function () {
        var _this = this;
        Object.entries(this.args._private.options).forEach(function (_a) {
            var spaceId = _a[0], option = _a[1];
            if (_this.selectedSpace && _this.selectedSpace !== spaceId) {
                return;
            }
            option.merryMen.forEach(function (merryMan) {
                if (_this.selectedMerryMen.some(function (selectedId) { return selectedId === merryMan.id; })) {
                    _this.game.setElementSelected({ id: merryMan.id });
                    _this.game.setElementSelectable({
                        id: merryMan.id,
                        callback: function () {
                            return _this.handleMerryMenClick({
                                currentStatus: 'selected',
                                merryManId: merryMan.id,
                                spaceId: option.space.id,
                            });
                        },
                    });
                }
                else {
                    _this.game.setElementSelectable({
                        id: merryMan.id,
                        callback: function () {
                            return _this.handleMerryMenClick({
                                currentStatus: 'selectable',
                                merryManId: merryMan.id,
                                spaceId: option.space.id,
                            });
                        },
                    });
                }
            });
        });
    };
    SneakState.prototype.handleMerryMenClick = function (_a) {
        var currentStatus = _a.currentStatus, merryManId = _a.merryManId, spaceId = _a.spaceId;
        if (currentStatus === 'selectable') {
            this.selectedMerryMen.push(merryManId);
        }
        else if (currentStatus === 'selected') {
            this.selectedMerryMen = this.selectedMerryMen.filter(function (id) { return id !== merryManId; });
        }
        if (currentStatus === 'selectable' && this.selectedSpace === null) {
            this.selectedSpace = spaceId;
        }
        else if (currentStatus === 'selected' &&
            this.selectedMerryMen.length === 0) {
            this.selectedSpace = null;
        }
        this.updateInterfaceInitialStep();
    };
    return SneakState;
}());
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
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: this.args._private.robinHoodInPrison
                ? _('${you} must select Space to place Robin Hood in')
                : _('${you} must select Space to move Robin Hood to'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.spaces.forEach(function (space) {
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
                callback: function () {
                    if (_this.args._private.robinHoodInPrison) {
                        _this.updateInterfaceConfirm({ spaceRobinHood: space });
                    }
                    else if (_this.args._private.merryMen.length > 0) {
                        _this.updateInterfaceSelectMerryMan({ spaceRobinHood: space });
                    }
                    else {
                        _this.updateInterfaceConfirm({ spaceRobinHood: space });
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
        var spaceRobinHood = _a.spaceRobinHood;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may select a Merry Man to move or skip'),
            args: {
                you: '${you}',
            },
        });
        this.args._private.merryMen.forEach(function (merryMan) {
            return _this.game.setElementSelectable({
                id: merryMan.id,
                callback: function () {
                    return _this.updateInterfaceSelectSpaceMerryMan({
                        spaceRobinHood: spaceRobinHood,
                        merryManId: merryMan.id,
                    });
                },
            });
        });
        this.game.addSecondaryActionButton({
            id: 'skip_btn',
            text: _('Skip'),
            callback: function () { return _this.updateInterfaceConfirm({ spaceRobinHood: spaceRobinHood }); },
        });
        this.game.addCancelButton();
    };
    SwashbuckleState.prototype.updateInterfaceSelectSpaceMerryMan = function (_a) {
        var _this = this;
        var spaceRobinHood = _a.spaceRobinHood, merryManId = _a.merryManId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a Space to move the Merry Man to'),
            args: {
                you: '${you}',
            },
        });
        this.game.setElementSelected({ id: merryManId });
        this.args._private.spaces.forEach(function (space) {
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
                callback: function () {
                    return _this.updateInterfaceConfirm({
                        spaceRobinHood: spaceRobinHood,
                        merryManId: merryManId,
                        merryManSpace: space,
                    });
                },
            });
        });
        this.game.addCancelButton();
    };
    SwashbuckleState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var spaceRobinHood = _a.spaceRobinHood, merryManId = _a.merryManId, merryManSpace = _a.merryManSpace;
        this.game.clearPossible();
        var text = _('Move Robin Hood to ${robinHoodspaceName} and the Merry Man to ${merryManSpaceName}?');
        if (this.args._private.robinHoodInPrison) {
            text = _('Place Robin Hood Revealed in ${spaceName}?');
        }
        else if (!merryManId) {
            text = _('Move Robin Hood to ${robinHoodspaceName}?');
        }
        this.game.setElementSelected({ id: ROBIN_HOOD });
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
            _this.game.addPrimaryActionButton({
                id: "".concat(space.id, "_btn"),
                text: _(space.name),
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
var tplTableauCardTooltip = function (_a) {
    var card = _a.card, game = _a.game, _b = _a.imageOnly, imageOnly = _b === void 0 ? false : _b;
    var cardHtml = "<div class=\"gest_card\" data-card-id=\"".concat(card.id.split('_')[0], "\"></div>");
    if (imageOnly) {
        return "<div style=\"--gestCardScale: 1.7;\">".concat(cardHtml, "</div>");
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
    TooltipManager.prototype.setupTooltips = function () {
    };
    TooltipManager.prototype.addCardTooltip = function (_a) {
        var nodeId = _a.nodeId, card = _a.card;
        var html = tplTableauCardTooltip({
            card: card,
            game: this.game,
            imageOnly: this.game.settings.get({ id: PREF_CARD_INFO_IN_TOOLTIP }) === DISABLED,
        });
        this.game.framework().addTooltipHtml(nodeId, html, 500);
    };
    return TooltipManager;
}());
