import {
  axios_default
} from "./chunk-M5DYWXOV.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/admin/AdminContext.jsx
var import_react = __toESM(require_react());
var AdminContext = (0, import_react.createContext)();
var useAdmin = () => (0, import_react.useContext)(AdminContext);
var AdminProvider = ({ children }) => {
  const [appointments, setAppointments] = (0, import_react.useState)([]);
  const [appointmentsLoaded, setAppointmentsLoaded] = (0, import_react.useState)(false);
  const [appointmentsLoading, setAppointmentsLoading] = (0, import_react.useState)(false);
  const [giftRequests, setGiftRequests] = (0, import_react.useState)([]);
  const [giftRequestsLoaded, setGiftRequestsLoaded] = (0, import_react.useState)(false);
  const [giftRequestsLoading, setGiftRequestsLoading] = (0, import_react.useState)(false);
  const [stats, setStats] = (0, import_react.useState)({ appointments: 0, gifts: 0 });
  const fetchAppointments = (0, import_react.useCallback)(async (forceRefresh = false) => {
    if (appointmentsLoaded && !forceRefresh) {
      fetchAppointmentsBackground();
      return;
    }
    setAppointmentsLoading(true);
    try {
      const response = await axios_default.get("/api/v1/admin/appointments");
      setAppointments(response.data);
      setAppointmentsLoaded(true);
      updateStats({ appointments: response.data.length });
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [appointmentsLoaded]);
  const fetchAppointmentsBackground = async () => {
    try {
      const response = await axios_default.get("/api/v1/admin/appointments");
      setAppointments(response.data);
      updateStats({ appointments: response.data.length });
    } catch (err) {
      console.error("Error refreshing appointments:", err);
    }
  };
  const updateAppointmentStatus = async (id, status) => {
    const previous = [...appointments];
    setAppointments((prev) => prev.map((app) => app.id === id ? { ...app, status } : app));
    try {
      await axios_default.patch(`/api/v1/admin/appointments/${id}/status`, { status });
    } catch (err) {
      console.error("Failed to update status:", err);
      setAppointments(previous);
      throw err;
    }
  };
  const clearCompletedAppointments = async () => {
    const previous = [...appointments];
    setAppointments((prev) => prev.filter((app) => app.status !== "done"));
    try {
      await axios_default.post("/api/v1/admin/appointments/clear-completed");
    } catch (err) {
      setAppointments(previous);
      throw err;
    }
  };
  const fetchGiftRequests = (0, import_react.useCallback)(async (forceRefresh = false) => {
    if (giftRequestsLoaded && !forceRefresh) {
      fetchGiftRequestsBackground();
      return;
    }
    setGiftRequestsLoading(true);
    try {
      const response = await axios_default.get("/api/v1/gift-requests");
      setGiftRequests(response.data);
      setGiftRequestsLoaded(true);
      updateStats({ gifts: response.data.length });
    } catch (err) {
      console.error("Error fetching gift requests:", err);
    } finally {
      setGiftRequestsLoading(false);
    }
  }, [giftRequestsLoaded]);
  const fetchGiftRequestsBackground = async () => {
    try {
      const response = await axios_default.get("/api/v1/gift-requests");
      setGiftRequests(response.data);
      updateStats({ gifts: response.data.length });
    } catch (err) {
      console.error("Error refreshing gift requests:", err);
    }
  };
  const updateGiftRequestStatus = async (id, status) => {
    const previous = [...giftRequests];
    setGiftRequests((prev) => prev.map((req) => req.id === id ? { ...req, status } : req));
    try {
      await axios_default.patch(`/api/v1/gift-requests/${id}/status`, { status });
    } catch (err) {
      setGiftRequests(previous);
      throw err;
    }
  };
  const deleteGiftRequest = async (id) => {
    const previous = [...giftRequests];
    setGiftRequests((prev) => prev.filter((req) => req.id !== id));
    try {
      await axios_default.delete(`/api/v1/gift-requests/${id}`);
    } catch (err) {
      setGiftRequests(previous);
      throw err;
    }
  };
  const updateStats = (newStats) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  };
  return /* @__PURE__ */ import_react.default.createElement(AdminContext.Provider, { value: {
    appointments,
    appointmentsLoading,
    fetchAppointments,
    updateAppointmentStatus,
    clearCompletedAppointments,
    giftRequests,
    giftRequestsLoading,
    fetchGiftRequests,
    updateGiftRequestStatus,
    deleteGiftRequest,
    stats
  } }, children);
};

export {
  useAdmin,
  AdminProvider
};
//# sourceMappingURL=chunk-IP6GNHGC.js.map
