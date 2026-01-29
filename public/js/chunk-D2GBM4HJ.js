import {
  AnimatePresence,
  motion
} from "./chunk-2V3EIBA2.js";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  Minimize,
  X
} from "./chunk-MEGF3DJD.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// node_modules/popmotion/dist/es/utils/wrap.mjs
var wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((v - min) % rangeSize + rangeSize) % rangeSize + min;
};

// resources/js/components/pages/lookbook/Lightbox.jsx
var import_react = __toESM(require_react());
var lightboxVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(24px)" }
};
var imageSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  }
};
var Lightbox = ({
  selectedImage,
  closeLightbox,
  direction,
  paginate,
  toggleFavorite,
  favorites
}) => {
  const [isFullscreen, setIsFullscreen] = (0, import_react.useState)(false);
  if (!selectedImage) return null;
  const handleToggleFullscreen = (e) => {
    e.stopPropagation();
    setIsFullscreen(!isFullscreen);
  };
  const handleShare = (e) => {
    e.stopPropagation();
    alert("Sharing feature to be implemented");
  };
  return /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      variants: lightboxVariants,
      initial: "hidden",
      animate: "visible",
      exit: "hidden",
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70",
      onClick: closeLightbox
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "relative w-full h-full flex items-center justify-center" }, /* @__PURE__ */ import_react.default.createElement(
      motion.button,
      {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { delay: 0.3, type: "spring" },
        onClick: closeLightbox,
        className: "absolute top-8 right-8 z-[60] p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors",
        "aria-label": "Close"
      },
      /* @__PURE__ */ import_react.default.createElement(X, { className: "w-6 h-6 text-white" })
    ), /* @__PURE__ */ import_react.default.createElement(AnimatePresence, { initial: false, custom: direction }, /* @__PURE__ */ import_react.default.createElement(
      motion.div,
      {
        key: selectedImage.id,
        variants: imageSlideVariants,
        custom: direction,
        initial: "enter",
        animate: "center",
        transition: {
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        },
        className: `absolute rounded-xl overflow-hidden shadow-2xl bg-black ${isFullscreen ? "w-full h-full rounded-none" : "w-[30rem] max-w-[90vw] aspect-[3/4]"}`,
        drag: "x",
        dragConstraints: { left: 0, right: 0 },
        dragElastic: 0.1,
        onDragEnd: (e, { offset, velocity }) => {
          if (isFullscreen) return;
          const swipe = Math.abs(offset.x);
          if (swipe > 50) paginate(offset.x > 0 ? -1 : 1);
        },
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ import_react.default.createElement(
        "img",
        {
          src: selectedImage.src,
          alt: selectedImage.title,
          className: `w-full h-full ${isFullscreen ? "object-contain" : "object-cover"}`
        }
      ),
      /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute inset-0 p-6 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-xl md:text-2xl font-serif text-white" }, selectedImage.title), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm text-attire-gold" }, selectedImage.collection)), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center self-end gap-3" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: (e) => {
        e.stopPropagation();
        toggleFavorite(selectedImage.id);
      }, className: "p-3 rounded-full transition-colors" }, /* @__PURE__ */ import_react.default.createElement(Heart, { className: `w-5 h-5 transition-all ${favorites.includes(selectedImage.id) ? "fill-red-500 text-red-500" : "text-white"}` })), /* @__PURE__ */ import_react.default.createElement("button", { onClick: handleToggleFullscreen, className: "p-3 rounded-full transition-colors" }, isFullscreen ? /* @__PURE__ */ import_react.default.createElement(Minimize, { className: "w-5 h-5 text-white" }) : /* @__PURE__ */ import_react.default.createElement(Maximize2, { className: "w-5 h-5 text-white" }))))
    )), !isFullscreen && // Navigation buttons hidden in fullscreen mode
    /* @__PURE__ */ import_react.default.createElement("div", { onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => paginate(-1), className: "absolute left-4 md:left-10 xl:left-24 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors" }, /* @__PURE__ */ import_react.default.createElement(ChevronLeft, { className: "w-7 h-7 text-white" })), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => paginate(1), className: "absolute right-4 md:right-10 xl:right-24 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors" }, /* @__PURE__ */ import_react.default.createElement(ChevronRight, { className: "w-7 h-7 text-white" }))))
  );
};
var Lightbox_default = Lightbox;

export {
  wrap,
  Lightbox_default
};
//# sourceMappingURL=chunk-D2GBM4HJ.js.map
