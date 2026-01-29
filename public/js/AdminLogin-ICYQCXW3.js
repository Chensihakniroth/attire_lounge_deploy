import {
  useNavigate
} from "./chunk-VBCTODT4.js";
import {
  motion
} from "./chunk-2V3EIBA2.js";
import {
  Lock,
  Mail
} from "./chunk-MEGF3DJD.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/admin/AdminLogin.jsx
var import_react = __toESM(require_react());
var AdminLogin = () => {
  const [email, setEmail] = (0, import_react.useState)("");
  const [password, setPassword] = (0, import_react.useState)("");
  const [rememberMe, setRememberMe] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)("");
  const [loading, setLoading] = (0, import_react.useState)(false);
  const navigate = useNavigate();
  (0, import_react.useEffect)(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      sessionStorage.setItem("isAdmin", "true");
      navigate("/admin");
    }
  }, [navigate]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/admin/login", { email, password });
      const { token } = response.data;
      if (rememberMe) {
        localStorage.setItem("admin_token", token);
      } else {
        sessionStorage.setItem("admin_token", token);
      }
      sessionStorage.setItem("isAdmin", "true");
      navigate("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials or server error.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "relative min-h-screen flex items-center justify-center font-sans overflow-hidden" }, /* @__PURE__ */ import_react.default.createElement(
    motion.video,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 1 },
      autoPlay: true,
      loop: true,
      muted: true,
      className: "absolute top-0 left-0 w-full h-full object-cover z-0"
    },
    /* @__PURE__ */ import_react.default.createElement("source", { src: "https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/hero-background1.mp4", type: "video/mp4" }),
    "Your browser does not support the video tag."
  ), /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10" }), /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, ease: "easeOut" },
      className: "relative z-20 bg-white/10 backdrop-blur-lg p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm text-white border border-white/20"
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ import_react.default.createElement("h1", { className: "text-4xl font-extrabold tracking-tight mb-2" }, "Admin Panel"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-white/70 text-sm" }, "Sign in to manage your store.")),
    /* @__PURE__ */ import_react.default.createElement("form", { onSubmit: handleLogin, className: "space-y-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "block text-white/80 text-sm font-medium mb-2", htmlFor: "email" }, "Email Address"), /* @__PURE__ */ import_react.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react.default.createElement(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-white/40", size: 20 }), /* @__PURE__ */ import_react.default.createElement(
      "input",
      {
        type: "email",
        id: "email",
        value: email,
        onChange: (e) => setEmail(e.target.value),
        className: "pl-10 pr-4 py-3 bg-white/15 border border-white/20 rounded-lg w-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
        placeholder: "Enter your email",
        required: true
      }
    ))), /* @__PURE__ */ import_react.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "block text-white/80 text-sm font-medium mb-2", htmlFor: "password" }, "Password"), /* @__PURE__ */ import_react.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react.default.createElement(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-white/40", size: 20 }), /* @__PURE__ */ import_react.default.createElement(
      "input",
      {
        type: "password",
        id: "password",
        value: password,
        onChange: (e) => setPassword(e.target.value),
        className: "pl-10 pr-4 py-3 bg-white/15 border border-white/20 rounded-lg w-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
        placeholder: "Enter your password",
        required: true
      }
    ))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ import_react.default.createElement(
      "input",
      {
        id: "remember-me",
        name: "remember-me",
        type: "checkbox",
        checked: rememberMe,
        onChange: (e) => setRememberMe(e.target.checked),
        className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      }
    ), /* @__PURE__ */ import_react.default.createElement("label", { htmlFor: "remember-me", className: "ml-2 block text-sm text-white/80" }, "Remember me"))), error && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-red-400 text-xs italic text-center" }, error), /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        type: "submit",
        className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        disabled: loading
      },
      loading ? "Logging in..." : "Secure Login"
    ))
  ));
};
var AdminLogin_default = AdminLogin;
export {
  AdminLogin_default as default
};
//# sourceMappingURL=AdminLogin-ICYQCXW3.js.map
