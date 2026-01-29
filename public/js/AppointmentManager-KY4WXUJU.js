import {
  ThemeContext
} from "./chunk-73PUQW33.js";
import {
  useAdmin
} from "./chunk-IP6GNHGC.js";
import "./chunk-M5DYWXOV.js";
import {
  Calendar,
  Check,
  Loader,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
  User,
  X
} from "./chunk-MEGF3DJD.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/admin/AppointmentManager.jsx
var import_react = __toESM(require_react());
var AppointmentRow = ({ appointment, onUpdateStatus, colors }) => {
  const statusStyles = {
    pending: { borderLeft: `4px solid ${colors.border}`, backgroundColor: colors.card },
    done: { borderLeft: "4px solid #22c55e", backgroundColor: colors.card },
    cancelled: { borderLeft: "4px solid #ef4444", backgroundColor: colors.card }
  };
  return /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      style: statusStyles[appointment.status],
      className: "p-5 rounded-xl shadow-md transition duration-200 ease-out hover:scale-[1.01] hover:shadow-xl border border-gray-700/30 hover:border-gray-600/50"
    },
    /* @__PURE__ */ import_react.default.createElement("div", { style: { borderColor: colors.border }, className: "flex justify-between items-center pb-3 mb-3 border-b" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ import_react.default.createElement(User, { style: { color: colors.primary }, className: "w-5 h-5 mr-3" }), /* @__PURE__ */ import_react.default.createElement("h3", { style: { color: colors.mainText }, className: "text-lg font-semibold" }, appointment.name)), /* @__PURE__ */ import_react.default.createElement("span", { style: { backgroundColor: colors.background, color: colors.sidebarText }, className: "text-xs font-bold uppercase px-3 py-1 rounded-full" }, appointment.status)),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "md:col-span-1 space-y-4" }, /* @__PURE__ */ import_react.default.createElement("div", { style: { color: colors.sidebarText }, className: "flex items-center" }, /* @__PURE__ */ import_react.default.createElement(Mail, { className: "w-4 h-4 mr-3 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("a", { href: `mailto:${appointment.email}`, style: { color: colors.primary }, className: "hover:underline truncate text-sm" }, appointment.email)), /* @__PURE__ */ import_react.default.createElement("div", { style: { color: colors.sidebarText }, className: "flex items-center" }, /* @__PURE__ */ import_react.default.createElement(Phone, { className: "w-4 h-4 mr-3 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-sm" }, appointment.phone)), /* @__PURE__ */ import_react.default.createElement("div", { style: { borderColor: colors.border }, className: "flex items-center text-gray-600 pt-2 border-t mt-2" }, /* @__PURE__ */ import_react.default.createElement(Calendar, { className: "w-4 h-4 mr-3 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-sm font-medium" }, new Date(appointment.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), " at ", appointment.time))), /* @__PURE__ */ import_react.default.createElement("div", { className: "md:col-span-2 space-y-4" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("p", { style: { color: colors.mainText }, className: "font-semibold text-sm mb-1" }, "Service Requested"), /* @__PURE__ */ import_react.default.createElement("p", { style: { color: colors.sidebarText }, className: "text-sm" }, appointment.service)), appointment.message && /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("p", { style: { color: colors.mainText }, className: "font-semibold text-sm mb-1" }, "Message"), /* @__PURE__ */ import_react.default.createElement("div", { style: { color: colors.sidebarText }, className: "flex items-start text-sm" }, /* @__PURE__ */ import_react.default.createElement(MessageSquare, { className: "w-4 h-4 mr-3 mt-0.5 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("p", { className: "italic" }, appointment.message))))),
    appointment.favorite_item_image_url && appointment.favorite_item_image_url.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-4 pt-4 border-t" }, /* @__PURE__ */ import_react.default.createElement("h4", { style: { color: colors.sidebarText }, className: "text-sm font-semibold mb-2" }, "Selected Items"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-3" }, appointment.favorite_item_image_url.map((imageUrl, index) => /* @__PURE__ */ import_react.default.createElement(
      "img",
      {
        key: index,
        src: imageUrl,
        alt: `Favorite Item ${index + 1}`,
        style: { borderColor: colors.border },
        className: "w-16 h-16 object-cover rounded-lg shadow-sm border"
      }
    )))),
    /* @__PURE__ */ import_react.default.createElement("div", { style: { borderColor: colors.border }, className: "mt-4 pt-4 border-t flex justify-end space-x-2" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => onUpdateStatus(appointment.id, "done"), disabled: appointment.status === "done", className: "px-3 py-1.5 text-xs font-semibold text-green-800 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center" }, /* @__PURE__ */ import_react.default.createElement(Check, { className: "w-4 h-4 mr-1" }), " Mark as Done"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => onUpdateStatus(appointment.id, "cancelled"), disabled: appointment.status === "cancelled", className: "px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center" }, /* @__PURE__ */ import_react.default.createElement(X, { className: "w-4 h-4 mr-1" }), " Cancel"))
  );
};
var AppointmentManager = () => {
  const { colors } = (0, import_react.useContext)(ThemeContext);
  const {
    appointments,
    appointmentsLoading,
    fetchAppointments,
    updateAppointmentStatus,
    clearCompletedAppointments
  } = useAdmin();
  (0, import_react.useEffect)(() => {
    fetchAppointments();
    const intervalId = setInterval(() => fetchAppointments(false), 6e4);
    return () => clearInterval(intervalId);
  }, [fetchAppointments]);
  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
    } catch (err) {
      alert("Failed to update status. Please try again.");
    }
  };
  const handleClearCompleted = async () => {
    if (window.confirm('Are you sure you want to clear all "done" appointments? This action cannot be undone.')) {
      try {
        await clearCompletedAppointments();
      } catch (err) {
        alert("Failed to clear completed appointments. Please try again.");
      }
    }
  };
  const renderContent = () => {
    if (appointmentsLoading && appointments.length === 0) {
      return /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-center items-center h-64" }, /* @__PURE__ */ import_react.default.createElement(Loader, { style: { color: colors.primary }, className: "animate-spin", size: 48 }));
    }
    if (appointments.length === 0 && !appointmentsLoading) {
      return /* @__PURE__ */ import_react.default.createElement("p", { style: { color: colors.sidebarText }, className: "text-center" }, "No appointments found.");
    }
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-4" }, appointments.map((app) => {
      let imageUrls = [];
      try {
        if (typeof app.favorite_item_image_url === "string") {
          const parsed = JSON.parse(app.favorite_item_image_url);
          imageUrls = Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(app.favorite_item_image_url)) {
          imageUrls = app.favorite_item_image_url;
        }
      } catch (e) {
      }
      const appointmentWithImages = { ...app, favorite_item_image_url: imageUrls };
      return /* @__PURE__ */ import_react.default.createElement(
        AppointmentRow,
        {
          key: app.id,
          appointment: appointmentWithImages,
          onUpdateStatus: handleUpdateStatus,
          colors
        }
      );
    }));
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", { style: { color: colors.mainText }, className: "text-3xl font-bold" }, "Appointment Requests"), /* @__PURE__ */ import_react.default.createElement("p", { style: { color: colors.sidebarText }, className: "mt-1" }, "Manage incoming appointment requests from customers.")), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: handleClearCompleted,
      className: "flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/10 transition-all duration-200 shadow-sm active:scale-95 group"
    },
    /* @__PURE__ */ import_react.default.createElement(Trash2, { className: "w-4 h-4 mr-2 text-gray-500 group-hover:text-red-400 transition-colors" }),
    "Clear All"
  )), renderContent());
};
var AppointmentManager_default = AppointmentManager;
export {
  AppointmentManager_default as default
};
//# sourceMappingURL=AppointmentManager-KY4WXUJU.js.map
