import {
  Footer_default
} from "./chunk-FEWFWKRS.js";
import "./chunk-BKED7RJF.js";
import {
  axios_default
} from "./chunk-M5DYWXOV.js";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  require_react_dom,
  useLocation
} from "./chunk-VBCTODT4.js";
import {
  FavoritesProvider,
  useFavorites
} from "./chunk-42C6ZG54.js";
import {
  AnimatePresence,
  motion
} from "./chunk-2V3EIBA2.js";
import {
  Camera,
  ChevronRight,
  Gift,
  Grid3x3,
  Heart,
  Home,
  Mail,
  Menu,
  X
} from "./chunk-MEGF3DJD.js";
import {
  __commonJS,
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// node_modules/react-dom/client.js
var require_client = __commonJS({
  "node_modules/react-dom/client.js"(exports) {
    "use strict";
    var m = require_react_dom();
    if (false) {
      exports.createRoot = m.createRoot;
      exports.hydrateRoot = m.hydrateRoot;
    } else {
      i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      exports.createRoot = function(c, o) {
        i.usingClientEntryPoint = true;
        try {
          return m.createRoot(c, o);
        } finally {
          i.usingClientEntryPoint = false;
        }
      };
      exports.hydrateRoot = function(c, h, o) {
        i.usingClientEntryPoint = true;
        try {
          return m.hydrateRoot(c, h, o);
        } finally {
          i.usingClientEntryPoint = false;
        }
      };
    }
    var i;
  }
});

// resources/js/app.jsx
var import_react5 = __toESM(require_react());
var import_client = __toESM(require_client());

// resources/js/bootstrap.js
window.axios = axios_default;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
console.log("Attire Lounge React App Initialized - MainApp.jsx structure");

// resources/js/components/MainApp.jsx
var import_react4 = __toESM(require_react());

// resources/js/components/layouts/Navigation.jsx
var import_react = __toESM(require_react());
var Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = (0, import_react.useState)(false);
  const [isScrolled, setIsScrolled] = (0, import_react.useState)(false);
  const [isHovered, setIsHovered] = (0, import_react.useState)(false);
  const [isMobile, setIsMobile] = (0, import_react.useState)(false);
  const [isLookbookFilterOpen, setIsLookbookFilterOpen] = (0, import_react.useState)(false);
  const { favorites } = useFavorites();
  (0, import_react.useEffect)(() => {
    const handler = ({ detail }) => setIsLookbookFilterOpen(detail.isFilterOpen);
    window.addEventListener("lookbookFilterStateChange", handler);
    return () => window.removeEventListener("lookbookFilterStateChange", handler);
  }, []);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  (0, import_react.useEffect)(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  (0, import_react.useEffect)(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("menuStateChange", { detail: { isMenuOpen } }));
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
  (0, import_react.useEffect)(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  (0, import_react.useEffect)(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);
  const isNavVisible = isHovered || isMenuOpen || isMobile;
  const isTransparentNav = isHomePage && !isScrolled && !isMenuOpen && !isMobile && !isHovered;
  const showBorder = !isHomePage || isScrolled || isMenuOpen || isMobile;
  const navBackgroundClass = isTransparentNav ? "bg-opacity-0" : `bg-opacity-30 backdrop-blur-xl ${showBorder ? "border-b border-white/10" : "border-b-0"}`;
  const navTextColor = "text-white";
  const navIconColor = "text-white/80";
  const navVariants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: "-25%" }
  };
  const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    closed: { x: "-100%", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
  };
  const listVariants = {
    open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  };
  const itemVariants = {
    open: { y: 0, opacity: 1, transition: { y: { stiffness: 1e3, velocity: -100 } } },
    closed: { y: 50, opacity: 0, transition: { y: { stiffness: 1e3 } } }
  };
  if (isLookbookFilterOpen && isMobile) {
    return null;
  }
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(
    motion.nav,
    {
      animate: isNavVisible ? "visible" : "hidden",
      initial: "visible",
      variants: navVariants,
      transition: { duration: 0.3, ease: "easeInOut" },
      className: `fixed top-0 left-0 right-0 z-50 bg-attire-dark transition-opacity duration-500 ${navBackgroundClass}`,
      onMouseEnter: () => !isMobile && setIsHovered(true),
      onMouseLeave: () => !isMobile && setIsHovered(false)
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "max-w-7xl mx-auto px-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between h-24" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setIsMenuOpen(true), className: "p-2", "aria-label": "Open menu" }, /* @__PURE__ */ import_react.default.createElement(Menu, { className: `w-6 h-6 ${navIconColor}` })), /* @__PURE__ */ import_react.default.createElement(Link, { to: "/", className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" }, /* @__PURE__ */ import_react.default.createElement(
      motion.span,
      {
        animate: { opacity: isTransparentNav ? 0 : 1 },
        initial: { opacity: 0 },
        transition: { duration: 0.2 },
        className: `font-serif text-xl font-medium tracking-widest uppercase ${navTextColor}`
      },
      "Attire Lounge"
    )), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ import_react.default.createElement(Link, { to: "/favorites", className: "relative p-2", "aria-label": "Favorites" }, /* @__PURE__ */ import_react.default.createElement(Heart, { className: `w-5 h-5 ${navIconColor}` }), favorites.length > 0 && /* @__PURE__ */ import_react.default.createElement("span", { className: "absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center" }, favorites.length)))))
  ), /* @__PURE__ */ import_react.default.createElement(AnimatePresence, null, isMenuOpen && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 bg-attire-dark/50 backdrop-blur-sm z-40",
      onClick: () => setIsMenuOpen(false)
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      variants: sidebarVariants,
      initial: "closed",
      animate: "open",
      exit: "closed",
      className: "fixed top-0 left-0 bottom-0 w-full max-w-md bg-attire-navy z-50 shadow-2xl"
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "p-6 flex items-center justify-between border-b border-white/10" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "font-serif text-lg text-attire-cream tracking-widest" }, "Menu"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setIsMenuOpen(false), className: "p-2", "aria-label": "Close menu" }, /* @__PURE__ */ import_react.default.createElement(X, { className: "w-6 h-6 text-attire-cream" }))),
    /* @__PURE__ */ import_react.default.createElement(motion.ul, { variants: listVariants, className: "p-6 space-y-3" }, navItems.map((item) => /* @__PURE__ */ import_react.default.createElement(motion.li, { key: item.name, variants: itemVariants }, /* @__PURE__ */ import_react.default.createElement(
      Link,
      {
        to: item.path,
        onClick: () => setIsMenuOpen(false),
        className: "group flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-all duration-200"
      },
      /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ import_react.default.createElement(item.icon, { className: "w-5 h-5 text-attire-cream group-hover:text-white transition-colors" }), /* @__PURE__ */ import_react.default.createElement("span", { className: "font-serif text-xl text-attire-cream tracking-widest" }, item.name)),
      /* @__PURE__ */ import_react.default.createElement(ChevronRight, { className: "w-5 h-5 text-attire-silver/50 group-hover:translate-x-1 transition-transform" })
    )))),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute bottom-0 left-0 w-full p-6 border-t border-white/10" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-attire-silver text-center" }, "\xA9 2026 Attire Lounge official.  All rights reserved."))
  ))));
};
var Navigation_default = Navigation;

// resources/js/components/common/LoadingSpinner.jsx
var import_react2 = __toESM(require_react());
var LoadingSpinner = () => {
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center justify-center min-h-[400px]" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-16 h-16 border-4 border-attire-light border-t-attire-accent rounded-full animate-spin" })));
};
var LoadingSpinner_default = LoadingSpinner;

// resources/js/components/common/ScrollToTop.jsx
var import_react3 = __toESM(require_react());
var ScrollToTop = () => {
  const { pathname } = useLocation();
  (0, import_react3.useEffect)(() => {
    window.scrollTo(0, 0);
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};
var ScrollToTop_default = ScrollToTop;

// resources/js/components/MainApp.jsx
var HomePage = (0, import_react4.lazy)(() => import("./HomePage-5H77S2B2.js"));
var CollectionsPage = (0, import_react4.lazy)(() => import("./CollectionsPage-JOJVDKMG.js"));
var ProductListPage = (0, import_react4.lazy)(() => import("./ProductListPage-RDLEEAH2.js"));
var LookbookPage = (0, import_react4.lazy)(() => import("./LookbookPage-4SQNEH5O.js"));
var ContactPage = (0, import_react4.lazy)(() => import("./ContactPage-MN3POJLJ.js"));
var CustomizeGiftPage = (0, import_react4.lazy)(() => import("./CustomizeGiftPage-ZQICBBNM.js"));
var FavoritesPage = (0, import_react4.lazy)(() => import("./FavoritesPage-ADVOL6RT.js"));
var AdminDashboard = (0, import_react4.lazy)(() => import("./AdminDashboard-O7MPGI7R.js"));
var AdminLogin = (0, import_react4.lazy)(() => import("./AdminLogin-ICYQCXW3.js"));
var PrivateRoute = (0, import_react4.lazy)(() => import("./PrivateRoute-SVW5V3O5.js"));
var AdminLayout = (0, import_react4.lazy)(() => import("./AdminLayout-2BB4AAC6.js"));
var AppointmentManager = (0, import_react4.lazy)(() => import("./AppointmentManager-KY4WXUJU.js"));
var CustomizeGiftManager = (0, import_react4.lazy)(() => import("./CustomizeGiftManager-46EPN244.js"));
var PrivacyPolicyPage = (0, import_react4.lazy)(() => import("./PrivacyPolicyPage-GMXHHIBW.js"));
var TermsOfServicePage = (0, import_react4.lazy)(() => import("./TermsOfServicePage-3WAVE2G7.js"));
var ReturnPolicyPage = (0, import_react4.lazy)(() => import("./ReturnPolicyPage-VBRZ4QZT.js"));
var Placeholder = ({ title }) => /* @__PURE__ */ import_react4.default.createElement("div", { className: "min-h-screen pt-24 px-6" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "max-w-4xl mx-auto" }, /* @__PURE__ */ import_react4.default.createElement("h1", { className: "text-2xl font-serif mb-4" }, title), /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-gray-600" }, "Coming soon")));
var Layout = ({ children, includeFooter = true }) => {
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "min-h-screen flex flex-col" }, /* @__PURE__ */ import_react4.default.createElement(Navigation_default, null), /* @__PURE__ */ import_react4.default.createElement("main", { className: "flex-grow pt-24 md:pt-0" }, children), includeFooter && /* @__PURE__ */ import_react4.default.createElement(Footer_default, null));
};
function MainApp() {
  return /* @__PURE__ */ import_react4.default.createElement(BrowserRouter, null, /* @__PURE__ */ import_react4.default.createElement(ScrollToTop_default, null), /* @__PURE__ */ import_react4.default.createElement(import_react4.Suspense, { fallback: /* @__PURE__ */ import_react4.default.createElement(LoadingSpinner_default, null) }, /* @__PURE__ */ import_react4.default.createElement(Routes, null, /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/", element: /* @__PURE__ */ import_react4.default.createElement("div", { className: "min-h-screen flex flex-col" }, /* @__PURE__ */ import_react4.default.createElement(Navigation_default, null), /* @__PURE__ */ import_react4.default.createElement("main", { className: "flex-grow pt-24 md:pt-0" }, /* @__PURE__ */ import_react4.default.createElement(HomePage, null))) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/collections", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(CollectionsPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/products", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(ProductListPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/products/:collectionSlug", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(ProductListPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/lookbook", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(LookbookPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/contact", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(ContactPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/customize-gift", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(CustomizeGiftPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/favorites", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(FavoritesPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { element: /* @__PURE__ */ import_react4.default.createElement(PrivateRoute, null) }, /* @__PURE__ */ import_react4.default.createElement(Route, { element: /* @__PURE__ */ import_react4.default.createElement(AdminLayout, null) }, /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/admin", element: /* @__PURE__ */ import_react4.default.createElement(AdminDashboard, null) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/admin/appointments", element: /* @__PURE__ */ import_react4.default.createElement(AppointmentManager, null) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/admin/customize-gift", element: /* @__PURE__ */ import_react4.default.createElement(CustomizeGiftManager, null) }))), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/admin/login", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(AdminLogin, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/styling", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "Styling" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/journal", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "Journal" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/about", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "About" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/shipping", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "Shipping" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/privacy", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(PrivacyPolicyPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/terms", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(TermsOfServicePage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/returns", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(ReturnPolicyPage, null)) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/privacy", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "Privacy" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/terms", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "Terms" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/appointment", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "Appointment" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/membership", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "Membership" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "/faq", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "FAQ" })) }), /* @__PURE__ */ import_react4.default.createElement(Route, { path: "*", element: /* @__PURE__ */ import_react4.default.createElement(Layout, null, /* @__PURE__ */ import_react4.default.createElement(Placeholder, { title: "Page Not Found" })) }))));
}
var MainApp_default = MainApp;

// resources/js/app.jsx
var container = document.getElementById("app");
if (container) {
  const root = import_client.default.createRoot(container);
  root.render(
    /* @__PURE__ */ import_react5.default.createElement(import_react5.default.StrictMode, null, /* @__PURE__ */ import_react5.default.createElement(FavoritesProvider, null, /* @__PURE__ */ import_react5.default.createElement(MainApp_default, null)))
  );
} else {
  console.error("Root element not found");
}
//# sourceMappingURL=app.js.map
