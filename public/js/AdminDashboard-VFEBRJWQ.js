import {
  useAdmin
} from "./chunk-IP6GNHGC.js";
import "./chunk-M5DYWXOV.js";
import {
  Link
} from "./chunk-VBCTODT4.js";
import {
  motion
} from "./chunk-2V3EIBA2.js";
import {
  ArrowRight,
  Calendar,
  Clock,
  Gift,
  User
} from "./chunk-MEGF3DJD.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/admin/AdminDashboard.jsx
var import_react3 = __toESM(require_react());

// resources/js/components/common/ErrorBoundary.jsx
var import_react = __toESM(require_react());
var ErrorBoundary = class extends import_react.default.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gray-50" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-center p-8" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-4xl mb-4" }, "\u26A0\uFE0F"), /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-2xl font-semibold mb-4" }, "Something went wrong"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-gray-600 mb-6" }, "We're working to fix this issue."), /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "bg-attire-charcoal text-white px-6 py-2 rounded-full hover:bg-attire-dark transition"
        },
        "Reload Page"
      )));
    }
    return this.props.children;
  }
};
var ErrorBoundary_default = ErrorBoundary;

// resources/js/components/common/Skeleton.jsx
var import_react2 = __toESM(require_react());
var Skeleton = ({ className }) => /* @__PURE__ */ import_react2.default.createElement("div", { className: `animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}` });
var Skeleton_default = Skeleton;

// resources/js/components/pages/admin/AdminDashboard.jsx
var cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};
var StatCard = ({ icon, title, value, link, loading }) => {
  if (loading) {
    return /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-gray-800 p-6 rounded-xl shadow-sm" }, /* @__PURE__ */ import_react3.default.createElement(Skeleton_default, { className: "h-12 w-12 rounded-full" }), /* @__PURE__ */ import_react3.default.createElement(Skeleton_default, { className: "h-8 w-1/4 mt-4" }), /* @__PURE__ */ import_react3.default.createElement(Skeleton_default, { className: "h-4 w-1/2 mt-1" }));
  }
  return /* @__PURE__ */ import_react3.default.createElement(
    motion.div,
    {
      variants: cardVariants,
      className: "bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700/50 \n                       transform transition duration-200 ease-out\n                       hover:-translate-y-1 hover:shadow-xl hover:border-gray-600 hover:bg-gray-750"
    },
    /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 group-hover:bg-gray-600 transition-colors" }, icon), link && /* @__PURE__ */ import_react3.default.createElement(Link, { to: link, className: "p-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-600" }, /* @__PURE__ */ import_react3.default.createElement(ArrowRight, { size: 20 }))),
    /* @__PURE__ */ import_react3.default.createElement("div", { className: "mt-4" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-3xl font-bold text-white tracking-tight" }, value), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider" }, title))
  );
};
var RecentActivityItem = ({ item }) => /* @__PURE__ */ import_react3.default.createElement(
  motion.li,
  {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
    className: "py-4 px-4 flex items-center justify-between border-b border-gray-700/50 last:border-0 rounded-lg \n                   transition duration-200 ease-out hover:bg-gray-700/30 hover:translate-x-1"
  },
  /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "h-10 w-10 flex items-center justify-center bg-gray-700 rounded-full" }, /* @__PURE__ */ import_react3.default.createElement(User, { className: "h-5 w-5 text-gray-400" })), /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("p", { className: "font-medium text-white" }, item.name), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-sm text-gray-400" }, item.service))),
  /* @__PURE__ */ import_react3.default.createElement("div", { className: "text-sm text-gray-400 flex items-center" }, /* @__PURE__ */ import_react3.default.createElement(Clock, { size: 14, className: "mr-2" }), /* @__PURE__ */ import_react3.default.createElement("span", null, new Date(item.created_at).toLocaleDateString()))
);
var RecentActivitySkeleton = () => /* @__PURE__ */ import_react3.default.createElement("div", { className: "space-y-4" }, [...Array(5)].map((_, i) => /* @__PURE__ */ import_react3.default.createElement("div", { key: i, className: "flex items-center space-x-4" }, /* @__PURE__ */ import_react3.default.createElement(Skeleton_default, { className: "h-10 w-10 rounded-full" }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 space-y-2" }, /* @__PURE__ */ import_react3.default.createElement(Skeleton_default, { className: "h-4 w-3/4" }), /* @__PURE__ */ import_react3.default.createElement(Skeleton_default, { className: "h-4 w-1/2" })))));
var AdminDashboard = () => {
  const {
    appointments,
    appointmentsLoading,
    fetchAppointments,
    giftRequests,
    giftRequestsLoading,
    fetchGiftRequests,
    stats
  } = useAdmin();
  (0, import_react3.useEffect)(() => {
    fetchAppointments();
    fetchGiftRequests();
  }, [fetchAppointments, fetchGiftRequests]);
  const recentAppointments = appointments.slice(0, 5);
  const isLoading = appointmentsLoading && appointments.length === 0 || giftRequestsLoading && giftRequests.length === 0;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  return /* @__PURE__ */ import_react3.default.createElement(ErrorBoundary_default, null, /* @__PURE__ */ import_react3.default.createElement(
    motion.div,
    {
      className: "space-y-8",
      initial: "hidden",
      animate: "visible",
      variants: containerVariants
    },
    /* @__PURE__ */ import_react3.default.createElement(motion.div, { variants: cardVariants }, /* @__PURE__ */ import_react3.default.createElement("h1", { className: "text-3xl font-bold text-white" }, "Welcome, Admin"), /* @__PURE__ */ import_react3.default.createElement("p", { className: "mt-1 text-gray-400" }, "Here's a snapshot of your store's activity.")),
    /* @__PURE__ */ import_react3.default.createElement(
      motion.div,
      {
        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
        variants: containerVariants
      },
      /* @__PURE__ */ import_react3.default.createElement(StatCard, { icon: /* @__PURE__ */ import_react3.default.createElement(Calendar, { className: "text-blue-500" }), title: "Total Appointments", value: stats.appointments, link: "/admin/appointments", loading: isLoading }),
      /* @__PURE__ */ import_react3.default.createElement(StatCard, { icon: /* @__PURE__ */ import_react3.default.createElement(Gift, { className: "text-green-500" }), title: "Gift Requests", value: stats.gifts, link: "/admin/customize-gift", loading: isLoading })
    ),
    /* @__PURE__ */ import_react3.default.createElement(motion.div, { variants: cardVariants, className: "bg-gray-800 p-6 rounded-xl shadow-sm" }, /* @__PURE__ */ import_react3.default.createElement("h2", { className: "text-lg font-semibold mb-4 text-white" }, "Recent Activity"), isLoading ? /* @__PURE__ */ import_react3.default.createElement(RecentActivitySkeleton, null) : recentAppointments.length > 0 ? /* @__PURE__ */ import_react3.default.createElement(
      motion.ul,
      {
        className: "divide-y divide-gray-700",
        initial: "hidden",
        animate: "visible",
        variants: containerVariants
      },
      recentAppointments.map((app) => /* @__PURE__ */ import_react3.default.createElement(RecentActivityItem, { key: app.id, item: app }))
    ) : /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-gray-400" }, "No recent appointments found."))
  ));
};
var AdminDashboard_default = AdminDashboard;
export {
  AdminDashboard_default as default
};
//# sourceMappingURL=AdminDashboard-VFEBRJWQ.js.map
