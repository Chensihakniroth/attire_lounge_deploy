import {
  Navigate,
  Outlet
} from "./chunk-VBCTODT4.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/admin/PrivateRoute.jsx
var import_react = __toESM(require_react());
var PrivateRoute = () => {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  return isAdmin ? /* @__PURE__ */ import_react.default.createElement(Outlet, null) : /* @__PURE__ */ import_react.default.createElement(Navigate, { to: "/admin/login" });
};
var PrivateRoute_default = PrivateRoute;
export {
  PrivateRoute_default as default
};
//# sourceMappingURL=PrivateRoute-SVW5V3O5.js.map
