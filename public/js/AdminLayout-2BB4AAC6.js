import {
  ThemeProvider
} from "./chunk-73PUQW33.js";
import {
  AdminProvider
} from "./chunk-IP6GNHGC.js";
import "./chunk-M5DYWXOV.js";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate
} from "./chunk-VBCTODT4.js";
import {
  AnimatePresence,
  motion
} from "./chunk-2V3EIBA2.js";
import {
  Calendar,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  X
} from "./chunk-MEGF3DJD.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/admin/AdminLayout.jsx
var import_react = __toESM(require_react());
var NavItem = ({ item }) => {
  return /* @__PURE__ */ import_react.default.createElement(motion.div, { whileHover: { x: 5 }, whileTap: { scale: 0.95 } }, /* @__PURE__ */ import_react.default.createElement(
    NavLink,
    {
      to: item.to,
      end: item.to === "/admin",
      className: ({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`
    },
    /* @__PURE__ */ import_react.default.createElement(item.icon, { className: "w-5 h-5 mr-3" }),
    /* @__PURE__ */ import_react.default.createElement("span", null, item.name)
  ));
};
var Sidebar = ({ isOpen, setOpen }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_token");
    navigate("/admin/login");
  };
  const navItems = [
    { name: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { name: "Appointments", to: "/admin/appointments", icon: Calendar },
    { name: "Gift Requests", to: "/admin/customize-gift", icon: Gift }
  ];
  const SidebarContent = () => /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      className: "flex flex-col w-64 bg-gray-800 flex-shrink-0 h-full"
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "h-20 flex items-center justify-between px-4 border-b border-gray-700" }, /* @__PURE__ */ import_react.default.createElement("h1", { className: "text-xl font-bold tracking-wider text-white" }, "ATTIRE LOUNGE"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setOpen(false), className: "text-gray-400 hover:text-white lg:hidden" }, /* @__PURE__ */ import_react.default.createElement(X, { size: 24 }))),
    /* @__PURE__ */ import_react.default.createElement("nav", { className: "flex-grow p-4 space-y-2" }, navItems.map((item) => /* @__PURE__ */ import_react.default.createElement(NavItem, { key: item.name, item }))),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "p-4 border-t border-gray-700" }, /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        onClick: handleLogout,
        className: "w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
      },
      /* @__PURE__ */ import_react.default.createElement(LogOut, { className: "w-5 h-5 mr-3" }),
      /* @__PURE__ */ import_react.default.createElement("span", null, "Logout")
    ))
  );
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "hidden lg:block h-full" }, /* @__PURE__ */ import_react.default.createElement(SidebarContent, null)), /* @__PURE__ */ import_react.default.createElement(AnimatePresence, null, isOpen && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      className: `fixed inset-y-0 left-0 z-40 transform lg:hidden`,
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    /* @__PURE__ */ import_react.default.createElement(SidebarContent, null)
  ), /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      className: `fixed inset-0 bg-black z-30 lg:hidden`,
      initial: { opacity: 0 },
      animate: { opacity: 0.5 },
      exit: { opacity: 0 },
      onClick: () => setOpen(false)
    }
  ))));
};
var AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = (0, import_react.useState)(false);
  const location = useLocation();
  (0, import_react.useEffect)(() => {
    const adminRoot = document.getElementById("admin-root");
    if (adminRoot) {
      adminRoot.classList.add("dark");
    }
  }, []);
  return /* @__PURE__ */ import_react.default.createElement(ThemeProvider, null, /* @__PURE__ */ import_react.default.createElement(AdminProvider, null, /* @__PURE__ */ import_react.default.createElement("div", { id: "admin-root", className: "flex h-screen bg-gray-900 font-sans" }, /* @__PURE__ */ import_react.default.createElement(Sidebar, { isOpen: isSidebarOpen, setOpen: setSidebarOpen }), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 flex flex-col overflow-hidden" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between flex-shrink-0" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setSidebarOpen(true), className: "text-gray-400 focus:outline-none lg:hidden" }, /* @__PURE__ */ import_react.default.createElement(Menu, { size: 24 })), /* @__PURE__ */ import_react.default.createElement("h1", { className: "text-lg font-semibold text-white" }, "Admin Panel")), /* @__PURE__ */ import_react.default.createElement("main", { className: "flex-1 overflow-y-auto p-6 md:p-8" }, /* @__PURE__ */ import_react.default.createElement(AnimatePresence, { mode: "wait" }, /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      key: location.pathname,
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.2 }
    },
    /* @__PURE__ */ import_react.default.createElement(Outlet, null)
  )))))));
};
var AdminLayout_default = AdminLayout;
export {
  AdminLayout_default as default
};
//# sourceMappingURL=AdminLayout-2BB4AAC6.js.map
