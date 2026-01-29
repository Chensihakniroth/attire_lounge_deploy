import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/admin/ThemeContext.jsx
var import_react = __toESM(require_react());
var ThemeContext = (0, import_react.createContext)();
var ThemeProvider = ({ children }) => {
  const colors = {
    background: "#111827",
    // bg-gray-900
    card: "#1f2937",
    // bg-gray-800
    border: "#374151",
    // border-gray-700
    primary: "#3b82f6",
    // blue-500
    mainText: "#ffffff",
    // text-white
    sidebarText: "#9ca3af"
    // text-gray-400
  };
  return /* @__PURE__ */ import_react.default.createElement(ThemeContext.Provider, { value: { colors } }, children);
};

export {
  ThemeContext,
  ThemeProvider
};
//# sourceMappingURL=chunk-73PUQW33.js.map
