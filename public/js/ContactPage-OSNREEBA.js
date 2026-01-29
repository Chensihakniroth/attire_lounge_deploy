import {
  useFavorites
} from "./chunk-42C6ZG54.js";
import {
  products
} from "./chunk-DDYLPRYX.js";
import {
  Check,
  ChevronDown,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send
} from "./chunk-MEGF3DJD.js";
import "./chunk-4VPB5FGN.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/ContactPage.jsx
var import_react21 = __toESM(require_react());

// node_modules/@headlessui/react/dist/hooks/use-computed.js
var import_react3 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js
var import_react = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/env.js
var i = Object.defineProperty;
var d = (t10, e2, n4) => e2 in t10 ? i(t10, e2, { enumerable: true, configurable: true, writable: true, value: n4 }) : t10[e2] = n4;
var r = (t10, e2, n4) => (d(t10, typeof e2 != "symbol" ? e2 + "" : e2, n4), n4);
var o = class {
  constructor() {
    r(this, "current", this.detect());
    r(this, "handoffState", "pending");
    r(this, "currentId", 0);
  }
  set(e2) {
    this.current !== e2 && (this.handoffState = "pending", this.currentId = 0, this.current = e2);
  }
  reset() {
    this.set(this.detect());
  }
  nextId() {
    return ++this.currentId;
  }
  get isServer() {
    return this.current === "server";
  }
  get isClient() {
    return this.current === "client";
  }
  detect() {
    return typeof window == "undefined" || typeof document == "undefined" ? "server" : "client";
  }
  handoff() {
    this.handoffState === "pending" && (this.handoffState = "complete");
  }
  get isHandoffComplete() {
    return this.handoffState === "complete";
  }
};
var s = new o();

// node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js
var l = (e2, f7) => {
  s.isServer ? (0, import_react.useEffect)(e2, f7) : (0, import_react.useLayoutEffect)(e2, f7);
};

// node_modules/@headlessui/react/dist/hooks/use-latest-value.js
var import_react2 = __toESM(require_react(), 1);
function s2(e2) {
  let r4 = (0, import_react2.useRef)(e2);
  return l(() => {
    r4.current = e2;
  }, [e2]), r4;
}

// node_modules/@headlessui/react/dist/hooks/use-computed.js
function i2(e2, o13) {
  let [u7, t10] = (0, import_react3.useState)(e2), r4 = s2(e2);
  return l(() => t10(r4.current), [r4, t10, ...o13]), u7;
}

// node_modules/@headlessui/react/dist/hooks/use-controllable.js
var import_react5 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-event.js
var import_react4 = __toESM(require_react(), 1);
var o2 = function(t10) {
  let e2 = s2(t10);
  return import_react4.default.useCallback((...r4) => e2.current(...r4), [e2]);
};

// node_modules/@headlessui/react/dist/hooks/use-controllable.js
function T(l8, r4, c6) {
  let [i7, s10] = (0, import_react5.useState)(c6), e2 = l8 !== void 0, t10 = (0, import_react5.useRef)(e2), u7 = (0, import_react5.useRef)(false), d6 = (0, import_react5.useRef)(false);
  return e2 && !t10.current && !u7.current ? (u7.current = true, t10.current = e2, console.error("A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen.")) : !e2 && t10.current && !d6.current && (d6.current = true, t10.current = e2, console.error("A component is changing from controlled to uncontrolled. This may be caused by the value changing from a defined value to undefined, which should not happen.")), [e2 ? l8 : i7, o2((n4) => (e2 || s10(n4), r4 == null ? void 0 : r4(n4)))];
}

// node_modules/@headlessui/react/dist/hooks/use-disposables.js
var import_react6 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/micro-task.js
function t3(e2) {
  typeof queueMicrotask == "function" ? queueMicrotask(e2) : Promise.resolve().then(e2).catch((o13) => setTimeout(() => {
    throw o13;
  }));
}

// node_modules/@headlessui/react/dist/utils/disposables.js
function o4() {
  let n4 = [], r4 = { addEventListener(e2, t10, s10, a3) {
    return e2.addEventListener(t10, s10, a3), r4.add(() => e2.removeEventListener(t10, s10, a3));
  }, requestAnimationFrame(...e2) {
    let t10 = requestAnimationFrame(...e2);
    return r4.add(() => cancelAnimationFrame(t10));
  }, nextFrame(...e2) {
    return r4.requestAnimationFrame(() => r4.requestAnimationFrame(...e2));
  }, setTimeout(...e2) {
    let t10 = setTimeout(...e2);
    return r4.add(() => clearTimeout(t10));
  }, microTask(...e2) {
    let t10 = { current: true };
    return t3(() => {
      t10.current && e2[0]();
    }), r4.add(() => {
      t10.current = false;
    });
  }, style(e2, t10, s10) {
    let a3 = e2.style.getPropertyValue(t10);
    return Object.assign(e2.style, { [t10]: s10 }), this.add(() => {
      Object.assign(e2.style, { [t10]: a3 });
    });
  }, group(e2) {
    let t10 = o4();
    return e2(t10), this.add(() => t10.dispose());
  }, add(e2) {
    return n4.push(e2), () => {
      let t10 = n4.indexOf(e2);
      if (t10 >= 0) for (let s10 of n4.splice(t10, 1)) s10();
    };
  }, dispose() {
    for (let e2 of n4.splice(0)) e2();
  } };
  return r4;
}

// node_modules/@headlessui/react/dist/hooks/use-disposables.js
function p() {
  let [e2] = (0, import_react6.useState)(o4);
  return (0, import_react6.useEffect)(() => () => e2.dispose(), [e2]), e2;
}

// node_modules/@headlessui/react/dist/hooks/use-id.js
var import_react7 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-server-handoff-complete.js
var t4 = __toESM(require_react(), 1);
function s5() {
  let r4 = typeof document == "undefined";
  return "useSyncExternalStore" in t4 ? ((o13) => o13.useSyncExternalStore)(t4)(() => () => {
  }, () => false, () => !r4) : false;
}
function l2() {
  let r4 = s5(), [e2, n4] = t4.useState(s.isHandoffComplete);
  return e2 && s.isHandoffComplete === false && n4(false), t4.useEffect(() => {
    e2 !== true && n4(true);
  }, [e2]), t4.useEffect(() => s.handoff(), []), r4 ? false : e2;
}

// node_modules/@headlessui/react/dist/hooks/use-id.js
var o6;
var I = (o6 = import_react7.default.useId) != null ? o6 : function() {
  let n4 = l2(), [e2, u7] = import_react7.default.useState(n4 ? () => s.nextId() : null);
  return l(() => {
    e2 === null && u7(s.nextId());
  }, [e2]), e2 != null ? "" + e2 : void 0;
};

// node_modules/@headlessui/react/dist/hooks/use-outside-click.js
var import_react10 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/match.js
function u(r4, n4, ...a3) {
  if (r4 in n4) {
    let e2 = n4[r4];
    return typeof e2 == "function" ? e2(...a3) : e2;
  }
  let t10 = new Error(`Tried to handle "${r4}" but there is no handler defined. Only defined handlers are: ${Object.keys(n4).map((e2) => `"${e2}"`).join(", ")}.`);
  throw Error.captureStackTrace && Error.captureStackTrace(t10, u), t10;
}

// node_modules/@headlessui/react/dist/utils/owner.js
function o7(r4) {
  return s.isServer ? null : r4 instanceof Node ? r4.ownerDocument : r4 != null && r4.hasOwnProperty("current") && r4.current instanceof Node ? r4.current.ownerDocument : document;
}

// node_modules/@headlessui/react/dist/utils/focus-management.js
var c2 = ["[contentEditable=true]", "[tabindex]", "a[href]", "area[href]", "button:not([disabled])", "iframe", "input:not([disabled])", "select:not([disabled])", "textarea:not([disabled])"].map((e2) => `${e2}:not([tabindex='-1'])`).join(",");
var M = ((n4) => (n4[n4.First = 1] = "First", n4[n4.Previous = 2] = "Previous", n4[n4.Next = 4] = "Next", n4[n4.Last = 8] = "Last", n4[n4.WrapAround = 16] = "WrapAround", n4[n4.NoScroll = 32] = "NoScroll", n4))(M || {});
var N = ((o13) => (o13[o13.Error = 0] = "Error", o13[o13.Overflow = 1] = "Overflow", o13[o13.Success = 2] = "Success", o13[o13.Underflow = 3] = "Underflow", o13))(N || {});
var F = ((t10) => (t10[t10.Previous = -1] = "Previous", t10[t10.Next = 1] = "Next", t10))(F || {});
var T2 = ((t10) => (t10[t10.Strict = 0] = "Strict", t10[t10.Loose = 1] = "Loose", t10))(T2 || {});
function h(e2, r4 = 0) {
  var t10;
  return e2 === ((t10 = o7(e2)) == null ? void 0 : t10.body) ? false : u(r4, { [0]() {
    return e2.matches(c2);
  }, [1]() {
    let l8 = e2;
    for (; l8 !== null; ) {
      if (l8.matches(c2)) return true;
      l8 = l8.parentElement;
    }
    return false;
  } });
}
var w = ((t10) => (t10[t10.Keyboard = 0] = "Keyboard", t10[t10.Mouse = 1] = "Mouse", t10))(w || {});
typeof window != "undefined" && typeof document != "undefined" && (document.addEventListener("keydown", (e2) => {
  e2.metaKey || e2.altKey || e2.ctrlKey || (document.documentElement.dataset.headlessuiFocusVisible = "");
}, true), document.addEventListener("click", (e2) => {
  e2.detail === 1 ? delete document.documentElement.dataset.headlessuiFocusVisible : e2.detail === 0 && (document.documentElement.dataset.headlessuiFocusVisible = "");
}, true));
var S = ["textarea", "input"].join(",");
function I2(e2, r4 = (t10) => t10) {
  return e2.slice().sort((t10, l8) => {
    let o13 = r4(t10), i7 = r4(l8);
    if (o13 === null || i7 === null) return 0;
    let n4 = o13.compareDocumentPosition(i7);
    return n4 & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : n4 & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
  });
}

// node_modules/@headlessui/react/dist/utils/platform.js
function t6() {
  return /iPhone/gi.test(window.navigator.platform) || /Mac/gi.test(window.navigator.platform) && window.navigator.maxTouchPoints > 0;
}
function i3() {
  return /Android/gi.test(window.navigator.userAgent);
}
function n() {
  return t6() || i3();
}

// node_modules/@headlessui/react/dist/hooks/use-document-event.js
var import_react8 = __toESM(require_react(), 1);
function d2(e2, r4, n4) {
  let o13 = s2(r4);
  (0, import_react8.useEffect)(() => {
    function t10(u7) {
      o13.current(u7);
    }
    return document.addEventListener(e2, t10, n4), () => document.removeEventListener(e2, t10, n4);
  }, [e2, n4]);
}

// node_modules/@headlessui/react/dist/hooks/use-window-event.js
var import_react9 = __toESM(require_react(), 1);
function s6(e2, r4, n4) {
  let o13 = s2(r4);
  (0, import_react9.useEffect)(() => {
    function t10(i7) {
      o13.current(i7);
    }
    return window.addEventListener(e2, t10, n4), () => window.removeEventListener(e2, t10, n4);
  }, [e2, n4]);
}

// node_modules/@headlessui/react/dist/hooks/use-outside-click.js
function y(s10, m4, a3 = true) {
  let i7 = (0, import_react10.useRef)(false);
  (0, import_react10.useEffect)(() => {
    requestAnimationFrame(() => {
      i7.current = a3;
    });
  }, [a3]);
  function c6(e2, r4) {
    if (!i7.current || e2.defaultPrevented) return;
    let t10 = r4(e2);
    if (t10 === null || !t10.getRootNode().contains(t10) || !t10.isConnected) return;
    let E3 = (function u7(n4) {
      return typeof n4 == "function" ? u7(n4()) : Array.isArray(n4) || n4 instanceof Set ? n4 : [n4];
    })(s10);
    for (let u7 of E3) {
      if (u7 === null) continue;
      let n4 = u7 instanceof HTMLElement ? u7 : u7.current;
      if (n4 != null && n4.contains(t10) || e2.composed && e2.composedPath().includes(n4)) return;
    }
    return !h(t10, T2.Loose) && t10.tabIndex !== -1 && e2.preventDefault(), m4(e2, t10);
  }
  let o13 = (0, import_react10.useRef)(null);
  d2("pointerdown", (e2) => {
    var r4, t10;
    i7.current && (o13.current = ((t10 = (r4 = e2.composedPath) == null ? void 0 : r4.call(e2)) == null ? void 0 : t10[0]) || e2.target);
  }, true), d2("mousedown", (e2) => {
    var r4, t10;
    i7.current && (o13.current = ((t10 = (r4 = e2.composedPath) == null ? void 0 : r4.call(e2)) == null ? void 0 : t10[0]) || e2.target);
  }, true), d2("click", (e2) => {
    n() || o13.current && (c6(e2, () => o13.current), o13.current = null);
  }, true), d2("touchend", (e2) => c6(e2, () => e2.target instanceof HTMLElement ? e2.target : null), true), s6("blur", (e2) => c6(e2, () => window.document.activeElement instanceof HTMLIFrameElement ? window.document.activeElement : null), true);
}

// node_modules/@headlessui/react/dist/hooks/use-resolve-button-type.js
var import_react11 = __toESM(require_react(), 1);
function i4(t10) {
  var n4;
  if (t10.type) return t10.type;
  let e2 = (n4 = t10.as) != null ? n4 : "button";
  if (typeof e2 == "string" && e2.toLowerCase() === "button") return "button";
}
function T3(t10, e2) {
  let [n4, u7] = (0, import_react11.useState)(() => i4(t10));
  return l(() => {
    u7(i4(t10));
  }, [t10.type, t10.as]), l(() => {
    n4 || e2.current && e2.current instanceof HTMLButtonElement && !e2.current.hasAttribute("type") && u7("button");
  }, [n4, e2]), n4;
}

// node_modules/@headlessui/react/dist/hooks/use-sync-refs.js
var import_react12 = __toESM(require_react(), 1);
var u2 = /* @__PURE__ */ Symbol();
function y2(...t10) {
  let n4 = (0, import_react12.useRef)(t10);
  (0, import_react12.useEffect)(() => {
    n4.current = t10;
  }, [t10]);
  let c6 = o2((e2) => {
    for (let o13 of n4.current) o13 != null && (typeof o13 == "function" ? o13(e2) : o13.current = e2);
  });
  return t10.every((e2) => e2 == null || (e2 == null ? void 0 : e2[u2])) ? void 0 : c6;
}

// node_modules/@headlessui/react/dist/hooks/use-tracked-pointer.js
var import_react13 = __toESM(require_react(), 1);
function t7(e2) {
  return [e2.screenX, e2.screenY];
}
function u3() {
  let e2 = (0, import_react13.useRef)([-1, -1]);
  return { wasMoved(r4) {
    let n4 = t7(r4);
    return e2.current[0] === n4[0] && e2.current[1] === n4[1] ? false : (e2.current = n4, true);
  }, update(r4) {
    e2.current = t7(r4);
  } };
}

// node_modules/@headlessui/react/dist/utils/render.js
var import_react14 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/class-names.js
function t8(...r4) {
  return Array.from(new Set(r4.flatMap((n4) => typeof n4 == "string" ? n4.split(" ") : []))).filter(Boolean).join(" ");
}

// node_modules/@headlessui/react/dist/utils/render.js
var O = ((n4) => (n4[n4.None = 0] = "None", n4[n4.RenderStrategy = 1] = "RenderStrategy", n4[n4.Static = 2] = "Static", n4))(O || {});
var v = ((e2) => (e2[e2.Unmount = 0] = "Unmount", e2[e2.Hidden = 1] = "Hidden", e2))(v || {});
function C({ ourProps: r4, theirProps: t10, slot: e2, defaultTag: n4, features: o13, visible: a3 = true, name: f7, mergeRefs: l8 }) {
  l8 = l8 != null ? l8 : k;
  let s10 = R(t10, r4);
  if (a3) return m2(s10, e2, n4, f7, l8);
  let y3 = o13 != null ? o13 : 0;
  if (y3 & 2) {
    let { static: u7 = false, ...d6 } = s10;
    if (u7) return m2(d6, e2, n4, f7, l8);
  }
  if (y3 & 1) {
    let { unmount: u7 = true, ...d6 } = s10;
    return u(u7 ? 0 : 1, { [0]() {
      return null;
    }, [1]() {
      return m2({ ...d6, hidden: true, style: { display: "none" } }, e2, n4, f7, l8);
    } });
  }
  return m2(s10, e2, n4, f7, l8);
}
function m2(r4, t10 = {}, e2, n4, o13) {
  let { as: a3 = e2, children: f7, refName: l8 = "ref", ...s10 } = F2(r4, ["unmount", "static"]), y3 = r4.ref !== void 0 ? { [l8]: r4.ref } : {}, u7 = typeof f7 == "function" ? f7(t10) : f7;
  "className" in s10 && s10.className && typeof s10.className == "function" && (s10.className = s10.className(t10));
  let d6 = {};
  if (t10) {
    let i7 = false, c6 = [];
    for (let [T4, p4] of Object.entries(t10)) typeof p4 == "boolean" && (i7 = true), p4 === true && c6.push(T4);
    i7 && (d6["data-headlessui-state"] = c6.join(" "));
  }
  if (a3 === import_react14.Fragment && Object.keys(x(s10)).length > 0) {
    if (!(0, import_react14.isValidElement)(u7) || Array.isArray(u7) && u7.length > 1) throw new Error(['Passing props on "Fragment"!', "", `The current component <${n4} /> is rendering a "Fragment".`, "However we need to passthrough the following props:", Object.keys(s10).map((p4) => `  - ${p4}`).join(`
`), "", "You can apply a few solutions:", ['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".', "Render a single element as the child so that we can forward the props onto that element."].map((p4) => `  - ${p4}`).join(`
`)].join(`
`));
    let i7 = u7.props, c6 = typeof (i7 == null ? void 0 : i7.className) == "function" ? (...p4) => t8(i7 == null ? void 0 : i7.className(...p4), s10.className) : t8(i7 == null ? void 0 : i7.className, s10.className), T4 = c6 ? { className: c6 } : {};
    return (0, import_react14.cloneElement)(u7, Object.assign({}, R(u7.props, x(F2(s10, ["ref"]))), d6, y3, { ref: o13(u7.ref, y3.ref) }, T4));
  }
  return (0, import_react14.createElement)(a3, Object.assign({}, F2(s10, ["ref"]), a3 !== import_react14.Fragment && y3, a3 !== import_react14.Fragment && d6), u7);
}
function k(...r4) {
  return r4.every((t10) => t10 == null) ? void 0 : (t10) => {
    for (let e2 of r4) e2 != null && (typeof e2 == "function" ? e2(t10) : e2.current = t10);
  };
}
function R(...r4) {
  var n4;
  if (r4.length === 0) return {};
  if (r4.length === 1) return r4[0];
  let t10 = {}, e2 = {};
  for (let o13 of r4) for (let a3 in o13) a3.startsWith("on") && typeof o13[a3] == "function" ? ((n4 = e2[a3]) != null || (e2[a3] = []), e2[a3].push(o13[a3])) : t10[a3] = o13[a3];
  if (t10.disabled || t10["aria-disabled"]) return Object.assign(t10, Object.fromEntries(Object.keys(e2).map((o13) => [o13, void 0])));
  for (let o13 in e2) Object.assign(t10, { [o13](a3, ...f7) {
    let l8 = e2[o13];
    for (let s10 of l8) {
      if ((a3 instanceof Event || (a3 == null ? void 0 : a3.nativeEvent) instanceof Event) && a3.defaultPrevented) return;
      s10(a3, ...f7);
    }
  } });
  return t10;
}
function U(r4) {
  var t10;
  return Object.assign((0, import_react14.forwardRef)(r4), { displayName: (t10 = r4.displayName) != null ? t10 : r4.name });
}
function x(r4) {
  let t10 = Object.assign({}, r4);
  for (let e2 in t10) t10[e2] === void 0 && delete t10[e2];
  return t10;
}
function F2(r4, t10 = []) {
  let e2 = Object.assign({}, r4);
  for (let n4 of t10) n4 in e2 && delete e2[n4];
  return e2;
}

// node_modules/@headlessui/react/dist/internal/hidden.js
var p2 = "div";
var s7 = ((e2) => (e2[e2.None = 1] = "None", e2[e2.Focusable = 2] = "Focusable", e2[e2.Hidden = 4] = "Hidden", e2))(s7 || {});
function l4(d6, o13) {
  var n4;
  let { features: t10 = 1, ...e2 } = d6, r4 = { ref: o13, "aria-hidden": (t10 & 2) === 2 ? true : (n4 = e2["aria-hidden"]) != null ? n4 : void 0, hidden: (t10 & 4) === 4 ? true : void 0, style: { position: "fixed", top: 1, left: 1, width: 1, height: 0, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0", ...(t10 & 4) === 4 && (t10 & 2) !== 2 && { display: "none" } } };
  return C({ ourProps: r4, theirProps: e2, slot: {}, defaultTag: p2, name: "Hidden" });
}
var u4 = U(l4);

// node_modules/@headlessui/react/dist/internal/open-closed.js
var import_react15 = __toESM(require_react(), 1);
var n2 = (0, import_react15.createContext)(null);
n2.displayName = "OpenClosedContext";
var d5 = ((e2) => (e2[e2.Open = 1] = "Open", e2[e2.Closed = 2] = "Closed", e2[e2.Closing = 4] = "Closing", e2[e2.Opening = 8] = "Opening", e2))(d5 || {});
function u5() {
  return (0, import_react15.useContext)(n2);
}
function s8({ value: o13, children: r4 }) {
  return import_react15.default.createElement(n2.Provider, { value: o13 }, r4);
}

// node_modules/@headlessui/react/dist/utils/bugs.js
function r2(n4) {
  let e2 = n4.parentElement, l8 = null;
  for (; e2 && !(e2 instanceof HTMLFieldSetElement); ) e2 instanceof HTMLLegendElement && (l8 = e2), e2 = e2.parentElement;
  let t10 = (e2 == null ? void 0 : e2.getAttribute("disabled")) === "";
  return t10 && i6(l8) ? false : t10;
}
function i6(n4) {
  if (!n4) return false;
  let e2 = n4.previousElementSibling;
  for (; e2 !== null; ) {
    if (e2 instanceof HTMLLegendElement) return false;
    e2 = e2.previousElementSibling;
  }
  return true;
}

// node_modules/@headlessui/react/dist/utils/calculate-active-index.js
function u6(l8) {
  throw new Error("Unexpected object: " + l8);
}
var c3 = ((i7) => (i7[i7.First = 0] = "First", i7[i7.Previous = 1] = "Previous", i7[i7.Next = 2] = "Next", i7[i7.Last = 3] = "Last", i7[i7.Specific = 4] = "Specific", i7[i7.Nothing = 5] = "Nothing", i7))(c3 || {});
function f3(l8, n4) {
  let t10 = n4.resolveItems();
  if (t10.length <= 0) return null;
  let r4 = n4.resolveActiveIndex(), s10 = r4 != null ? r4 : -1;
  switch (l8.focus) {
    case 0: {
      for (let e2 = 0; e2 < t10.length; ++e2) if (!n4.resolveDisabled(t10[e2], e2, t10)) return e2;
      return r4;
    }
    case 1: {
      for (let e2 = s10 - 1; e2 >= 0; --e2) if (!n4.resolveDisabled(t10[e2], e2, t10)) return e2;
      return r4;
    }
    case 2: {
      for (let e2 = s10 + 1; e2 < t10.length; ++e2) if (!n4.resolveDisabled(t10[e2], e2, t10)) return e2;
      return r4;
    }
    case 3: {
      for (let e2 = t10.length - 1; e2 >= 0; --e2) if (!n4.resolveDisabled(t10[e2], e2, t10)) return e2;
      return r4;
    }
    case 4: {
      for (let e2 = 0; e2 < t10.length; ++e2) if (n4.resolveId(t10[e2], e2, t10) === l8.id) return e2;
      return r4;
    }
    case 5:
      return null;
    default:
      u6(l8);
  }
}

// node_modules/@headlessui/react/dist/utils/form.js
function e(i7 = {}, s10 = null, t10 = []) {
  for (let [r4, n4] of Object.entries(i7)) o10(t10, f4(s10, r4), n4);
  return t10;
}
function f4(i7, s10) {
  return i7 ? i7 + "[" + s10 + "]" : s10;
}
function o10(i7, s10, t10) {
  if (Array.isArray(t10)) for (let [r4, n4] of t10.entries()) o10(i7, f4(s10, r4.toString()), n4);
  else t10 instanceof Date ? i7.push([s10, t10.toISOString()]) : typeof t10 == "boolean" ? i7.push([s10, t10 ? "1" : "0"]) : typeof t10 == "string" ? i7.push([s10, t10]) : typeof t10 == "number" ? i7.push([s10, `${t10}`]) : t10 == null ? i7.push([s10, ""]) : e(t10, s10, i7);
}

// node_modules/@headlessui/react/dist/components/keyboard.js
var o11 = ((r4) => (r4.Space = " ", r4.Enter = "Enter", r4.Escape = "Escape", r4.Backspace = "Backspace", r4.Delete = "Delete", r4.ArrowLeft = "ArrowLeft", r4.ArrowUp = "ArrowUp", r4.ArrowRight = "ArrowRight", r4.ArrowDown = "ArrowDown", r4.Home = "Home", r4.End = "End", r4.PageUp = "PageUp", r4.PageDown = "PageDown", r4.Tab = "Tab", r4))(o11 || {});

// node_modules/@headlessui/react/dist/hooks/use-is-mounted.js
var import_react16 = __toESM(require_react(), 1);
function f5() {
  let e2 = (0, import_react16.useRef)(false);
  return l(() => (e2.current = true, () => {
    e2.current = false;
  }), []), e2;
}

// node_modules/@headlessui/react/dist/components/listbox/listbox.js
var import_react18 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-text-value.js
var import_react17 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/get-text-value.js
var a2 = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
function o12(e2) {
  var r4, i7;
  let n4 = (r4 = e2.innerText) != null ? r4 : "", t10 = e2.cloneNode(true);
  if (!(t10 instanceof HTMLElement)) return n4;
  let u7 = false;
  for (let f7 of t10.querySelectorAll('[hidden],[aria-hidden],[role="img"]')) f7.remove(), u7 = true;
  let l8 = u7 ? (i7 = t10.innerText) != null ? i7 : "" : n4;
  return a2.test(l8) && (l8 = l8.replace(a2, "")), l8;
}
function g2(e2) {
  let n4 = e2.getAttribute("aria-label");
  if (typeof n4 == "string") return n4.trim();
  let t10 = e2.getAttribute("aria-labelledby");
  if (t10) {
    let u7 = t10.split(" ").map((l8) => {
      let r4 = document.getElementById(l8);
      if (r4) {
        let i7 = r4.getAttribute("aria-label");
        return typeof i7 == "string" ? i7.trim() : o12(r4).trim();
      }
      return null;
    }).filter(Boolean);
    if (u7.length > 0) return u7.join(", ");
  }
  return o12(e2).trim();
}

// node_modules/@headlessui/react/dist/hooks/use-text-value.js
function s9(c6) {
  let t10 = (0, import_react17.useRef)(""), r4 = (0, import_react17.useRef)("");
  return o2(() => {
    let e2 = c6.current;
    if (!e2) return "";
    let u7 = e2.innerText;
    if (t10.current === u7) return r4.current;
    let n4 = g2(e2).trim().toLowerCase();
    return t10.current = u7, r4.current = n4, n4;
  });
}

// node_modules/@headlessui/react/dist/components/listbox/listbox.js
var Be = ((n4) => (n4[n4.Open = 0] = "Open", n4[n4.Closed = 1] = "Closed", n4))(Be || {});
var He = ((n4) => (n4[n4.Single = 0] = "Single", n4[n4.Multi = 1] = "Multi", n4))(He || {});
var Ge = ((n4) => (n4[n4.Pointer = 0] = "Pointer", n4[n4.Other = 1] = "Other", n4))(Ge || {});
var Ne = ((i7) => (i7[i7.OpenListbox = 0] = "OpenListbox", i7[i7.CloseListbox = 1] = "CloseListbox", i7[i7.GoToOption = 2] = "GoToOption", i7[i7.Search = 3] = "Search", i7[i7.ClearSearch = 4] = "ClearSearch", i7[i7.RegisterOption = 5] = "RegisterOption", i7[i7.UnregisterOption = 6] = "UnregisterOption", i7[i7.RegisterLabel = 7] = "RegisterLabel", i7))(Ne || {});
function z(e2, a3 = (n4) => n4) {
  let n4 = e2.activeOptionIndex !== null ? e2.options[e2.activeOptionIndex] : null, r4 = I2(a3(e2.options.slice()), (t10) => t10.dataRef.current.domRef.current), l8 = n4 ? r4.indexOf(n4) : null;
  return l8 === -1 && (l8 = null), { options: r4, activeOptionIndex: l8 };
}
var je = { [1](e2) {
  return e2.dataRef.current.disabled || e2.listboxState === 1 ? e2 : { ...e2, activeOptionIndex: null, listboxState: 1 };
}, [0](e2) {
  if (e2.dataRef.current.disabled || e2.listboxState === 0) return e2;
  let a3 = e2.activeOptionIndex, { isSelected: n4 } = e2.dataRef.current, r4 = e2.options.findIndex((l8) => n4(l8.dataRef.current.value));
  return r4 !== -1 && (a3 = r4), { ...e2, listboxState: 0, activeOptionIndex: a3 };
}, [2](e2, a3) {
  var l8;
  if (e2.dataRef.current.disabled || e2.listboxState === 1) return e2;
  let n4 = z(e2), r4 = f3(a3, { resolveItems: () => n4.options, resolveActiveIndex: () => n4.activeOptionIndex, resolveId: (t10) => t10.id, resolveDisabled: (t10) => t10.dataRef.current.disabled });
  return { ...e2, ...n4, searchQuery: "", activeOptionIndex: r4, activationTrigger: (l8 = a3.trigger) != null ? l8 : 1 };
}, [3]: (e2, a3) => {
  if (e2.dataRef.current.disabled || e2.listboxState === 1) return e2;
  let r4 = e2.searchQuery !== "" ? 0 : 1, l8 = e2.searchQuery + a3.value.toLowerCase(), p4 = (e2.activeOptionIndex !== null ? e2.options.slice(e2.activeOptionIndex + r4).concat(e2.options.slice(0, e2.activeOptionIndex + r4)) : e2.options).find((i7) => {
    var b2;
    return !i7.dataRef.current.disabled && ((b2 = i7.dataRef.current.textValue) == null ? void 0 : b2.startsWith(l8));
  }), u7 = p4 ? e2.options.indexOf(p4) : -1;
  return u7 === -1 || u7 === e2.activeOptionIndex ? { ...e2, searchQuery: l8 } : { ...e2, searchQuery: l8, activeOptionIndex: u7, activationTrigger: 1 };
}, [4](e2) {
  return e2.dataRef.current.disabled || e2.listboxState === 1 || e2.searchQuery === "" ? e2 : { ...e2, searchQuery: "" };
}, [5]: (e2, a3) => {
  let n4 = { id: a3.id, dataRef: a3.dataRef }, r4 = z(e2, (l8) => [...l8, n4]);
  return e2.activeOptionIndex === null && e2.dataRef.current.isSelected(a3.dataRef.current.value) && (r4.activeOptionIndex = r4.options.indexOf(n4)), { ...e2, ...r4 };
}, [6]: (e2, a3) => {
  let n4 = z(e2, (r4) => {
    let l8 = r4.findIndex((t10) => t10.id === a3.id);
    return l8 !== -1 && r4.splice(l8, 1), r4;
  });
  return { ...e2, ...n4, activationTrigger: 1 };
}, [7]: (e2, a3) => ({ ...e2, labelId: a3.id }) };
var J = (0, import_react18.createContext)(null);
J.displayName = "ListboxActionsContext";
function k2(e2) {
  let a3 = (0, import_react18.useContext)(J);
  if (a3 === null) {
    let n4 = new Error(`<${e2} /> is missing a parent <Listbox /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(n4, k2), n4;
  }
  return a3;
}
var q = (0, import_react18.createContext)(null);
q.displayName = "ListboxDataContext";
function w2(e2) {
  let a3 = (0, import_react18.useContext)(q);
  if (a3 === null) {
    let n4 = new Error(`<${e2} /> is missing a parent <Listbox /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(n4, w2), n4;
  }
  return a3;
}
function Ve(e2, a3) {
  return u(a3.type, je, e2, a3);
}
var Ke = import_react18.Fragment;
function Qe(e2, a3) {
  let { value: n4, defaultValue: r4, form: l8, name: t10, onChange: p4, by: u7 = (s10, c6) => s10 === c6, disabled: i7 = false, horizontal: b2 = false, multiple: R2 = false, ...m4 } = e2;
  const P2 = b2 ? "horizontal" : "vertical";
  let S4 = y2(a3), [g4 = R2 ? [] : void 0, x2] = T(n4, p4, r4), [T4, o13] = (0, import_react18.useReducer)(Ve, { dataRef: (0, import_react18.createRef)(), listboxState: 1, options: [], searchQuery: "", labelId: null, activeOptionIndex: null, activationTrigger: 1 }), L = (0, import_react18.useRef)({ static: false, hold: false }), U3 = (0, import_react18.useRef)(null), B = (0, import_react18.useRef)(null), W = (0, import_react18.useRef)(null), I4 = o2(typeof u7 == "string" ? (s10, c6) => {
    let O2 = u7;
    return (s10 == null ? void 0 : s10[O2]) === (c6 == null ? void 0 : c6[O2]);
  } : u7), A = (0, import_react18.useCallback)((s10) => u(d6.mode, { [1]: () => g4.some((c6) => I4(c6, s10)), [0]: () => I4(g4, s10) }), [g4]), d6 = (0, import_react18.useMemo)(() => ({ ...T4, value: g4, disabled: i7, mode: R2 ? 1 : 0, orientation: P2, compare: I4, isSelected: A, optionsPropsRef: L, labelRef: U3, buttonRef: B, optionsRef: W }), [g4, i7, R2, T4]);
  l(() => {
    T4.dataRef.current = d6;
  }, [d6]), y([d6.buttonRef, d6.optionsRef], (s10, c6) => {
    var O2;
    o13({ type: 1 }), h(c6, T2.Loose) || (s10.preventDefault(), (O2 = d6.buttonRef.current) == null || O2.focus());
  }, d6.listboxState === 0);
  let H = (0, import_react18.useMemo)(() => ({ open: d6.listboxState === 0, disabled: i7, value: g4 }), [d6, i7, g4]), ie = o2((s10) => {
    let c6 = d6.options.find((O2) => O2.id === s10);
    c6 && X2(c6.dataRef.current.value);
  }), re = o2(() => {
    if (d6.activeOptionIndex !== null) {
      let { dataRef: s10, id: c6 } = d6.options[d6.activeOptionIndex];
      X2(s10.current.value), o13({ type: 2, focus: c3.Specific, id: c6 });
    }
  }), ae2 = o2(() => o13({ type: 0 })), le2 = o2(() => o13({ type: 1 })), se2 = o2((s10, c6, O2) => s10 === c3.Specific ? o13({ type: 2, focus: c3.Specific, id: c6, trigger: O2 }) : o13({ type: 2, focus: s10, trigger: O2 })), pe = o2((s10, c6) => (o13({ type: 5, id: s10, dataRef: c6 }), () => o13({ type: 6, id: s10 }))), ue2 = o2((s10) => (o13({ type: 7, id: s10 }), () => o13({ type: 7, id: null }))), X2 = o2((s10) => u(d6.mode, { [0]() {
    return x2 == null ? void 0 : x2(s10);
  }, [1]() {
    let c6 = d6.value.slice(), O2 = c6.findIndex((C2) => I4(C2, s10));
    return O2 === -1 ? c6.push(s10) : c6.splice(O2, 1), x2 == null ? void 0 : x2(c6);
  } })), de = o2((s10) => o13({ type: 3, value: s10 })), ce = o2(() => o13({ type: 4 })), fe = (0, import_react18.useMemo)(() => ({ onChange: X2, registerOption: pe, registerLabel: ue2, goToOption: se2, closeListbox: le2, openListbox: ae2, selectActiveOption: re, selectOption: ie, search: de, clearSearch: ce }), []), Te = { ref: S4 }, G = (0, import_react18.useRef)(null), be = p();
  return (0, import_react18.useEffect)(() => {
    G.current && r4 !== void 0 && be.addEventListener(G.current, "reset", () => {
      x2 == null || x2(r4);
    });
  }, [G, x2]), import_react18.default.createElement(J.Provider, { value: fe }, import_react18.default.createElement(q.Provider, { value: d6 }, import_react18.default.createElement(s8, { value: u(d6.listboxState, { [0]: d5.Open, [1]: d5.Closed }) }, t10 != null && g4 != null && e({ [t10]: g4 }).map(([s10, c6], O2) => import_react18.default.createElement(u4, { features: s7.Hidden, ref: O2 === 0 ? (C2) => {
    var Y;
    G.current = (Y = C2 == null ? void 0 : C2.closest("form")) != null ? Y : null;
  } : void 0, ...x({ key: s10, as: "input", type: "hidden", hidden: true, readOnly: true, form: l8, disabled: i7, name: s10, value: c6 }) })), C({ ourProps: Te, theirProps: m4, slot: H, defaultTag: Ke, name: "Listbox" }))));
}
var We = "button";
function Xe(e2, a3) {
  var x2;
  let n4 = I(), { id: r4 = `headlessui-listbox-button-${n4}`, ...l8 } = e2, t10 = w2("Listbox.Button"), p4 = k2("Listbox.Button"), u7 = y2(t10.buttonRef, a3), i7 = p(), b2 = o2((T4) => {
    switch (T4.key) {
      case o11.Space:
      case o11.Enter:
      case o11.ArrowDown:
        T4.preventDefault(), p4.openListbox(), i7.nextFrame(() => {
          t10.value || p4.goToOption(c3.First);
        });
        break;
      case o11.ArrowUp:
        T4.preventDefault(), p4.openListbox(), i7.nextFrame(() => {
          t10.value || p4.goToOption(c3.Last);
        });
        break;
    }
  }), R2 = o2((T4) => {
    switch (T4.key) {
      case o11.Space:
        T4.preventDefault();
        break;
    }
  }), m4 = o2((T4) => {
    if (r2(T4.currentTarget)) return T4.preventDefault();
    t10.listboxState === 0 ? (p4.closeListbox(), i7.nextFrame(() => {
      var o13;
      return (o13 = t10.buttonRef.current) == null ? void 0 : o13.focus({ preventScroll: true });
    })) : (T4.preventDefault(), p4.openListbox());
  }), P2 = i2(() => {
    if (t10.labelId) return [t10.labelId, r4].join(" ");
  }, [t10.labelId, r4]), S4 = (0, import_react18.useMemo)(() => ({ open: t10.listboxState === 0, disabled: t10.disabled, value: t10.value }), [t10]), g4 = { ref: u7, id: r4, type: T3(e2, t10.buttonRef), "aria-haspopup": "listbox", "aria-controls": (x2 = t10.optionsRef.current) == null ? void 0 : x2.id, "aria-expanded": t10.listboxState === 0, "aria-labelledby": P2, disabled: t10.disabled, onKeyDown: b2, onKeyUp: R2, onClick: m4 };
  return C({ ourProps: g4, theirProps: l8, slot: S4, defaultTag: We, name: "Listbox.Button" });
}
var $e = "label";
function ze(e2, a3) {
  let n4 = I(), { id: r4 = `headlessui-listbox-label-${n4}`, ...l8 } = e2, t10 = w2("Listbox.Label"), p4 = k2("Listbox.Label"), u7 = y2(t10.labelRef, a3);
  l(() => p4.registerLabel(r4), [r4]);
  let i7 = o2(() => {
    var m4;
    return (m4 = t10.buttonRef.current) == null ? void 0 : m4.focus({ preventScroll: true });
  }), b2 = (0, import_react18.useMemo)(() => ({ open: t10.listboxState === 0, disabled: t10.disabled }), [t10]);
  return C({ ourProps: { ref: u7, id: r4, onClick: i7 }, theirProps: l8, slot: b2, defaultTag: $e, name: "Listbox.Label" });
}
var Je = "ul";
var qe = O.RenderStrategy | O.Static;
function Ye(e2, a3) {
  var T4;
  let n4 = I(), { id: r4 = `headlessui-listbox-options-${n4}`, ...l8 } = e2, t10 = w2("Listbox.Options"), p4 = k2("Listbox.Options"), u7 = y2(t10.optionsRef, a3), i7 = p(), b2 = p(), R2 = u5(), m4 = (() => R2 !== null ? (R2 & d5.Open) === d5.Open : t10.listboxState === 0)();
  (0, import_react18.useEffect)(() => {
    var L;
    let o13 = t10.optionsRef.current;
    o13 && t10.listboxState === 0 && o13 !== ((L = o7(o13)) == null ? void 0 : L.activeElement) && o13.focus({ preventScroll: true });
  }, [t10.listboxState, t10.optionsRef]);
  let P2 = o2((o13) => {
    switch (b2.dispose(), o13.key) {
      case o11.Space:
        if (t10.searchQuery !== "") return o13.preventDefault(), o13.stopPropagation(), p4.search(o13.key);
      case o11.Enter:
        if (o13.preventDefault(), o13.stopPropagation(), t10.activeOptionIndex !== null) {
          let { dataRef: L } = t10.options[t10.activeOptionIndex];
          p4.onChange(L.current.value);
        }
        t10.mode === 0 && (p4.closeListbox(), o4().nextFrame(() => {
          var L;
          return (L = t10.buttonRef.current) == null ? void 0 : L.focus({ preventScroll: true });
        }));
        break;
      case u(t10.orientation, { vertical: o11.ArrowDown, horizontal: o11.ArrowRight }):
        return o13.preventDefault(), o13.stopPropagation(), p4.goToOption(c3.Next);
      case u(t10.orientation, { vertical: o11.ArrowUp, horizontal: o11.ArrowLeft }):
        return o13.preventDefault(), o13.stopPropagation(), p4.goToOption(c3.Previous);
      case o11.Home:
      case o11.PageUp:
        return o13.preventDefault(), o13.stopPropagation(), p4.goToOption(c3.First);
      case o11.End:
      case o11.PageDown:
        return o13.preventDefault(), o13.stopPropagation(), p4.goToOption(c3.Last);
      case o11.Escape:
        return o13.preventDefault(), o13.stopPropagation(), p4.closeListbox(), i7.nextFrame(() => {
          var L;
          return (L = t10.buttonRef.current) == null ? void 0 : L.focus({ preventScroll: true });
        });
      case o11.Tab:
        o13.preventDefault(), o13.stopPropagation();
        break;
      default:
        o13.key.length === 1 && (p4.search(o13.key), b2.setTimeout(() => p4.clearSearch(), 350));
        break;
    }
  }), S4 = i2(() => {
    var o13;
    return (o13 = t10.buttonRef.current) == null ? void 0 : o13.id;
  }, [t10.buttonRef.current]), g4 = (0, import_react18.useMemo)(() => ({ open: t10.listboxState === 0 }), [t10]), x2 = { "aria-activedescendant": t10.activeOptionIndex === null || (T4 = t10.options[t10.activeOptionIndex]) == null ? void 0 : T4.id, "aria-multiselectable": t10.mode === 1 ? true : void 0, "aria-labelledby": S4, "aria-orientation": t10.orientation, id: r4, onKeyDown: P2, role: "listbox", tabIndex: 0, ref: u7 };
  return C({ ourProps: x2, theirProps: l8, slot: g4, defaultTag: Je, features: qe, visible: m4, name: "Listbox.Options" });
}
var Ze = "li";
function et(e2, a3) {
  let n4 = I(), { id: r4 = `headlessui-listbox-option-${n4}`, disabled: l8 = false, value: t10, ...p4 } = e2, u7 = w2("Listbox.Option"), i7 = k2("Listbox.Option"), b2 = u7.activeOptionIndex !== null ? u7.options[u7.activeOptionIndex].id === r4 : false, R2 = u7.isSelected(t10), m4 = (0, import_react18.useRef)(null), P2 = s9(m4), S4 = s2({ disabled: l8, value: t10, domRef: m4, get textValue() {
    return P2();
  } }), g4 = y2(a3, m4);
  l(() => {
    if (u7.listboxState !== 0 || !b2 || u7.activationTrigger === 0) return;
    let A = o4();
    return A.requestAnimationFrame(() => {
      var d6, H;
      (H = (d6 = m4.current) == null ? void 0 : d6.scrollIntoView) == null || H.call(d6, { block: "nearest" });
    }), A.dispose;
  }, [m4, b2, u7.listboxState, u7.activationTrigger, u7.activeOptionIndex]), l(() => i7.registerOption(r4, S4), [S4, r4]);
  let x2 = o2((A) => {
    if (l8) return A.preventDefault();
    i7.onChange(t10), u7.mode === 0 && (i7.closeListbox(), o4().nextFrame(() => {
      var d6;
      return (d6 = u7.buttonRef.current) == null ? void 0 : d6.focus({ preventScroll: true });
    }));
  }), T4 = o2(() => {
    if (l8) return i7.goToOption(c3.Nothing);
    i7.goToOption(c3.Specific, r4);
  }), o13 = u3(), L = o2((A) => o13.update(A)), U3 = o2((A) => {
    o13.wasMoved(A) && (l8 || b2 || i7.goToOption(c3.Specific, r4, 0));
  }), B = o2((A) => {
    o13.wasMoved(A) && (l8 || b2 && i7.goToOption(c3.Nothing));
  }), W = (0, import_react18.useMemo)(() => ({ active: b2, selected: R2, disabled: l8 }), [b2, R2, l8]);
  return C({ ourProps: { id: r4, ref: g4, role: "option", tabIndex: l8 === true ? void 0 : -1, "aria-disabled": l8 === true ? true : void 0, "aria-selected": R2, disabled: void 0, onClick: x2, onFocus: T4, onPointerEnter: L, onMouseEnter: L, onPointerMove: U3, onMouseMove: U3, onPointerLeave: B, onMouseLeave: B }, theirProps: p4, slot: W, defaultTag: Ze, name: "Listbox.Option" });
}
var tt = U(Qe);
var ot = U(Xe);
var nt = U(ze);
var it = U(Ye);
var rt = U(et);
var It = Object.assign(tt, { Button: ot, Label: nt, Options: it, Option: rt });

// node_modules/@headlessui/react/dist/hooks/use-flags.js
var import_react19 = __toESM(require_react(), 1);
function c4(a3 = 0) {
  let [l8, r4] = (0, import_react19.useState)(a3), t10 = f5(), o13 = (0, import_react19.useCallback)((e2) => {
    t10.current && r4((u7) => u7 | e2);
  }, [l8, t10]), m4 = (0, import_react19.useCallback)((e2) => Boolean(l8 & e2), [l8]), s10 = (0, import_react19.useCallback)((e2) => {
    t10.current && r4((u7) => u7 & ~e2);
  }, [r4, t10]), g4 = (0, import_react19.useCallback)((e2) => {
    t10.current && r4((u7) => u7 ^ e2);
  }, [r4]);
  return { flags: l8, addFlag: o13, hasFlag: m4, removeFlag: s10, toggleFlag: g4 };
}

// node_modules/@headlessui/react/dist/components/transitions/transition.js
var import_react20 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/once.js
function l7(r4) {
  let e2 = { called: false };
  return (...t10) => {
    if (!e2.called) return e2.called = true, r4(...t10);
  };
}

// node_modules/@headlessui/react/dist/components/transitions/utils/transition.js
function g3(t10, ...e2) {
  t10 && e2.length > 0 && t10.classList.add(...e2);
}
function v2(t10, ...e2) {
  t10 && e2.length > 0 && t10.classList.remove(...e2);
}
function b(t10, e2) {
  let n4 = o4();
  if (!t10) return n4.dispose;
  let { transitionDuration: m4, transitionDelay: a3 } = getComputedStyle(t10), [u7, p4] = [m4, a3].map((l8) => {
    let [r4 = 0] = l8.split(",").filter(Boolean).map((i7) => i7.includes("ms") ? parseFloat(i7) : parseFloat(i7) * 1e3).sort((i7, T4) => T4 - i7);
    return r4;
  }), o13 = u7 + p4;
  if (o13 !== 0) {
    n4.group((r4) => {
      r4.setTimeout(() => {
        e2(), r4.dispose();
      }, o13), r4.addEventListener(t10, "transitionrun", (i7) => {
        i7.target === i7.currentTarget && r4.dispose();
      });
    });
    let l8 = n4.addEventListener(t10, "transitionend", (r4) => {
      r4.target === r4.currentTarget && (e2(), l8());
    });
  } else e2();
  return n4.add(() => e2()), n4.dispose;
}
function M2(t10, e2, n4, m4) {
  let a3 = n4 ? "enter" : "leave", u7 = o4(), p4 = m4 !== void 0 ? l7(m4) : () => {
  };
  a3 === "enter" && (t10.removeAttribute("hidden"), t10.style.display = "");
  let o13 = u(a3, { enter: () => e2.enter, leave: () => e2.leave }), l8 = u(a3, { enter: () => e2.enterTo, leave: () => e2.leaveTo }), r4 = u(a3, { enter: () => e2.enterFrom, leave: () => e2.leaveFrom });
  return v2(t10, ...e2.base, ...e2.enter, ...e2.enterTo, ...e2.enterFrom, ...e2.leave, ...e2.leaveFrom, ...e2.leaveTo, ...e2.entered), g3(t10, ...e2.base, ...o13, ...r4), u7.nextFrame(() => {
    v2(t10, ...e2.base, ...o13, ...r4), g3(t10, ...e2.base, ...o13, ...l8), b(t10, () => (v2(t10, ...e2.base, ...o13), g3(t10, ...e2.base, ...e2.entered), p4()));
  }), u7.dispose;
}

// node_modules/@headlessui/react/dist/hooks/use-transition.js
function D({ immediate: t10, container: s10, direction: n4, classes: u7, onStart: a3, onStop: c6 }) {
  let l8 = f5(), d6 = p(), e2 = s2(n4);
  l(() => {
    t10 && (e2.current = "enter");
  }, [t10]), l(() => {
    let r4 = o4();
    d6.add(r4.dispose);
    let i7 = s10.current;
    if (i7 && e2.current !== "idle" && l8.current) return r4.dispose(), a3.current(e2.current), r4.add(M2(i7, u7.current, e2.current === "enter", () => {
      r4.dispose(), c6.current(e2.current);
    })), r4.dispose;
  }, [n4]);
}

// node_modules/@headlessui/react/dist/components/transitions/transition.js
function S3(t10 = "") {
  return t10.split(/\s+/).filter((n4) => n4.length > 1);
}
var I3 = (0, import_react20.createContext)(null);
I3.displayName = "TransitionContext";
var Se = ((r4) => (r4.Visible = "visible", r4.Hidden = "hidden", r4))(Se || {});
function ye2() {
  let t10 = (0, import_react20.useContext)(I3);
  if (t10 === null) throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");
  return t10;
}
function xe2() {
  let t10 = (0, import_react20.useContext)(M3);
  if (t10 === null) throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");
  return t10;
}
var M3 = (0, import_react20.createContext)(null);
M3.displayName = "NestingContext";
function U2(t10) {
  return "children" in t10 ? U2(t10.children) : t10.current.filter(({ el: n4 }) => n4.current !== null).filter(({ state: n4 }) => n4 === "visible").length > 0;
}
function se(t10, n4) {
  let r4 = s2(t10), s10 = (0, import_react20.useRef)([]), R2 = f5(), D2 = p(), p4 = o2((i7, e2 = v.Hidden) => {
    let a3 = s10.current.findIndex(({ el: o13 }) => o13 === i7);
    a3 !== -1 && (u(e2, { [v.Unmount]() {
      s10.current.splice(a3, 1);
    }, [v.Hidden]() {
      s10.current[a3].state = "hidden";
    } }), D2.microTask(() => {
      var o13;
      !U2(s10) && R2.current && ((o13 = r4.current) == null || o13.call(r4));
    }));
  }), x2 = o2((i7) => {
    let e2 = s10.current.find(({ el: a3 }) => a3 === i7);
    return e2 ? e2.state !== "visible" && (e2.state = "visible") : s10.current.push({ el: i7, state: "visible" }), () => p4(i7, v.Unmount);
  }), h4 = (0, import_react20.useRef)([]), v3 = (0, import_react20.useRef)(Promise.resolve()), u7 = (0, import_react20.useRef)({ enter: [], leave: [], idle: [] }), g4 = o2((i7, e2, a3) => {
    h4.current.splice(0), n4 && (n4.chains.current[e2] = n4.chains.current[e2].filter(([o13]) => o13 !== i7)), n4 == null || n4.chains.current[e2].push([i7, new Promise((o13) => {
      h4.current.push(o13);
    })]), n4 == null || n4.chains.current[e2].push([i7, new Promise((o13) => {
      Promise.all(u7.current[e2].map(([f7, N4]) => N4)).then(() => o13());
    })]), e2 === "enter" ? v3.current = v3.current.then(() => n4 == null ? void 0 : n4.wait.current).then(() => a3(e2)) : a3(e2);
  }), d6 = o2((i7, e2, a3) => {
    Promise.all(u7.current[e2].splice(0).map(([o13, f7]) => f7)).then(() => {
      var o13;
      (o13 = h4.current.shift()) == null || o13();
    }).then(() => a3(e2));
  });
  return (0, import_react20.useMemo)(() => ({ children: s10, register: x2, unregister: p4, onStart: g4, onStop: d6, wait: v3, chains: u7 }), [x2, p4, s10, g4, d6, u7, v3]);
}
function Ne2() {
}
var Pe = ["beforeEnter", "afterEnter", "beforeLeave", "afterLeave"];
function ae(t10) {
  var r4;
  let n4 = {};
  for (let s10 of Pe) n4[s10] = (r4 = t10[s10]) != null ? r4 : Ne2;
  return n4;
}
function Re(t10) {
  let n4 = (0, import_react20.useRef)(ae(t10));
  return (0, import_react20.useEffect)(() => {
    n4.current = ae(t10);
  }, [t10]), n4;
}
var De = "div";
var le = O.RenderStrategy;
function He2(t10, n4) {
  var Q, Y;
  let { beforeEnter: r4, afterEnter: s10, beforeLeave: R2, afterLeave: D2, enter: p4, enterFrom: x2, enterTo: h4, entered: v3, leave: u7, leaveFrom: g4, leaveTo: d6, ...i7 } = t10, e2 = (0, import_react20.useRef)(null), a3 = y2(e2, n4), o13 = (Q = i7.unmount) == null || Q ? v.Unmount : v.Hidden, { show: f7, appear: N4, initial: T4 } = ye2(), [l8, j2] = (0, import_react20.useState)(f7 ? "visible" : "hidden"), z2 = xe2(), { register: L, unregister: O2 } = z2;
  (0, import_react20.useEffect)(() => L(e2), [L, e2]), (0, import_react20.useEffect)(() => {
    if (o13 === v.Hidden && e2.current) {
      if (f7 && l8 !== "visible") {
        j2("visible");
        return;
      }
      return u(l8, { ["hidden"]: () => O2(e2), ["visible"]: () => L(e2) });
    }
  }, [l8, e2, L, O2, f7, o13]);
  let k3 = s2({ base: S3(i7.className), enter: S3(p4), enterFrom: S3(x2), enterTo: S3(h4), entered: S3(v3), leave: S3(u7), leaveFrom: S3(g4), leaveTo: S3(d6) }), V = Re({ beforeEnter: r4, afterEnter: s10, beforeLeave: R2, afterLeave: D2 }), G = l2();
  (0, import_react20.useEffect)(() => {
    if (G && l8 === "visible" && e2.current === null) throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?");
  }, [e2, l8, G]);
  let Te = T4 && !N4, K = N4 && f7 && T4, de = /* @__PURE__ */ (() => !G || Te ? "idle" : f7 ? "enter" : "leave")(), H = c4(0), fe = o2((C2) => u(C2, { enter: () => {
    H.addFlag(d5.Opening), V.current.beforeEnter();
  }, leave: () => {
    H.addFlag(d5.Closing), V.current.beforeLeave();
  }, idle: () => {
  } })), me = o2((C2) => u(C2, { enter: () => {
    H.removeFlag(d5.Opening), V.current.afterEnter();
  }, leave: () => {
    H.removeFlag(d5.Closing), V.current.afterLeave();
  }, idle: () => {
  } })), w3 = se(() => {
    j2("hidden"), O2(e2);
  }, z2), B = (0, import_react20.useRef)(false);
  D({ immediate: K, container: e2, classes: k3, direction: de, onStart: s2((C2) => {
    B.current = true, w3.onStart(e2, C2, fe);
  }), onStop: s2((C2) => {
    B.current = false, w3.onStop(e2, C2, me), C2 === "leave" && !U2(w3) && (j2("hidden"), O2(e2));
  }) });
  let P2 = i7, ce = { ref: a3 };
  return K ? P2 = { ...P2, className: t8(i7.className, ...k3.current.enter, ...k3.current.enterFrom) } : B.current && (P2.className = t8(i7.className, (Y = e2.current) == null ? void 0 : Y.className), P2.className === "" && delete P2.className), import_react20.default.createElement(M3.Provider, { value: w3 }, import_react20.default.createElement(s8, { value: u(l8, { ["visible"]: d5.Open, ["hidden"]: d5.Closed }) | H.flags }, C({ ourProps: ce, theirProps: P2, defaultTag: De, features: le, visible: l8 === "visible", name: "Transition.Child" })));
}
function Fe(t10, n4) {
  let { show: r4, appear: s10 = false, unmount: R2 = true, ...D2 } = t10, p4 = (0, import_react20.useRef)(null), x2 = y2(p4, n4);
  l2();
  let h4 = u5();
  if (r4 === void 0 && h4 !== null && (r4 = (h4 & d5.Open) === d5.Open), ![true, false].includes(r4)) throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");
  let [v3, u7] = (0, import_react20.useState)(r4 ? "visible" : "hidden"), g4 = se(() => {
    u7("hidden");
  }), [d6, i7] = (0, import_react20.useState)(true), e2 = (0, import_react20.useRef)([r4]);
  l(() => {
    d6 !== false && e2.current[e2.current.length - 1] !== r4 && (e2.current.push(r4), i7(false));
  }, [e2, r4]);
  let a3 = (0, import_react20.useMemo)(() => ({ show: r4, appear: s10, initial: d6 }), [r4, s10, d6]);
  (0, import_react20.useEffect)(() => {
    if (r4) u7("visible");
    else if (!U2(g4)) u7("hidden");
    else {
      let T4 = p4.current;
      if (!T4) return;
      let l8 = T4.getBoundingClientRect();
      l8.x === 0 && l8.y === 0 && l8.width === 0 && l8.height === 0 && u7("hidden");
    }
  }, [r4, g4]);
  let o13 = { unmount: R2 }, f7 = o2(() => {
    var T4;
    d6 && i7(false), (T4 = t10.beforeEnter) == null || T4.call(t10);
  }), N4 = o2(() => {
    var T4;
    d6 && i7(false), (T4 = t10.beforeLeave) == null || T4.call(t10);
  });
  return import_react20.default.createElement(M3.Provider, { value: g4 }, import_react20.default.createElement(I3.Provider, { value: a3 }, C({ ourProps: { ...o13, as: import_react20.Fragment, children: import_react20.default.createElement(ue, { ref: x2, ...o13, ...D2, beforeEnter: f7, beforeLeave: N4 }) }, theirProps: {}, defaultTag: import_react20.Fragment, features: le, visible: v3 === "visible", name: "Transition" })));
}
function _e(t10, n4) {
  let r4 = (0, import_react20.useContext)(I3) !== null, s10 = u5() !== null;
  return import_react20.default.createElement(import_react20.default.Fragment, null, !r4 && s10 ? import_react20.default.createElement(q2, { ref: n4, ...t10 }) : import_react20.default.createElement(ue, { ref: n4, ...t10 }));
}
var q2 = U(Fe);
var ue = U(He2);
var Le2 = U(_e);
var qe2 = Object.assign(q2, { Child: Le2, Root: q2 });

// resources/js/components/pages/ContactPage.jsx
var GlassCard = ({ children, className = "" }) => /* @__PURE__ */ import_react21.default.createElement("div", { className: `bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg ${className}` }, children);
var InfoItem = ({ icon, title, details, action }) => /* @__PURE__ */ import_react21.default.createElement("div", { className: "flex items-start gap-4" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "mt-1 flex-shrink-0" }, icon), /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement("h4", { className: "font-semibold text-attire-cream" }, title), action ? /* @__PURE__ */ import_react21.default.createElement("a", { href: action, target: "_blank", rel: "noopener noreferrer", className: "text-attire-silver hover:text-white transition-colors" }, details.map((line, i7) => /* @__PURE__ */ import_react21.default.createElement("p", { key: i7 }, line))) : details.map((line, i7) => /* @__PURE__ */ import_react21.default.createElement("p", { key: i7, className: "text-attire-silver" }, line))));
var InputField = ({ name, label, error, ...props }) => /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement("label", { className: "block text-sm font-medium text-attire-cream mb-2" }, label), /* @__PURE__ */ import_react21.default.createElement(
  "input",
  {
    name,
    ...props,
    className: `w-full px-4 py-3 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 transition-colors
                ${error ? "border-red-500" : "border-white/10"}
                focus:border-white focus:ring-1 focus:ring-white`
  }
), error && /* @__PURE__ */ import_react21.default.createElement("p", { className: "mt-1 text-sm text-red-600" }, error));
var SelectField = ({ name, label, options, value, onChange }) => {
  const selectedOption = options.find((o13) => o13.value === value);
  return /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement(
    It,
    {
      value,
      onChange: (newValue) => {
        onChange({ target: { name, value: newValue } });
      }
    },
    /* @__PURE__ */ import_react21.default.createElement(It.Label, { className: "block text-sm font-medium text-attire-cream mb-2" }, label),
    /* @__PURE__ */ import_react21.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react21.default.createElement(It.Button, { className: "relative w-full cursor-default rounded-lg border bg-attire-dark/50 py-3 pl-4 pr-10 text-left text-attire-cream transition-colors border-white/10 focus:outline-none focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white" }, /* @__PURE__ */ import_react21.default.createElement("span", { className: "block truncate" }, selectedOption?.label), /* @__PURE__ */ import_react21.default.createElement("span", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2" }, /* @__PURE__ */ import_react21.default.createElement(ChevronDown, { className: "h-5 w-5 text-attire-silver", "aria-hidden": "true" }))), /* @__PURE__ */ import_react21.default.createElement(
      qe2,
      {
        as: import_react21.Fragment,
        leave: "transition ease-in duration-100",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0"
      },
      /* @__PURE__ */ import_react21.default.createElement(It.Options, { className: "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-attire-dark/80 backdrop-blur-lg py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm" }, options.map((option, optionIdx) => /* @__PURE__ */ import_react21.default.createElement(
        It.Option,
        {
          key: optionIdx,
          className: ({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-white/10 text-white" : "text-attire-cream"}`,
          value: option.value
        },
        ({ selected }) => /* @__PURE__ */ import_react21.default.createElement(import_react21.default.Fragment, null, /* @__PURE__ */ import_react21.default.createElement("span", { className: `block truncate ${selected ? "font-medium" : "font-normal"}` }, option.label), selected ? /* @__PURE__ */ import_react21.default.createElement("span", { className: "absolute inset-y-0 left-0 flex items-center pl-3 text-white" }, /* @__PURE__ */ import_react21.default.createElement(Check, { className: "h-5 w-5", "aria-hidden": "true" })) : null)
      )))
    ))
  ));
};
var TextareaField = ({ name, label, error, ...props }) => /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement("label", { className: "block text-sm font-medium text-attire-cream mb-2" }, label), /* @__PURE__ */ import_react21.default.createElement(
  "textarea",
  {
    name,
    rows: 5,
    ...props,
    className: `w-full px-4 py-3 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 transition-colors resize-none
                ${error ? "border-red-500" : "border-white/10"}
                focus:border-white focus:ring-1 focus:ring-white`
  }
), error && /* @__PURE__ */ import_react21.default.createElement("p", { className: "mt-1 text-sm text-red-600" }, error));
var SocialLink = ({ href, icon }) => /* @__PURE__ */ import_react21.default.createElement(
  "a",
  {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "text-attire-silver hover:text-white hover:scale-110 transition-all"
  },
  icon
);
var FavoritesSelector = ({ favoriteProducts, selectedFavorites, onSelectionChange }) => {
  if (favoriteProducts.length === 0) {
    return null;
  }
  const handleCheckboxChange = (productId) => {
    if (selectedFavorites.includes(productId)) {
      onSelectionChange(selectedFavorites.filter((id) => id !== productId));
    } else {
      onSelectionChange([...selectedFavorites, productId]);
    }
  };
  return /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement("label", { className: "block text-sm font-medium text-attire-cream mb-2" }, "Include Favorited Items (Optional)"), /* @__PURE__ */ import_react21.default.createElement("div", { className: "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 rounded-lg border bg-attire-dark/50 border-white/10" }, favoriteProducts.map((product) => /* @__PURE__ */ import_react21.default.createElement("div", { key: product.id, className: "relative group" }, /* @__PURE__ */ import_react21.default.createElement("label", { htmlFor: `fav-${product.id}`, className: "cursor-pointer" }, /* @__PURE__ */ import_react21.default.createElement("img", { src: product.images[0], alt: product.name, className: "w-full h-auto object-cover rounded-lg aspect-square transition-all duration-300 group-hover:opacity-70" }), /* @__PURE__ */ import_react21.default.createElement("div", { className: "absolute bottom-0 left-0 right-0 bg-black/50 p-2 rounded-b-lg" }, /* @__PURE__ */ import_react21.default.createElement("p", { className: "text-xs text-white text-center truncate" }, product.name))), /* @__PURE__ */ import_react21.default.createElement(
    "input",
    {
      type: "checkbox",
      id: `fav-${product.id}`,
      checked: selectedFavorites.includes(product.id),
      onChange: () => handleCheckboxChange(product.id),
      className: "absolute top-2 left-2 h-5 w-5 rounded-full border-2 border-white bg-black/20 text-attire-blue-500 focus:ring-0 focus:outline-none transition-all duration-300 checked:bg-attire-blue-500 checked:border-attire-gold"
    }
  )))));
};
var ContactPage = () => {
  const { favorites } = useFavorites();
  const favoriteProducts = products.filter((p4) => favorites.includes(p4.id));
  const [selectedFavorites, setSelectedFavorites] = (0, import_react21.useState)([]);
  const [formData, setFormData] = (0, import_react21.useState)({
    name: "",
    email: "",
    phone: "",
    service: "sartorial",
    // Changed from appointmentType to service
    date: "",
    // New field for appointment date
    time: "",
    // New field for appointment time
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = (0, import_react21.useState)(false);
  const [errors, setErrors] = (0, import_react21.useState)({});
  const [generatedMessage, setGeneratedMessage] = (0, import_react21.useState)("");
  const iconStyle = "w-6 h-6 text-attire-cream";
  const officialContactInfo = [
    {
      icon: /* @__PURE__ */ import_react21.default.createElement(Phone, { className: iconStyle }),
      title: "Phone",
      details: ["(+855) 69-25-63-69"],
      action: "tel:+85569256369"
    },
    {
      icon: /* @__PURE__ */ import_react21.default.createElement(Mail, { className: iconStyle }),
      title: "Email",
      details: ["attireloungekh@gmail.com"],
      action: "mailto:attireloungekh@gmail.com"
    },
    {
      icon: /* @__PURE__ */ import_react21.default.createElement(MapPin, { className: iconStyle }),
      title: "Store Location",
      details: ["10 E0, Street 03", "Sangkat Chey Chumneah", "Khan Daun Penh, Phnom Penh"],
      action: "https://maps.app.goo.gl/vZbPnCNMmmiKcR9g7"
      // Update with actual maps link
    },
    {
      icon: /* @__PURE__ */ import_react21.default.createElement(Clock, { className: iconStyle }),
      title: "Opening Hours",
      details: ["Mon - Sun: 10AM - 7PM"],
      action: null
    }
  ];
  const appointmentTypes = [
    { value: "sartorial", label: "Sartorial Consultation" },
    { value: "groom", label: "Groom & Groomsmen Styling" },
    { value: "office", label: "Office Wear Consultation" },
    { value: "accessories", label: "Accessories Styling" },
    { value: "membership", label: "Attire Club Membership" },
    { value: "general", label: "General Inquiry" }
  ];
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Please enter your phone number";
    if (!formData.date) newErrors.date = "Please select an appointment date";
    if (!formData.time) newErrors.time = "Please select an appointment time";
    if (!formData.message.trim()) newErrors.message = "Please include your message";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e2) => {
    e2.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      let messageWithFavorites = formData.message;
      if (selectedFavorites.length > 0) {
        const selectedItems = products.filter((p4) => selectedFavorites.includes(p4.id)).map((p4) => p4.name);
        messageWithFavorites += `

Interested in these items:
- ${selectedItems.join("\n- ")}`;
      }
      try {
        let imageUrls = [];
        if (selectedFavorites.length > 0) {
          imageUrls = selectedFavorites.map((favId) => {
            const product = products.find((p4) => p4.id === favId);
            return product && product.images.length > 0 ? product.images[0] : null;
          }).filter((url) => url !== null);
        }
        const submissionData = {
          ...formData,
          message: messageWithFavorites,
          preferred_date: formData.date,
          preferred_time: formData.time,
          favorite_item_image_url: imageUrls
        };
        await axios.post("/api/v1/appointments", submissionData);
      } catch (dbError) {
        console.error("Could not save appointment to database:", dbError);
      }
      const telegramMessage = `
New Appointment Request:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Service: ${appointmentTypes.find((type) => type.value === formData.service)?.label || formData.service}
Date: ${formData.date}
Time: ${formData.time}
Message: ${messageWithFavorites}
            `.trim();
      const telegramUrl = `https://t.me/attireloungeofficial?text=${encodeURIComponent(telegramMessage)}`;
      window.open(telegramUrl, "_blank");
      setGeneratedMessage(`Your appointment request has been submitted and a pre-filled Telegram message has been opened. Please press 'Send' in Telegram to finalize your request.

For your reference, here is the message content:

${telegramMessage}`);
    } catch (error) {
      console.error("Error creating Telegram link:", error);
      alert("Failed to open Telegram. Please ensure you have Telegram installed and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (e2) => {
    const { name, value } = e2.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };
  return /* @__PURE__ */ import_react21.default.createElement("div", { className: "min-h-screen bg-attire-navy py-24 sm:py-32" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "text-center mb-16" }, /* @__PURE__ */ import_react21.default.createElement("h1", { className: "text-4xl md:text-5xl font-serif text-white mb-4" }, "Get in Touch"), /* @__PURE__ */ import_react21.default.createElement("p", { className: "text-lg text-attire-silver max-w-2xl mx-auto" }, "We're here to help you define your style. Reach out for appointments or inquiries.")), /* @__PURE__ */ import_react21.default.createElement(GlassCard, { className: "p-8 md:p-12" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-16" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "lg:col-span-2" }, generatedMessage ? /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement("h2", { className: "text-3xl font-serif text-white mb-4" }, "Appointment Details"), /* @__PURE__ */ import_react21.default.createElement("p", { className: "text-attire-silver mb-6" }, "Your appointment request has been generated. If you were not redirected, please copy the text below and send it to us via Email or on one of our social media APP."), /* @__PURE__ */ import_react21.default.createElement("div", { className: "bg-attire-dark/50 p-4 rounded-lg border border-white/10" }, /* @__PURE__ */ import_react21.default.createElement("pre", { className: "text-attire-cream whitespace-pre-wrap text-sm" }, generatedMessage)), /* @__PURE__ */ import_react21.default.createElement(
    "button",
    {
      onClick: () => {
        setGeneratedMessage("");
        setFormData({ name: "", email: "", phone: "", service: "sartorial", date: "", time: "", message: "" });
        setSelectedFavorites([]);
      },
      className: "mt-6 w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800"
    },
    "Create New Appointment"
  )) : /* @__PURE__ */ import_react21.default.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /* @__PURE__ */ import_react21.default.createElement(InputField, { name: "name", label: "Full Name *", value: formData.name, onChange: handleChange, error: errors.name, placeholder: "Your Name" }), /* @__PURE__ */ import_react21.default.createElement(InputField, { name: "email", type: "email", label: "Email Address *", value: formData.email, onChange: handleChange, error: errors.email, placeholder: "your.email@example.com" })), /* @__PURE__ */ import_react21.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /* @__PURE__ */ import_react21.default.createElement(InputField, { name: "phone", type: "tel", label: "Phone Number *", value: formData.phone, onChange: handleChange, error: errors.phone, placeholder: "(+855) XX-XX-XX-XX" }), /* @__PURE__ */ import_react21.default.createElement(SelectField, { name: "service", label: "Appointment Type", value: formData.service, onChange: handleChange, options: appointmentTypes })), /* @__PURE__ */ import_react21.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /* @__PURE__ */ import_react21.default.createElement(InputField, { name: "date", type: "date", label: "Appointment Date *", value: formData.date, onChange: handleChange, error: errors.date }), /* @__PURE__ */ import_react21.default.createElement(InputField, { name: "time", type: "time", label: "Appointment Time *", value: formData.time, onChange: handleChange, error: errors.time })), /* @__PURE__ */ import_react21.default.createElement(
    FavoritesSelector,
    {
      favoriteProducts,
      selectedFavorites,
      onSelectionChange: setSelectedFavorites
    }
  ), /* @__PURE__ */ import_react21.default.createElement(TextareaField, { name: "message", label: "Your Message *", value: formData.message, onChange: handleChange, error: errors.message, placeholder: "Tell us about your styling need (color, fitting, size, event, etc)" }), /* @__PURE__ */ import_react21.default.createElement(
    "button",
    {
      type: "submit",
      disabled: isSubmitting,
      className: "w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
    },
    /* @__PURE__ */ import_react21.default.createElement(Send, { className: "w-5 h-5" }),
    isSubmitting ? "Sending..." : "Request Appointment"
  ))), /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-10" }, /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement("h3", { className: "text-2xl font-serif text-white mb-6" }, "Contact Information"), /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-6" }, officialContactInfo.map((info) => /* @__PURE__ */ import_react21.default.createElement(InfoItem, { key: info.title, icon: info.icon, title: info.title, details: info.details, action: info.action })))), /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement("h3", { className: "text-2xl font-serif text-white mb-6" }, "Connect With Us"), /* @__PURE__ */ import_react21.default.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ import_react21.default.createElement(SocialLink, { href: "https://instagram.com/attireloungeofficial", icon: /* @__PURE__ */ import_react21.default.createElement(Instagram, { className: "w-6 h-6" }) }), /* @__PURE__ */ import_react21.default.createElement(SocialLink, { href: "https://facebook.com/attireloungeofficial", icon: /* @__PURE__ */ import_react21.default.createElement(Facebook, { className: "w-6 h-6" }) }), /* @__PURE__ */ import_react21.default.createElement(SocialLink, { href: "https://t.me/attireloungeofficial", icon: /* @__PURE__ */ import_react21.default.createElement(Send, { className: "w-6 h-6" }) }))))))));
};
var ContactPage_default = ContactPage;
export {
  ContactPage_default as default
};
//# sourceMappingURL=ContactPage-OSNREEBA.js.map
