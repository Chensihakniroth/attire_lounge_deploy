import {
  require_client
} from "./chunk-GIEO4WOC.js";
import {
  ErrorBoundary_default
} from "./chunk-UXBR4C6Z.js";
import {
  Footer_default
} from "./chunk-L3RK6ABU.js";
import "./chunk-C24ENFZ7.js";
import {
  isSafari
} from "./chunk-OYA3TQ7M.js";
import {
  LoadingSpinner_default
} from "./chunk-WUXJHQPP.js";
import {
  FavoritesProvider,
  useFavorites
} from "./chunk-WOYLF5AP.js";
import {
  QueryClient,
  QueryClientProvider
} from "./chunk-X34TFW2S.js";
import "./chunk-LKV2EZRT.js";
import {
  HelmetProvider
} from "./chunk-KMO5UIDV.js";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation
} from "./chunk-75IRS43M.js";
import "./chunk-76OBIXIL.js";
import "./chunk-KFG6PLFT.js";
import {
  AnimatePresence,
  Camera,
  ChevronRight,
  Gift,
  Grid3x3,
  Heart,
  Home,
  LazyMotion,
  Mail,
  Menu,
  X,
  domAnimation,
  motion,
  useIsPresent,
  useMotionValueEvent,
  useScroll
} from "./chunk-UTGCPR5S.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-NSQU67W3.js";

// resources/js/app.jsx
var import_react5 = __toESM(require_react());
var import_client = __toESM(require_client());

// resources/js/components/MainApp.tsx
var import_react4 = __toESM(require_react());

// node_modules/lenis/dist/lenis.mjs
var version = "1.3.17";
function clamp(min, input, max) {
  return Math.max(min, Math.min(input, max));
}
function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}
function damp(x, y, lambda, deltaTime) {
  return lerp(x, y, 1 - Math.exp(-lambda * deltaTime));
}
function modulo(n, d) {
  return (n % d + d) % d;
}
var Animate = class {
  isRunning = false;
  value = 0;
  from = 0;
  to = 0;
  currentTime = 0;
  // These are instanciated in the fromTo method
  lerp;
  duration;
  easing;
  onUpdate;
  /**
   * Advance the animation by the given delta time
   *
   * @param deltaTime - The time in seconds to advance the animation
   */
  advance(deltaTime) {
    if (!this.isRunning) return;
    let completed = false;
    if (this.duration && this.easing) {
      this.currentTime += deltaTime;
      const linearProgress = clamp(0, this.currentTime / this.duration, 1);
      completed = linearProgress >= 1;
      const easedProgress = completed ? 1 : this.easing(linearProgress);
      this.value = this.from + (this.to - this.from) * easedProgress;
    } else if (this.lerp) {
      this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
      if (Math.round(this.value) === this.to) {
        this.value = this.to;
        completed = true;
      }
    } else {
      this.value = this.to;
      completed = true;
    }
    if (completed) {
      this.stop();
    }
    this.onUpdate?.(this.value, completed);
  }
  /** Stop the animation */
  stop() {
    this.isRunning = false;
  }
  /**
   * Set up the animation from a starting value to an ending value
   * with optional parameters for lerping, duration, easing, and onUpdate callback
   *
   * @param from - The starting value
   * @param to - The ending value
   * @param options - Options for the animation
   */
  fromTo(from, to, { lerp: lerp2, duration, easing, onStart, onUpdate }) {
    this.from = this.value = from;
    this.to = to;
    this.lerp = lerp2;
    this.duration = duration;
    this.easing = easing;
    this.currentTime = 0;
    this.isRunning = true;
    onStart?.();
    this.onUpdate = onUpdate;
  }
};
function debounce(callback, delay) {
  let timer;
  return function(...args) {
    let context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = void 0;
      callback.apply(context, args);
    }, delay);
  };
}
var Dimensions = class {
  constructor(wrapper, content, { autoResize = true, debounce: debounceValue = 250 } = {}) {
    this.wrapper = wrapper;
    this.content = content;
    if (autoResize) {
      this.debouncedResize = debounce(this.resize, debounceValue);
      if (this.wrapper instanceof Window) {
        window.addEventListener("resize", this.debouncedResize, false);
      } else {
        this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
        this.wrapperResizeObserver.observe(this.wrapper);
      }
      this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
      this.contentResizeObserver.observe(this.content);
    }
    this.resize();
  }
  width = 0;
  height = 0;
  scrollHeight = 0;
  scrollWidth = 0;
  // These are instanciated in the constructor as they need information from the options
  debouncedResize;
  wrapperResizeObserver;
  contentResizeObserver;
  destroy() {
    this.wrapperResizeObserver?.disconnect();
    this.contentResizeObserver?.disconnect();
    if (this.wrapper === window && this.debouncedResize) {
      window.removeEventListener("resize", this.debouncedResize, false);
    }
  }
  resize = () => {
    this.onWrapperResize();
    this.onContentResize();
  };
  onWrapperResize = () => {
    if (this.wrapper instanceof Window) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    } else {
      this.width = this.wrapper.clientWidth;
      this.height = this.wrapper.clientHeight;
    }
  };
  onContentResize = () => {
    if (this.wrapper instanceof Window) {
      this.scrollHeight = this.content.scrollHeight;
      this.scrollWidth = this.content.scrollWidth;
    } else {
      this.scrollHeight = this.wrapper.scrollHeight;
      this.scrollWidth = this.wrapper.scrollWidth;
    }
  };
  get limit() {
    return {
      x: this.scrollWidth - this.width,
      y: this.scrollHeight - this.height
    };
  }
};
var Emitter = class {
  events = {};
  /**
   * Emit an event with the given data
   * @param event Event name
   * @param args Data to pass to the event handlers
   */
  emit(event, ...args) {
    let callbacks = this.events[event] || [];
    for (let i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i]?.(...args);
    }
  }
  /**
   * Add a callback to the event
   * @param event Event name
   * @param cb Callback function
   * @returns Unsubscribe function
   */
  on(event, cb) {
    this.events[event]?.push(cb) || (this.events[event] = [cb]);
    return () => {
      this.events[event] = this.events[event]?.filter((i) => cb !== i);
    };
  }
  /**
   * Remove a callback from the event
   * @param event Event name
   * @param callback Callback function
   */
  off(event, callback) {
    this.events[event] = this.events[event]?.filter((i) => callback !== i);
  }
  /**
   * Remove all event listeners and clean up
   */
  destroy() {
    this.events = {};
  }
};
var LINE_HEIGHT = 100 / 6;
var listenerOptions = { passive: false };
var VirtualScroll = class {
  constructor(element, options = { wheelMultiplier: 1, touchMultiplier: 1 }) {
    this.element = element;
    this.options = options;
    window.addEventListener("resize", this.onWindowResize, false);
    this.onWindowResize();
    this.element.addEventListener("wheel", this.onWheel, listenerOptions);
    this.element.addEventListener(
      "touchstart",
      this.onTouchStart,
      listenerOptions
    );
    this.element.addEventListener(
      "touchmove",
      this.onTouchMove,
      listenerOptions
    );
    this.element.addEventListener("touchend", this.onTouchEnd, listenerOptions);
  }
  touchStart = {
    x: 0,
    y: 0
  };
  lastDelta = {
    x: 0,
    y: 0
  };
  window = {
    width: 0,
    height: 0
  };
  emitter = new Emitter();
  /**
   * Add an event listener for the given event and callback
   *
   * @param event Event name
   * @param callback Callback function
   */
  on(event, callback) {
    return this.emitter.on(event, callback);
  }
  /** Remove all event listeners and clean up */
  destroy() {
    this.emitter.destroy();
    window.removeEventListener("resize", this.onWindowResize, false);
    this.element.removeEventListener("wheel", this.onWheel, listenerOptions);
    this.element.removeEventListener(
      "touchstart",
      this.onTouchStart,
      listenerOptions
    );
    this.element.removeEventListener(
      "touchmove",
      this.onTouchMove,
      listenerOptions
    );
    this.element.removeEventListener(
      "touchend",
      this.onTouchEnd,
      listenerOptions
    );
  }
  /**
   * Event handler for 'touchstart' event
   *
   * @param event Touch event
   */
  onTouchStart = (event) => {
    const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
    this.touchStart.x = clientX;
    this.touchStart.y = clientY;
    this.lastDelta = {
      x: 0,
      y: 0
    };
    this.emitter.emit("scroll", {
      deltaX: 0,
      deltaY: 0,
      event
    });
  };
  /** Event handler for 'touchmove' event */
  onTouchMove = (event) => {
    const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
    const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier;
    const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier;
    this.touchStart.x = clientX;
    this.touchStart.y = clientY;
    this.lastDelta = {
      x: deltaX,
      y: deltaY
    };
    this.emitter.emit("scroll", {
      deltaX,
      deltaY,
      event
    });
  };
  onTouchEnd = (event) => {
    this.emitter.emit("scroll", {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      event
    });
  };
  /** Event handler for 'wheel' event */
  onWheel = (event) => {
    let { deltaX, deltaY, deltaMode } = event;
    const multiplierX = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.width : 1;
    const multiplierY = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.height : 1;
    deltaX *= multiplierX;
    deltaY *= multiplierY;
    deltaX *= this.options.wheelMultiplier;
    deltaY *= this.options.wheelMultiplier;
    this.emitter.emit("scroll", { deltaX, deltaY, event });
  };
  onWindowResize = () => {
    this.window = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };
};
var defaultEasing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
var Lenis = class {
  _isScrolling = false;
  // true when scroll is animating
  _isStopped = false;
  // true if user should not be able to scroll - enable/disable programmatically
  _isLocked = false;
  // same as isStopped but enabled/disabled when scroll reaches target
  _preventNextNativeScrollEvent = false;
  _resetVelocityTimeout = null;
  _rafId = null;
  /**
   * Whether or not the user is touching the screen
   */
  isTouching;
  /**
   * The time in ms since the lenis instance was created
   */
  time = 0;
  /**
   * User data that will be forwarded through the scroll event
   *
   * @example
   * lenis.scrollTo(100, {
   *   userData: {
   *     foo: 'bar'
   *   }
   * })
   */
  userData = {};
  /**
   * The last velocity of the scroll
   */
  lastVelocity = 0;
  /**
   * The current velocity of the scroll
   */
  velocity = 0;
  /**
   * The direction of the scroll
   */
  direction = 0;
  /**
   * The options passed to the lenis instance
   */
  options;
  /**
   * The target scroll value
   */
  targetScroll;
  /**
   * The animated scroll value
   */
  animatedScroll;
  // These are instanciated here as they don't need information from the options
  animate = new Animate();
  emitter = new Emitter();
  // These are instanciated in the constructor as they need information from the options
  dimensions;
  // This is not private because it's used in the Snap class
  virtualScroll;
  constructor({
    wrapper = window,
    content = document.documentElement,
    eventsTarget = wrapper,
    smoothWheel = true,
    syncTouch = false,
    syncTouchLerp = 0.075,
    touchInertiaExponent = 1.7,
    duration,
    // in seconds
    easing,
    lerp: lerp2 = 0.1,
    infinite = false,
    orientation = "vertical",
    // vertical, horizontal
    gestureOrientation = orientation === "horizontal" ? "both" : "vertical",
    // vertical, horizontal, both
    touchMultiplier = 1,
    wheelMultiplier = 1,
    autoResize = true,
    prevent,
    virtualScroll,
    overscroll = true,
    autoRaf = false,
    anchors = false,
    autoToggle = false,
    // https://caniuse.com/?search=transition-behavior
    allowNestedScroll = false,
    // @ts-ignore: this will be deprecated in the future
    __experimental__naiveDimensions = false,
    naiveDimensions = __experimental__naiveDimensions,
    stopInertiaOnNavigate = false
  } = {}) {
    window.lenisVersion = version;
    if (!wrapper || wrapper === document.documentElement) {
      wrapper = window;
    }
    if (typeof duration === "number" && typeof easing !== "function") {
      easing = defaultEasing;
    } else if (typeof easing === "function" && typeof duration !== "number") {
      duration = 1;
    }
    this.options = {
      wrapper,
      content,
      eventsTarget,
      smoothWheel,
      syncTouch,
      syncTouchLerp,
      touchInertiaExponent,
      duration,
      easing,
      lerp: lerp2,
      infinite,
      gestureOrientation,
      orientation,
      touchMultiplier,
      wheelMultiplier,
      autoResize,
      prevent,
      virtualScroll,
      overscroll,
      autoRaf,
      anchors,
      autoToggle,
      allowNestedScroll,
      naiveDimensions,
      stopInertiaOnNavigate
    };
    this.dimensions = new Dimensions(wrapper, content, { autoResize });
    this.updateClassName();
    this.targetScroll = this.animatedScroll = this.actualScroll;
    this.options.wrapper.addEventListener("scroll", this.onNativeScroll, false);
    this.options.wrapper.addEventListener("scrollend", this.onScrollEnd, {
      capture: true
    });
    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.addEventListener(
        "click",
        this.onClick,
        false
      );
    }
    this.options.wrapper.addEventListener(
      "pointerdown",
      this.onPointerDown,
      false
    );
    this.virtualScroll = new VirtualScroll(eventsTarget, {
      touchMultiplier,
      wheelMultiplier
    });
    this.virtualScroll.on("scroll", this.onVirtualScroll);
    if (this.options.autoToggle) {
      this.checkOverflow();
      this.rootElement.addEventListener("transitionend", this.onTransitionEnd, {
        passive: true
      });
    }
    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf);
    }
  }
  /**
   * Destroy the lenis instance, remove all event listeners and clean up the class name
   */
  destroy() {
    this.emitter.destroy();
    this.options.wrapper.removeEventListener(
      "scroll",
      this.onNativeScroll,
      false
    );
    this.options.wrapper.removeEventListener("scrollend", this.onScrollEnd, {
      capture: true
    });
    this.options.wrapper.removeEventListener(
      "pointerdown",
      this.onPointerDown,
      false
    );
    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.removeEventListener(
        "click",
        this.onClick,
        false
      );
    }
    this.virtualScroll.destroy();
    this.dimensions.destroy();
    this.cleanUpClassName();
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
  }
  on(event, callback) {
    return this.emitter.on(event, callback);
  }
  off(event, callback) {
    return this.emitter.off(event, callback);
  }
  onScrollEnd = (e) => {
    if (!(e instanceof CustomEvent)) {
      if (this.isScrolling === "smooth" || this.isScrolling === false) {
        e.stopPropagation();
      }
    }
  };
  dispatchScrollendEvent = () => {
    this.options.wrapper.dispatchEvent(
      new CustomEvent("scrollend", {
        bubbles: this.options.wrapper === window,
        // cancelable: false,
        detail: {
          lenisScrollEnd: true
        }
      })
    );
  };
  get overflow() {
    const property = this.isHorizontal ? "overflow-x" : "overflow-y";
    return getComputedStyle(this.rootElement)[property];
  }
  checkOverflow() {
    if (["hidden", "clip"].includes(this.overflow)) {
      this.internalStop();
    } else {
      this.internalStart();
    }
  }
  onTransitionEnd = (event) => {
    if (event.propertyName.includes("overflow")) {
      this.checkOverflow();
    }
  };
  setScroll(scroll) {
    if (this.isHorizontal) {
      this.options.wrapper.scrollTo({ left: scroll, behavior: "instant" });
    } else {
      this.options.wrapper.scrollTo({ top: scroll, behavior: "instant" });
    }
  }
  onClick = (event) => {
    const path = event.composedPath();
    const anchorElements = path.filter(
      (node) => node instanceof HTMLAnchorElement && node.getAttribute("href")
    );
    if (this.options.anchors) {
      const anchor = anchorElements.find(
        (node) => node.getAttribute("href")?.includes("#")
      );
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href) {
          const options = typeof this.options.anchors === "object" && this.options.anchors ? this.options.anchors : void 0;
          const target = `#${href.split("#")[1]}`;
          this.scrollTo(target, options);
        }
      }
    }
    if (this.options.stopInertiaOnNavigate) {
      const internalLink = anchorElements.find(
        (node) => node.host === window.location.host
      );
      if (internalLink) {
        this.reset();
      }
    }
  };
  onPointerDown = (event) => {
    if (event.button === 1) {
      this.reset();
    }
  };
  onVirtualScroll = (data) => {
    if (typeof this.options.virtualScroll === "function" && this.options.virtualScroll(data) === false)
      return;
    const { deltaX, deltaY, event } = data;
    this.emitter.emit("virtual-scroll", { deltaX, deltaY, event });
    if (event.ctrlKey) return;
    if (event.lenisStopPropagation) return;
    const isTouch = event.type.includes("touch");
    const isWheel = event.type.includes("wheel");
    this.isTouching = event.type === "touchstart" || event.type === "touchmove";
    const isClickOrTap = deltaX === 0 && deltaY === 0;
    const isTapToStop = this.options.syncTouch && isTouch && event.type === "touchstart" && isClickOrTap && !this.isStopped && !this.isLocked;
    if (isTapToStop) {
      this.reset();
      return;
    }
    const isUnknownGesture = this.options.gestureOrientation === "vertical" && deltaY === 0 || this.options.gestureOrientation === "horizontal" && deltaX === 0;
    if (isClickOrTap || isUnknownGesture) {
      return;
    }
    let composedPath = event.composedPath();
    composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement));
    const prevent = this.options.prevent;
    if (!!composedPath.find(
      (node) => node instanceof HTMLElement && (typeof prevent === "function" && prevent?.(node) || node.hasAttribute?.("data-lenis-prevent") || isTouch && node.hasAttribute?.("data-lenis-prevent-touch") || isWheel && node.hasAttribute?.("data-lenis-prevent-wheel") || this.options.allowNestedScroll && this.checkNestedScroll(node, { deltaX, deltaY }))
    ))
      return;
    if (this.isStopped || this.isLocked) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    const isSmooth = this.options.syncTouch && isTouch || this.options.smoothWheel && isWheel;
    if (!isSmooth) {
      this.isScrolling = "native";
      this.animate.stop();
      event.lenisStopPropagation = true;
      return;
    }
    let delta = deltaY;
    if (this.options.gestureOrientation === "both") {
      delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    } else if (this.options.gestureOrientation === "horizontal") {
      delta = deltaX;
    }
    if (!this.options.overscroll || this.options.infinite || this.options.wrapper !== window && this.limit > 0 && (this.animatedScroll > 0 && this.animatedScroll < this.limit || this.animatedScroll === 0 && deltaY > 0 || this.animatedScroll === this.limit && deltaY < 0)) {
      event.lenisStopPropagation = true;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    const isSyncTouch = isTouch && this.options.syncTouch;
    const isTouchEnd = isTouch && event.type === "touchend";
    const hasTouchInertia = isTouchEnd;
    if (hasTouchInertia) {
      delta = Math.sign(this.velocity) * Math.pow(Math.abs(this.velocity), this.options.touchInertiaExponent);
    }
    this.scrollTo(this.targetScroll + delta, {
      programmatic: false,
      ...isSyncTouch ? {
        lerp: hasTouchInertia ? this.options.syncTouchLerp : 1
      } : {
        lerp: this.options.lerp,
        duration: this.options.duration,
        easing: this.options.easing
      }
    });
  };
  /**
   * Force lenis to recalculate the dimensions
   */
  resize() {
    this.dimensions.resize();
    this.animatedScroll = this.targetScroll = this.actualScroll;
    this.emit();
  }
  emit() {
    this.emitter.emit("scroll", this);
  }
  onNativeScroll = () => {
    if (this._resetVelocityTimeout !== null) {
      clearTimeout(this._resetVelocityTimeout);
      this._resetVelocityTimeout = null;
    }
    if (this._preventNextNativeScrollEvent) {
      this._preventNextNativeScrollEvent = false;
      return;
    }
    if (this.isScrolling === false || this.isScrolling === "native") {
      const lastScroll = this.animatedScroll;
      this.animatedScroll = this.targetScroll = this.actualScroll;
      this.lastVelocity = this.velocity;
      this.velocity = this.animatedScroll - lastScroll;
      this.direction = Math.sign(
        this.animatedScroll - lastScroll
      );
      if (!this.isStopped) {
        this.isScrolling = "native";
      }
      this.emit();
      if (this.velocity !== 0) {
        this._resetVelocityTimeout = setTimeout(() => {
          this.lastVelocity = this.velocity;
          this.velocity = 0;
          this.isScrolling = false;
          this.emit();
        }, 400);
      }
    }
  };
  reset() {
    this.isLocked = false;
    this.isScrolling = false;
    this.animatedScroll = this.targetScroll = this.actualScroll;
    this.lastVelocity = this.velocity = 0;
    this.animate.stop();
  }
  /**
   * Start lenis scroll after it has been stopped
   */
  start() {
    if (!this.isStopped) return;
    if (this.options.autoToggle) {
      this.rootElement.style.removeProperty("overflow");
      return;
    }
    this.internalStart();
  }
  internalStart() {
    if (!this.isStopped) return;
    this.reset();
    this.isStopped = false;
    this.emit();
  }
  /**
   * Stop lenis scroll
   */
  stop() {
    if (this.isStopped) return;
    if (this.options.autoToggle) {
      this.rootElement.style.setProperty("overflow", "clip");
      return;
    }
    this.internalStop();
  }
  internalStop() {
    if (this.isStopped) return;
    this.reset();
    this.isStopped = true;
    this.emit();
  }
  /**
   * RequestAnimationFrame for lenis
   *
   * @param time The time in ms from an external clock like `requestAnimationFrame` or Tempus
   */
  raf = (time) => {
    const deltaTime = time - (this.time || time);
    this.time = time;
    this.animate.advance(deltaTime * 1e-3);
    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf);
    }
  };
  /**
   * Scroll to a target value
   *
   * @param target The target value to scroll to
   * @param options The options for the scroll
   *
   * @example
   * lenis.scrollTo(100, {
   *   offset: 100,
   *   duration: 1,
   *   easing: (t) => 1 - Math.cos((t * Math.PI) / 2),
   *   lerp: 0.1,
   *   onStart: () => {
   *     console.log('onStart')
   *   },
   *   onComplete: () => {
   *     console.log('onComplete')
   *   },
   * })
   */
  scrollTo(target, {
    offset = 0,
    immediate = false,
    lock = false,
    programmatic = true,
    // called from outside of the class
    lerp: lerp2 = programmatic ? this.options.lerp : void 0,
    duration = programmatic ? this.options.duration : void 0,
    easing = programmatic ? this.options.easing : void 0,
    onStart,
    onComplete,
    force = false,
    // scroll even if stopped
    userData
  } = {}) {
    if ((this.isStopped || this.isLocked) && !force) return;
    if (typeof target === "string" && ["top", "left", "start", "#"].includes(target)) {
      target = 0;
    } else if (typeof target === "string" && ["bottom", "right", "end"].includes(target)) {
      target = this.limit;
    } else {
      let node;
      if (typeof target === "string") {
        node = document.querySelector(target);
        if (!node) {
          if (target === "#top") {
            target = 0;
          } else {
            console.warn("Lenis: Target not found", target);
          }
        }
      } else if (target instanceof HTMLElement && target?.nodeType) {
        node = target;
      }
      if (node) {
        if (this.options.wrapper !== window) {
          const wrapperRect = this.rootElement.getBoundingClientRect();
          offset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
        }
        const rect = node.getBoundingClientRect();
        target = (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll;
      }
    }
    if (typeof target !== "number") return;
    target += offset;
    target = Math.round(target);
    if (this.options.infinite) {
      if (programmatic) {
        this.targetScroll = this.animatedScroll = this.scroll;
        const distance = target - this.animatedScroll;
        if (distance > this.limit / 2) {
          target = target - this.limit;
        } else if (distance < -this.limit / 2) {
          target = target + this.limit;
        }
      }
    } else {
      target = clamp(0, target, this.limit);
    }
    if (target === this.targetScroll) {
      onStart?.(this);
      onComplete?.(this);
      return;
    }
    this.userData = userData ?? {};
    if (immediate) {
      this.animatedScroll = this.targetScroll = target;
      this.setScroll(this.scroll);
      this.reset();
      this.preventNextNativeScrollEvent();
      this.emit();
      onComplete?.(this);
      this.userData = {};
      requestAnimationFrame(() => {
        this.dispatchScrollendEvent();
      });
      return;
    }
    if (!programmatic) {
      this.targetScroll = target;
    }
    if (typeof duration === "number" && typeof easing !== "function") {
      easing = defaultEasing;
    } else if (typeof easing === "function" && typeof duration !== "number") {
      duration = 1;
    }
    this.animate.fromTo(this.animatedScroll, target, {
      duration,
      easing,
      lerp: lerp2,
      onStart: () => {
        if (lock) this.isLocked = true;
        this.isScrolling = "smooth";
        onStart?.(this);
      },
      onUpdate: (value, completed) => {
        this.isScrolling = "smooth";
        this.lastVelocity = this.velocity;
        this.velocity = value - this.animatedScroll;
        this.direction = Math.sign(this.velocity);
        this.animatedScroll = value;
        this.setScroll(this.scroll);
        if (programmatic) {
          this.targetScroll = value;
        }
        if (!completed) this.emit();
        if (completed) {
          this.reset();
          this.emit();
          onComplete?.(this);
          this.userData = {};
          requestAnimationFrame(() => {
            this.dispatchScrollendEvent();
          });
          this.preventNextNativeScrollEvent();
        }
      }
    });
  }
  preventNextNativeScrollEvent() {
    this._preventNextNativeScrollEvent = true;
    requestAnimationFrame(() => {
      this._preventNextNativeScrollEvent = false;
    });
  }
  checkNestedScroll(node, { deltaX, deltaY }) {
    const time = Date.now();
    const cache = node._lenis ??= {};
    let hasOverflowX, hasOverflowY, isScrollableX, isScrollableY, scrollWidth, scrollHeight, clientWidth, clientHeight;
    const gestureOrientation = this.options.gestureOrientation;
    if (time - (cache.time ?? 0) > 2e3) {
      cache.time = Date.now();
      const computedStyle = window.getComputedStyle(node);
      cache.computedStyle = computedStyle;
      const overflowXString = computedStyle.overflowX;
      const overflowYString = computedStyle.overflowY;
      hasOverflowX = ["auto", "overlay", "scroll"].includes(overflowXString);
      hasOverflowY = ["auto", "overlay", "scroll"].includes(overflowYString);
      cache.hasOverflowX = hasOverflowX;
      cache.hasOverflowY = hasOverflowY;
      if (!hasOverflowX && !hasOverflowY) return false;
      if (gestureOrientation === "vertical" && !hasOverflowY) return false;
      if (gestureOrientation === "horizontal" && !hasOverflowX) return false;
      scrollWidth = node.scrollWidth;
      scrollHeight = node.scrollHeight;
      clientWidth = node.clientWidth;
      clientHeight = node.clientHeight;
      isScrollableX = scrollWidth > clientWidth;
      isScrollableY = scrollHeight > clientHeight;
      cache.isScrollableX = isScrollableX;
      cache.isScrollableY = isScrollableY;
      cache.scrollWidth = scrollWidth;
      cache.scrollHeight = scrollHeight;
      cache.clientWidth = clientWidth;
      cache.clientHeight = clientHeight;
    } else {
      isScrollableX = cache.isScrollableX;
      isScrollableY = cache.isScrollableY;
      hasOverflowX = cache.hasOverflowX;
      hasOverflowY = cache.hasOverflowY;
      scrollWidth = cache.scrollWidth;
      scrollHeight = cache.scrollHeight;
      clientWidth = cache.clientWidth;
      clientHeight = cache.clientHeight;
    }
    if (!hasOverflowX && !hasOverflowY || !isScrollableX && !isScrollableY) {
      return false;
    }
    if (gestureOrientation === "vertical" && (!hasOverflowY || !isScrollableY))
      return false;
    if (gestureOrientation === "horizontal" && (!hasOverflowX || !isScrollableX))
      return false;
    let orientation;
    if (gestureOrientation === "horizontal") {
      orientation = "x";
    } else if (gestureOrientation === "vertical") {
      orientation = "y";
    } else {
      const isScrollingX = deltaX !== 0;
      const isScrollingY = deltaY !== 0;
      if (isScrollingX && hasOverflowX && isScrollableX) {
        orientation = "x";
      }
      if (isScrollingY && hasOverflowY && isScrollableY) {
        orientation = "y";
      }
    }
    if (!orientation) return false;
    let scroll, maxScroll, delta, hasOverflow, isScrollable;
    if (orientation === "x") {
      scroll = node.scrollLeft;
      maxScroll = scrollWidth - clientWidth;
      delta = deltaX;
      hasOverflow = hasOverflowX;
      isScrollable = isScrollableX;
    } else if (orientation === "y") {
      scroll = node.scrollTop;
      maxScroll = scrollHeight - clientHeight;
      delta = deltaY;
      hasOverflow = hasOverflowY;
      isScrollable = isScrollableY;
    } else {
      return false;
    }
    const willScroll = delta > 0 ? scroll < maxScroll : scroll > 0;
    return willScroll && hasOverflow && isScrollable;
  }
  /**
   * The root element on which lenis is instanced
   */
  get rootElement() {
    return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
  }
  /**
   * The limit which is the maximum scroll value
   */
  get limit() {
    if (this.options.naiveDimensions) {
      if (this.isHorizontal) {
        return this.rootElement.scrollWidth - this.rootElement.clientWidth;
      } else {
        return this.rootElement.scrollHeight - this.rootElement.clientHeight;
      }
    } else {
      return this.dimensions.limit[this.isHorizontal ? "x" : "y"];
    }
  }
  /**
   * Whether or not the scroll is horizontal
   */
  get isHorizontal() {
    return this.options.orientation === "horizontal";
  }
  /**
   * The actual scroll value
   */
  get actualScroll() {
    const wrapper = this.options.wrapper;
    return this.isHorizontal ? wrapper.scrollX ?? wrapper.scrollLeft : wrapper.scrollY ?? wrapper.scrollTop;
  }
  /**
   * The current scroll value
   */
  get scroll() {
    return this.options.infinite ? modulo(this.animatedScroll, this.limit) : this.animatedScroll;
  }
  /**
   * The progress of the scroll relative to the limit
   */
  get progress() {
    return this.limit === 0 ? 1 : this.scroll / this.limit;
  }
  /**
   * Current scroll state
   */
  get isScrolling() {
    return this._isScrolling;
  }
  set isScrolling(value) {
    if (this._isScrolling !== value) {
      this._isScrolling = value;
      this.updateClassName();
    }
  }
  /**
   * Check if lenis is stopped
   */
  get isStopped() {
    return this._isStopped;
  }
  set isStopped(value) {
    if (this._isStopped !== value) {
      this._isStopped = value;
      this.updateClassName();
    }
  }
  /**
   * Check if lenis is locked
   */
  get isLocked() {
    return this._isLocked;
  }
  set isLocked(value) {
    if (this._isLocked !== value) {
      this._isLocked = value;
      this.updateClassName();
    }
  }
  /**
   * Check if lenis is smooth scrolling
   */
  get isSmooth() {
    return this.isScrolling === "smooth";
  }
  /**
   * The class name applied to the wrapper element
   */
  get className() {
    let className = "lenis";
    if (this.options.autoToggle) className += " lenis-autoToggle";
    if (this.isStopped) className += " lenis-stopped";
    if (this.isLocked) className += " lenis-locked";
    if (this.isScrolling) className += " lenis-scrolling";
    if (this.isScrolling === "smooth") className += " lenis-smooth";
    return className;
  }
  updateClassName() {
    this.cleanUpClassName();
    this.rootElement.className = `${this.rootElement.className} ${this.className}`.trim();
  }
  cleanUpClassName() {
    this.rootElement.className = this.rootElement.className.replace(/lenis(-\w+)?/g, "").trim();
  }
};

// resources/js/hooks/usePullToRefresh.js
var import_react = __toESM(require_react());
var usePullToRefresh = (callback, threshold = 100) => {
  const initialTouchY = (0, import_react.useRef)(0);
  const currentTouchY = (0, import_react.useRef)(0);
  const pulling = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    const getScrollPosition = () => {
      if (window.lenis && !window.lenis.isStopped) {
        return window.lenis.scroll;
      }
      return window.scrollY;
    };
    const handleTouchStart = (e) => {
      initialTouchY.current = e.touches[0].clientY;
      pulling.current = false;
    };
    const handleTouchMove = (e) => {
      currentTouchY.current = e.touches[0].clientY;
      const pullDelta = currentTouchY.current - initialTouchY.current;
      let canPull = getScrollPosition() <= 5;
      if (canPull && pullDelta > 0) {
        let el = e.target;
        while (el && el !== document.body) {
          if (el.scrollTop > 5) {
            canPull = false;
            break;
          }
          el = el.parentElement;
        }
      }
      if (canPull && pullDelta > 0) {
        e.preventDefault();
        pulling.current = true;
      } else {
        pulling.current = false;
      }
    };
    const handleTouchEnd = () => {
      if (pulling.current && getScrollPosition() <= 5 && currentTouchY.current - initialTouchY.current > threshold) {
        callback();
      }
      pulling.current = false;
    };
    document.body.addEventListener("touchstart", handleTouchStart);
    document.body.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.body.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.body.removeEventListener("touchstart", handleTouchStart);
      document.body.removeEventListener("touchmove", handleTouchMove);
      document.body.removeEventListener("touchend", handleTouchEnd);
    };
  }, [callback, threshold]);
};
var usePullToRefresh_default = usePullToRefresh;

// resources/js/components/layouts/Navigation.jsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = (0, import_react2.useState)(false);
  const [isScrolled, setIsScrolled] = (0, import_react2.useState)(false);
  const [isHovered, setIsHovered] = (0, import_react2.useState)(false);
  const [isMobile, setIsMobile] = (0, import_react2.useState)(false);
  const [isLookbookFilterOpen, setIsLookbookFilterOpen] = (0, import_react2.useState)(false);
  const { favorites } = useFavorites();
  (0, import_react2.useEffect)(() => {
    const handler = ({ detail }) => setIsLookbookFilterOpen(detail.isFilterOpen);
    window.addEventListener("lookbookFilterStateChange", handler);
    return () => window.removeEventListener("lookbookFilterStateChange", handler);
  }, []);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAdminRoute = location.pathname.startsWith("/admin");
  (0, import_react2.useEffect)(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  (0, import_react2.useEffect)(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("menuStateChange", { detail: { isMenuOpen } })
      );
    }, 50);
    return () => clearTimeout(timer);
  }, [isMenuOpen]);
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Latest Collection", path: "/collections", icon: Grid3x3 },
    { name: "Lookbook", path: "/lookbook", icon: Camera },
    { name: "Customize Gift for Men", path: "/customize-gift", icon: Gift },
    { name: "Contact", path: "/contact", icon: Mail }
  ];
  const { scrollY } = useScroll();
  const [hidden, setHidden] = (0, import_react2.useState)(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest < 50 || latest < previous) {
      setHidden(false);
      setIsScrolled(latest > 50);
    } else if (latest > 50 && latest > previous) {
      setHidden(true);
      setIsScrolled(true);
    }
  });
  (0, import_react2.useEffect)(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);
  const isVisible = isMenuOpen || isHovered || !hidden;
  const isTransparentNav = isHomePage && !isScrolled && !isMenuOpen;
  const navBackgroundClass = isTransparentNav ? "bg-transparent border-transparent" : "bg-black/20 backdrop-blur-xl border-b border-white/5 shadow-2xl";
  const navTextColor = "text-white";
  const navIconColor = "text-white transition-colors duration-300 hover:text-attire-accent";
  const navVariants = {
    visible: { y: "0%", opacity: 1 },
    hidden: { y: "-100%", opacity: 0 }
  };
  const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    closed: {
      x: "-100%",
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  };
  const listVariants = {
    open: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  };
  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    closed: { y: 20, opacity: 0, transition: { duration: 0.3 } }
  };
  if (isLookbookFilterOpen && isMobile || isAdminRoute) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    !isMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "fixed top-0 left-0 right-0 h-24 z-40 bg-transparent",
        onMouseEnter: () => setIsHovered(true)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      motion.nav,
      {
        animate: isVisible ? "visible" : "hidden",
        initial: "visible",
        variants: navVariants,
        transition: { duration: 0.3 },
        className: `fixed top-0 left-0 right-0 z-50 ${navBackgroundClass}`,
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "max-w-7xl mx-auto px-6", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between h-20 md:h-24", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              onClick: () => setIsMenuOpen(true),
              className: "p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors",
              "aria-label": "Open menu",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: `w-6 h-6 ${navIconColor}` })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Link,
            {
              to: "/",
              className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                motion.div,
                {
                  animate: {
                    opacity: isTransparentNav ? 0 : 1,
                    y: isTransparentNav ? 10 : 0
                  },
                  initial: { opacity: 0, y: 10 },
                  transition: { duration: 0.4 },
                  className: "flex flex-col items-center",
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "span",
                    {
                      className: `font-serif text-lg md:text-xl font-medium tracking-[0.2em] uppercase ${navTextColor} group-hover:text-attire-accent transition-colors`,
                      children: "Attire Lounge Official"
                    }
                  )
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center space-x-1 md:space-x-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            Link,
            {
              to: "/favorites",
              className: "relative p-2 rounded-full hover:bg-white/10 transition-colors",
              "aria-label": "Favorites",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `w-5 h-5 ${navIconColor}` }),
                favorites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 right-1 block h-3 w-3 rounded-full bg-attire-accent border border-black shadow-sm" })
              ]
            }
          ) })
        ] }) })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: isMenuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.4 },
          className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-40",
          onClick: () => setIsMenuOpen(false)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        motion.div,
        {
          variants: sidebarVariants,
          initial: "closed",
          animate: "open",
          exit: "closed",
          className: "fixed top-0 left-0 bottom-0 w-full max-w-sm bg-attire-navy z-50 border-r border-white/10 shadow-2xl flex flex-col",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-8 flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-serif text-xl text-white tracking-[0.2em] uppercase", children: "Menu" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  onClick: () => setIsMenuOpen(false),
                  className: "p-2 rounded-full hover:bg-white/10 transition-colors text-white",
                  "aria-label": "Close menu",
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-6 h-6" })
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 overflow-y-auto px-6 py-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              motion.ul,
              {
                variants: listVariants,
                className: "space-y-2",
                children: navItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  motion.li,
                  {
                    variants: itemVariants,
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                      Link,
                      {
                        to: item.path,
                        onClick: () => setIsMenuOpen(false),
                        className: "group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-5", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-2 rounded-lg bg-white/5 text-white/50 group-hover:text-attire-accent group-hover:bg-attire-accent/10 transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "w-5 h-5" }) }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-serif text-lg text-white/80 group-hover:text-white tracking-wide transition-colors", children: item.name })
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" })
                        ]
                      }
                    )
                  },
                  item.name
                ))
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-8 border-t border-white/5", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col gap-4 text-center", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-white/30 uppercase tracking-widest", children: "Attire Lounge Official" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-[10px] text-white/20", children: [
                "\xA9 ",
                (/* @__PURE__ */ new Date()).getFullYear(),
                " All rights reserved."
              ] })
            ] }) })
          ]
        }
      )
    ] }) })
  ] });
};
var Navigation_default = Navigation;

// resources/js/components/common/PageTransition.jsx
var import_react3 = __toESM(require_react());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var PageTransition = ({ children }) => {
  const isPresent = useIsPresent();
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: "linear" },
        className: "w-full flex-grow flex flex-col",
        children
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      motion.div,
      {
        initial: { y: "100%" },
        animate: { y: isPresent ? "100%" : "0%" },
        exit: { y: "0%" },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        className: "fixed inset-0 z-[99999] bg-attire-navy flex flex-col items-center justify-center overflow-hidden",
        style: { pointerEvents: isPresent ? "none" : "auto" },
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: isPresent ? 0 : 1 },
            transition: { delay: 0.1, duration: 0.2 },
            className: "flex flex-col items-center",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "font-serif text-lg md:text-xl font-medium tracking-[0.2em] uppercase text-white/50", children: "Attire Lounge Official" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "w-12 h-px bg-attire-accent mt-4 opacity-50" })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      motion.div,
      {
        initial: { y: "0%" },
        animate: { y: "-100%" },
        transition: {
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.05
        },
        className: "fixed inset-0 z-[99998] bg-attire-navy pointer-events-none"
      }
    )
  ] });
};
var PageTransition_default = PageTransition;

// resources/js/components/MainApp.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 60 * 1e3,
      // Data is fresh for 30 minutes
      gcTime: 60 * 60 * 1e3
      // Keep unused data for 1 hour
    }
  }
});
var AppSuspense = () => {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react4.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(LoadingSpinner_default, {}), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(AnimatedRoutes, {}) });
};
var lazyWithRetry = (componentImport) => (0, import_react4.lazy)(async () => {
  const pageHasAlreadyBeenForceRefreshed = JSON.parse(
    window.localStorage.getItem("page-has-been-force-refreshed") || "false"
  );
  try {
    const component = await componentImport();
    window.localStorage.setItem("page-has-been-force-refreshed", "false");
    return component;
  } catch (error) {
    if (!pageHasAlreadyBeenForceRefreshed) {
      window.localStorage.setItem("page-has-been-force-refreshed", "true");
      return window.location.reload();
    }
    throw error;
  }
});
var HomePage = lazyWithRetry(() => import("./HomePage-D4P32CBT.js"));
var CollectionsPage = lazyWithRetry(() => import("./CollectionsPage-7J6ZRAEA.js"));
var ProductListPage = lazyWithRetry(() => import("./ProductListPage-5KF2WNNR.js"));
var ProductDetailPage = lazyWithRetry(() => import("./ProductDetailPage-GCANK74Z.js"));
var LookbookPage = lazyWithRetry(() => import("./LookbookPage-LQIUQNNZ.js"));
var FashionShowPage = lazyWithRetry(() => import("./FashionShowPage-BCVALZMR.js"));
var ContactPage = lazyWithRetry(() => import("./ContactPage-NNGI2QU2.js"));
var CustomizeGiftPage = lazyWithRetry(() => import("./CustomizeGiftPage-P7ZK6BNV.js"));
var FavoritesPage = lazyWithRetry(() => import("./FavoritesPage-ZVIK77LI.js"));
var PrivacyPolicyPage = lazyWithRetry(() => import("./PrivacyPolicyPage-SQ7MHYLB.js"));
var TermsOfServicePage = lazyWithRetry(() => import("./TermsOfServicePage-GECNAP7O.js"));
var ReturnPolicyPage = lazyWithRetry(() => import("./ReturnPolicyPage-JNIIYRMJ.js"));
var Placeholder = ({ title }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "min-h-screen pt-24 px-6", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "max-w-4xl mx-auto", children: [
  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { className: "text-2xl font-serif mb-4", children: title }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-gray-600", children: "Coming soon" })
] }) });
var Layout = ({ children, includeHeader = true, includeFooter = true, includePadding = true }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PageTransition_default, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "min-h-screen flex flex-col", children: [
    includeHeader && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Navigation_default, {}),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("main", { className: `flex-grow ${includePadding ? "pt-24 md:pt-0" : ""}`, children }),
    includeFooter && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Footer_default, {})
  ] }) });
};
var LenisScroll = () => {
  (0, import_react4.useEffect)(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-safari", isSafari().toString());
    }
    if (!window.lenis) {
      let raf2 = function(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf2);
      };
      var raf = raf2;
      const isSafariBrowser = isSafari();
      const lenis = new Lenis({
        duration: isSafariBrowser ? 1 : 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Exponential easing
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: isSafariBrowser ? 0.8 : 1,
        // Reduced for Safari
        touchMultiplier: 1.5,
        infinite: false
      });
      window.lenis = lenis;
      let rafId;
      rafId = requestAnimationFrame(raf2);
      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        window.lenis = null;
      };
    }
  }, []);
  return null;
};
var AnimatedRoutes = () => {
  const location = useLocation();
  const handleExitComplete = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      }
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(AnimatePresence, { mode: "wait", onExitComplete: handleExitComplete, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Routes, { location, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PageTransition_default, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "min-h-screen flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Navigation_default, {}),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("main", { className: "flex-grow", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(HomePage, {}) })
    ] }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/collections", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CollectionsPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/products", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ProductListPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/products/:collectionSlug", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ProductListPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/product/:productId", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { includeHeader: false, includeFooter: false, includePadding: false, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ProductDetailPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/lookbook", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(LookbookPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/fashion-show", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { includePadding: false, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FashionShowPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/contact", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ContactPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/customize-gift", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CustomizeGiftPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/favorites", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FavoritesPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/styling", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Placeholder, { title: "Styling" }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/journal", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Placeholder, { title: "Journal" }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/about", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Placeholder, { title: "About" }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/shipping", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Placeholder, { title: "Shipping" }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/privacy", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PrivacyPolicyPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/terms", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TermsOfServicePage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/returns", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReturnPolicyPage, {}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/appointment", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Placeholder, { title: "Appointment" }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/membership", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Placeholder, { title: "Membership" }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "/faq", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Placeholder, { title: "FAQ" }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Route, { path: "*", element: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Layout, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Placeholder, { title: "Page Not Found" }) }) })
  ] }, location.pathname) });
};
var GlobalStyles = () => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("style", { dangerouslySetInnerHTML: { __html: `
        *::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    ` } });
function MainApp() {
  usePullToRefresh_default(() => {
    queryClient.invalidateQueries();
    window.scrollTo(0, 0);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(HelmetProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(LazyMotion, { features: domAnimation, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(BrowserRouter, { future: { v7_startTransition: true, v7_relativeSplatPath: true }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GlobalStyles, {}),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(LenisScroll, {}),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(AppSuspense, {})
  ] }) }) }) });
}
var MainApp_default = MainApp;

// resources/js/app.jsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
var container = document.getElementById("app");
if (container) {
  const root = import_client.default.createRoot(container);
  root.render(
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_react5.default.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ErrorBoundary_default, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FavoritesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MainApp_default, {}) }) }) })
  );
} else {
  console.error("Root element not found");
}
//# sourceMappingURL=app.js.map
