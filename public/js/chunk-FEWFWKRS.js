import {
  api_default
} from "./chunk-BKED7RJF.js";
import {
  Link,
  useNavigate
} from "./chunk-VBCTODT4.js";
import {
  motion
} from "./chunk-2V3EIBA2.js";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send
} from "./chunk-MEGF3DJD.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/layouts/Footer.jsx
var import_react = __toESM(require_react());
var Footer = () => {
  const [email, setEmail] = (0, import_react.useState)("");
  const [subscribeStatus, setSubscribeStatus] = (0, import_react.useState)("idle");
  const [errorMessage, setErrorMessage] = (0, import_react.useState)("");
  const [adminClickCount, setAdminClickCount] = (0, import_react.useState)(0);
  const navigate = useNavigate();
  (0, import_react.useEffect)(() => {
    if (adminClickCount > 0) {
      const timer = setTimeout(() => setAdminClickCount(0), 1e3);
      return () => clearTimeout(timer);
    }
  }, [adminClickCount]);
  const handleAdminClick = () => {
    const newClickCount = adminClickCount + 1;
    setAdminClickCount(newClickCount);
    if (newClickCount >= 5) {
      navigate("/admin/login");
      setAdminClickCount(0);
    }
  };
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus("loading");
    setErrorMessage("");
    try {
      await api_default.post("/newsletter-subscriptions", { email });
      setSubscribeStatus("success");
      setTimeout(() => {
        setSubscribeStatus("idle");
        setEmail("");
      }, 3e3);
    } catch (error) {
      setSubscribeStatus("error");
      if (error.response && error.response.status === 422) {
        setErrorMessage(error.response.data.message || "This email is already subscribed.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      setTimeout(() => {
        setSubscribeStatus("idle");
        setErrorMessage("");
      }, 5e3);
    }
  };
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ import_react.default.createElement("footer", { className: "bg-black backdrop-blur-md text-white border-t border-white/10" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "max-w-7xl mx-auto px-6 py-12 md:py-16" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-2xl font-serif font-light tracking-widest mb-3" }, "ATTIRE", /* @__PURE__ */ import_react.default.createElement("span", { className: "font-medium" }, "LOUNGE")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-white/70 text-sm leading-relaxed" }, "First Gentlemen's Styling House in Cambodia. Premium sartorial collections and personal styling services.")), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ import_react.default.createElement(MapPin, { className: "w-4 h-4 mt-1 text-white/60 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm text-white/80" }, "10 E0, Street 03, Sangkat Chey Chumneah,", /* @__PURE__ */ import_react.default.createElement("br", null), "Khan Daun Penh, Phnom Penh")), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ import_react.default.createElement(Phone, { className: "w-4 h-4 text-white/60 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement(
    "a",
    {
      href: "tel:+85569256369",
      className: "text-sm text-white/80 hover:text-white transition-colors"
    },
    "(+855) 69-25-63-69"
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ import_react.default.createElement(Mail, { className: "w-4 h-4 text-white/60 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement(
    "a",
    {
      href: "mailto:attireloungekh@gmail.com",
      className: "text-sm text-white/80 hover:text-white transition-colors"
    },
    "attireloungekh@gmail.com"
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ import_react.default.createElement(Clock, { className: "w-4 h-4 text-white/60 flex-shrink-0" }), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm text-white/80" }, "10:00 AM - 7:00 PM, Daily")))), /* @__PURE__ */ import_react.default.createElement("div", { className: "md:col-span-2 grid grid-cols-2 gap-8" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-sm font-medium uppercase tracking-widest mb-6 text-white/90" }, "Collections"), /* @__PURE__ */ import_react.default.createElement("ul", { className: "space-y-4" }, [
    { name: "Havana Collection", path: "/products?collection=havana-collection" },
    { name: "Mocha Mousse '25", path: "/products?collection=mocha-mousse-25" },
    { name: "Groom Collection", path: "/products?collection=groom-collection" },
    { name: "Office Collection", path: "/products?collection=office-collection" },
    { name: "Accessories", path: "/products?collection=accessories" }
  ].map((item) => /* @__PURE__ */ import_react.default.createElement("li", { key: item.name }, /* @__PURE__ */ import_react.default.createElement(
    Link,
    {
      to: item.path,
      className: "group flex items-center text-white/70 hover:text-white transition-colors text-sm"
    },
    /* @__PURE__ */ import_react.default.createElement(ArrowRight, { className: "w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" }),
    item.name
  ))))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-sm font-medium uppercase tracking-widest mb-6 text-white/90" }, "Information"), /* @__PURE__ */ import_react.default.createElement("ul", { className: "space-y-4" }, [
    { name: "Attire Club", path: "/#membership" },
    { name: "Lookbook", path: "/lookbook" },
    { name: "Appointment and Contact", path: "/contact" }
  ].map((item) => /* @__PURE__ */ import_react.default.createElement("li", { key: item.name }, /* @__PURE__ */ import_react.default.createElement(
    Link,
    {
      to: item.path,
      className: "group flex items-center text-white/70 hover:text-white transition-colors text-sm"
    },
    /* @__PURE__ */ import_react.default.createElement(ArrowRight, { className: "w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" }),
    item.name
  )))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-8" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-sm font-medium uppercase tracking-widest mb-6 text-white/90" }, "Stay Updated"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-white/70 text-sm mb-6" }, "Subscribe for exclusive collections, styling tips, and members-only offers."), /* @__PURE__ */ import_react.default.createElement("form", { onSubmit: handleSubscribe, className: "space-y-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "email",
      value: email,
      onChange: (e) => setEmail(e.target.value),
      placeholder: "Your email address",
      className: "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors",
      required: true,
      disabled: subscribeStatus === "loading"
    }
  )), /* @__PURE__ */ import_react.default.createElement(
    motion.button,
    {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      type: "submit",
      className: `w-full text-black py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${subscribeStatus === "success" ? "bg-green-400" : subscribeStatus === "error" ? "bg-red-500" : "bg-white hover:bg-gray-100"}`,
      disabled: subscribeStatus === "loading" || subscribeStatus === "success"
    },
    subscribeStatus === "idle" && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(Send, { className: "w-4 h-4" }), " Subscribe"),
    subscribeStatus === "loading" && "Subscribing...",
    subscribeStatus === "success" && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(Check, { className: "w-4 h-4" }), " Subscribed!"),
    subscribeStatus === "error" && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(AlertTriangle, { className: "w-4 h-4" }), " Error")
  )), errorMessage && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-red-400 text-xs mt-2" }, errorMessage)), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-sm font-medium uppercase tracking-widest mb-6 text-white/90" }, "Connect With Us"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-4" }, [
    {
      icon: Instagram,
      label: "Instagram",
      url: "https://instagram.com/attireloungeofficial",
      color: "hover:bg-pink-500/20 hover:border-pink-500/30"
    },
    {
      icon: Facebook,
      label: "Facebook",
      url: "https://facebook.com/attireloungeofficial",
      color: "hover:bg-blue-500/20 hover:border-blue-500/30"
    },
    {
      icon: MessageSquare,
      label: "Telegram",
      url: "https://t.me/attireloungeofficial",
      color: "hover:bg-blue-400/20 hover:border-blue-400/30"
    }
  ].map((social) => /* @__PURE__ */ import_react.default.createElement(
    motion.a,
    {
      key: social.label,
      href: social.url,
      target: "_blank",
      rel: "noopener noreferrer",
      whileHover: { y: -2 },
      className: `p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-all ${social.color}`,
      "aria-label": social.label
    },
    /* @__PURE__ */ import_react.default.createElement(social.icon, { className: "w-5 h-5 text-white/80" })
  )))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-12 pt-8 border-t border-white/10" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-col md:flex-row items-center justify-between gap-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-center md:text-left cursor-pointer", onClick: handleAdminClick }, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-white/60 text-sm" }, "\xA9 ", currentYear, " Attire Lounge Official. All rights reserved."), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-white/40 text-xs mt-1" }, "First Gentlemen's Styling House in Cambodia")), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap items-center justify-center gap-6 text-sm" }, [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Return Policy", path: "/returns" }
  ].map((link) => /* @__PURE__ */ import_react.default.createElement(
    Link,
    {
      key: link.name,
      to: link.path,
      className: "text-white/60 hover:text-white transition-colors text-xs uppercase tracking-wider"
    },
    link.name
  )))), /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-6 pt-6 border-t border-white/5 text-center" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-white/40 text-xs" }, "Attire Club Membership available with minimum purchase of US$500.", /* @__PURE__ */ import_react.default.createElement(Link, { to: "/membership", className: "ml-1 text-white/60 hover:text-white transition-colors" }, "Learn more \u2192"))))));
};
var Footer_default = Footer;

export {
  Footer_default
};
//# sourceMappingURL=chunk-FEWFWKRS.js.map
