import {
  useAdmin
} from "./chunk-IP6GNHGC.js";
import "./chunk-M5DYWXOV.js";
import {
  CheckCircle,
  Gift,
  Loader,
  Mail,
  Phone,
  Trash2,
  User,
  XCircle
} from "./chunk-MEGF3DJD.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/admin/CustomizeGiftManager.jsx
var import_react = __toESM(require_react());
var GiftRequestCard = ({ request, onUpdate, onDelete }) => {
  const [isUpdating, setIsUpdating] = (0, import_react.useState)(false);
  const handleUpdate = async (status) => {
    setIsUpdating(true);
    await onUpdate(request.id, status);
    setIsUpdating(false);
  };
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this request?")) {
      setIsUpdating(true);
      await onDelete(request.id);
    }
  };
  const statusStyles = {
    Pending: "border-yellow-500",
    Reviewed: "border-blue-500",
    Completed: "border-green-500",
    Cancelled: "border-red-500"
  };
  const statusBadgeStyles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Reviewed: "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800"
  };
  return /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      className: `bg-gray-800 p-5 rounded-xl shadow-md border-l-4 ${statusStyles[request.status]} transition duration-200 ease-out hover:-translate-y-1 hover:shadow-xl border-t border-r border-b border-gray-700/50 hover:border-gray-600`
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-start pb-3 mb-3 border-b border-gray-700" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ import_react.default.createElement(User, { className: "w-5 h-5 text-gray-400 mr-3" }), /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-lg font-semibold text-white" }, request.name)), /* @__PURE__ */ import_react.default.createElement("span", { className: `px-3 py-1 text-xs font-bold uppercase rounded-full ${statusBadgeStyles[request.status]}` }, request.status)),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center text-gray-400" }, /* @__PURE__ */ import_react.default.createElement(Mail, { className: "w-4 h-4 mr-3 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("a", { href: `mailto:${request.email}`, className: "hover:text-blue-500 truncate text-sm" }, request.email)), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center text-gray-400" }, /* @__PURE__ */ import_react.default.createElement(Phone, { className: "w-4 h-4 mr-3 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-sm" }, request.phone))),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-4 pt-4 border-t border-gray-700" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "font-semibold text-white text-sm mb-1" }, "Preferences"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start text-gray-400 text-sm" }, /* @__PURE__ */ import_react.default.createElement(Gift, { className: "w-4 h-4 mr-3 mt-0.5 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("pre", { className: "whitespace-pre-wrap font-sans italic" }, request.preferences))),
    request.status === "Pending" && /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-4 pt-4 border-t border-gray-700 flex items-center justify-end gap-2" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => handleUpdate("Completed"), disabled: isUpdating, className: "px-3 py-1 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md flex items-center gap-1 disabled:bg-gray-400" }, /* @__PURE__ */ import_react.default.createElement(CheckCircle, { size: 14 }), " Mark Done"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => handleUpdate("Cancelled"), disabled: isUpdating, className: "px-3 py-1 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md flex items-center gap-1 disabled:bg-gray-400" }, /* @__PURE__ */ import_react.default.createElement(XCircle, { size: 14 }), " Cancel")),
    (request.status === "Completed" || request.status === "Cancelled") && /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-4 pt-4 border-t border-gray-700 flex items-center justify-end" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: handleDelete, disabled: isUpdating, className: "px-3 py-1 text-sm font-semibold text-gray-400 hover:bg-gray-600 rounded-md flex items-center gap-1 disabled:opacity-50" }, /* @__PURE__ */ import_react.default.createElement(Trash2, { size: 14 }), " Delete"))
  );
};
var CustomizeGiftManager = () => {
  const {
    giftRequests,
    giftRequestsLoading,
    fetchGiftRequests,
    updateGiftRequestStatus,
    deleteGiftRequest
  } = useAdmin();
  (0, import_react.useEffect)(() => {
    fetchGiftRequests();
    const intervalId = setInterval(() => fetchGiftRequests(false), 6e4);
    return () => clearInterval(intervalId);
  }, [fetchGiftRequests]);
  const handleUpdate = (0, import_react.useCallback)(async (id, status) => {
    try {
      await updateGiftRequestStatus(id, status);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }, [updateGiftRequestStatus]);
  const handleDelete = (0, import_react.useCallback)(async (id) => {
    try {
      await deleteGiftRequest(id);
    } catch (err) {
      console.error("Failed to delete request:", err);
    }
  }, [deleteGiftRequest]);
  const renderContent = () => {
    if (giftRequestsLoading && giftRequests.length === 0) {
      return /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-center items-center h-64" }, /* @__PURE__ */ import_react.default.createElement(Loader, { className: "animate-spin text-purple-500", size: 48 }));
    }
    if (giftRequests.length === 0 && !giftRequestsLoading) {
      return /* @__PURE__ */ import_react.default.createElement("p", { className: "text-center text-gray-400" }, "No gift requests found.");
    }
    return /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        className: "grid grid-cols-1 lg:grid-cols-2 gap-6"
      },
      giftRequests.map((request) => /* @__PURE__ */ import_react.default.createElement(
        GiftRequestCard,
        {
          key: request.id,
          request,
          onUpdate: handleUpdate,
          onDelete: handleDelete
        }
      ))
    );
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", { className: "text-3xl font-bold text-white" }, "Customize Gift Requests"), /* @__PURE__ */ import_react.default.createElement("p", { className: "mt-1 text-gray-400" }, "Review and manage customized gift inquiries from customers.")), renderContent());
};
var CustomizeGiftManager_default = CustomizeGiftManager;
export {
  CustomizeGiftManager_default as default
};
//# sourceMappingURL=CustomizeGiftManager-46EPN244.js.map
