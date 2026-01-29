import {
  Lightbox_default,
  wrap
} from "./chunk-D2GBM4HJ.js";
import {
  AnimatePresence,
  motion
} from "./chunk-2V3EIBA2.js";
import {
  ChevronLeft,
  ChevronRight
} from "./chunk-MEGF3DJD.js";
import {
  config_default
} from "./chunk-4VPB5FGN.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/LookbookPage.jsx
var import_react = __toESM(require_react());
var LookbookPage = () => {
  const [images] = (0, import_react.useState)([
    // Havana Collection - Sartorial
    { id: 1, src: `${config_default}/uploads/collections/default/hvn0.jpg`, title: "Havana Breezy", collection: "Havana Collection", category: ["sartorial"], span: "col-span-2 row-span-2" },
    { id: 2, src: `${config_default}/uploads/collections/default/hvn1.jpg`, title: "Sunset Casual", collection: "Havana Collection", category: ["sartorial"], span: "col-span-1 row-span-1" },
    { id: 3, src: `${config_default}/uploads/collections/default/hvn2.jpg`, title: "Cuban Nights", collection: "Havana Collection", category: ["sartorial"], span: "col-span-1 row-span-2" },
    { id: 4, src: `${config_default}/uploads/collections/default/hvn3.jpg`, title: "Linen Classic", collection: "Havana Collection", category: ["sartorial"], span: "col-span-1 row-span-1" },
    { id: 5, src: `${config_default}/uploads/collections/default/hvn4.jpg`, title: "Tropical Sophistication", collection: "Havana Collection", category: ["sartorial"], span: "col-span-1 row-span-2" },
    { id: 6, src: `${config_default}/uploads/collections/default/hvn5.jpg`, title: "Coastal Charm", collection: "Havana Collection", category: ["sartorial"], span: "col-span-1 row-span-1" },
    { id: 7, src: `${config_default}/uploads/collections/default/hvn6.jpg`, title: "Island Elegance", collection: "Havana Collection", category: ["sartorial"], span: "col-span-1 row-span-1" },
    { id: 8, src: `${config_default}/uploads/collections/default/hvn7.jpg`, title: "Seaside Style", collection: "Havana Collection", category: ["sartorial"], span: "col-span-2 row-span-1" },
    // Mocha Mousse Collection - Sartorial
    { id: 10, src: `${config_default}/uploads/collections/default/mm1.jpg`, title: "Espresso Edge", collection: "Mocha Mousse 25", category: ["sartorial"], span: "col-span-1 row-span-2" },
    { id: 11, src: `${config_default}/uploads/collections/default/mm2.jpg`, title: "Urban Comfort", collection: "Mocha Mousse 25", category: ["sartorial"], span: "col-span-1 row-span-1" },
    { id: 12, src: `${config_default}/uploads/collections/default/mm3.jpg`, title: "Downtown Vibe", collection: "Mocha Mousse 25", category: ["sartorial"], span: "col-span-1 row-span-1" },
    { id: 13, src: `${config_default}/uploads/collections/default/mm4.jpg`, title: "City Classic", collection: "Mocha Mousse 25", category: ["sartorial"], span: "col-span-1 row-span-2" },
    { id: 14, src: `${config_default}/uploads/collections/default/mm5.jpg`, title: "Metro Style", collection: "Mocha Mousse 25", category: ["sartorial"], span: "col-span-2 row-span-2" },
    { id: 15, src: `${config_default}/uploads/collections/default/mm6.jpg`, title: "Modern Mocha", collection: "Mocha Mousse 25", category: ["sartorial"], span: "col-span-1 row-span-1" },
    { id: 16, src: `${config_default}/uploads/collections/default/mm7.jpg`, title: "Refined Casual", collection: "Mocha Mousse 25", category: ["sartorial"], span: "col-span-1 row-span-1" },
    // Business Collection (formerly Office)
    { id: 17, src: `${config_default}/uploads/collections/default/of1.jpg`, title: "Boardroom Ready", collection: "Office Collection", category: ["business"], span: "col-span-1 row-span-1" },
    { id: 18, src: `${config_default}/uploads/collections/default/of2.jpg`, title: "Executive Presence", collection: "Office Collection", category: ["business"], span: "col-span-1 row-span-2" },
    { id: 19, src: `${config_default}/uploads/collections/default/of3.jpg`, title: "Corporate Style", collection: "Office Collection", category: ["business"], span: "col-span-1 row-span-1" },
    { id: 20, src: `${config_default}/uploads/collections/default/of4.jpg`, title: "Business Formal", collection: "Office Collection", category: ["business", "formal"], span: "col-span-2 row-span-1" },
    { id: 21, src: `${config_default}/uploads/collections/default/of5.jpg`, title: "Professional Polish", collection: "Office Collection", category: ["business"], span: "col-span-1 row-span-1" },
    // Groom & Formal Collection
    { id: 22, src: `${config_default}/uploads/collections/default/g1.jpg`, title: "Classic Tuxedo", collection: "Groom Collection", category: ["grooms", "formal"], span: "col-span-1 row-span-1" },
    { id: 23, src: `${config_default}/uploads/collections/default/g2.jpg`, title: "Wedding Day", collection: "Groom Collection", category: ["grooms", "formal"], span: "col-span-1 row-span-2" },
    { id: 24, src: `${config_default}/uploads/collections/default/g3.jpg`, title: "Groomsmen Style", collection: "Groom Collection", category: ["grooms", "formal"], span: "col-span-1 row-span-1" },
    { id: 25, src: `${config_default}/uploads/collections/default/g4.jpg`, title: "Elegant Ceremony", collection: "Groom Collection", category: ["grooms", "formal"], span: "col-span-2 row-span-1" },
    { id: 26, src: `${config_default}/uploads/collections/default/g5.jpg`, title: "Reception Look", collection: "Groom Collection", category: ["grooms", "formal"], span: "col-span-1 row-span-1" },
    { id: 27, src: `${config_default}/uploads/collections/default/g6.jpg`, title: "Tailored Perfection", collection: "Groom Collection", category: ["grooms", "formal"], span: "col-span-1 row-span-2" },
    { id: 28, src: `${config_default}/uploads/collections/default/g7.jpg`, title: "Celebration Suit", collection: "Groom Collection", category: ["grooms", "formal"], span: "col-span-1 row-span-1" },
    { id: 29, src: `${config_default}/uploads/collections/default/g8.jpg`, title: "Formal Event", collection: "Groom Collection", category: ["grooms", "formal"], span: "col-span-2 row-span-2" }
  ]);
  const [[page, direction], setPage] = (0, import_react.useState)([null, 0]);
  const [filter, setFilter] = (0, import_react.useState)("all");
  const [favorites, setFavorites] = (0, import_react.useState)([]);
  const filteredImages = images.filter((img) => filter === "all" || img.category.includes(filter));
  const imageIndex = page !== null ? wrap(0, filteredImages.length, page) : null;
  const selectedImage = page !== null ? filteredImages[imageIndex] : null;
  (0, import_react.useEffect)(() => {
    const savedFavorites = localStorage.getItem("lookbook_favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
      }
    }
  }, []);
  (0, import_react.useEffect)(() => {
    localStorage.setItem("lookbook_favorites", JSON.stringify(favorites));
  }, [favorites]);
  const openLightbox = (index) => setPage([index, 0]);
  const closeLightbox = () => setPage([null, 0]);
  const paginate = (newDirection) => {
    if (page === null || !filteredImages.length) return;
    setPage([page + newDirection, newDirection]);
  };
  const toggleFavorite = (id) => {
    setFavorites(
      (prev) => prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };
  (0, import_react.useEffect)(() => {
    const handleKeyDown = (e) => {
      if (page === null) return;
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    }
  };
  const categories = [
    { id: "all", name: "All" },
    { id: "sartorial", name: "Sartorial" },
    { id: "grooms", name: "Grooms" },
    { id: "formal", name: "Formal" },
    { id: "business", name: "Business" }
  ];
  const scrollContainerRef = (0, import_react.useRef)(null);
  const scroll = (direction2) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction2 * 200, behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      className: "h-full w-full flex flex-col bg-attire-navy overflow-hidden relative"
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "w-full p-6 bg-attire-dark/20 backdrop-blur-sm z-10 lg:pt-24" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        onClick: () => scroll(-1),
        className: "p-1 text-white/50 hover:text-white md:hidden"
      },
      /* @__PURE__ */ import_react.default.createElement(ChevronLeft, { size: 20 })
    ), /* @__PURE__ */ import_react.default.createElement("div", { ref: scrollContainerRef, className: "flex-grow flex items-center justify-start md:justify-center gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-2" }, categories.map((category) => /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        key: category.id,
        onClick: () => setFilter(category.id),
        className: `flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors relative ${filter === category.id ? "text-white" : "text-attire-silver/70 hover:text-white"}`
      },
      filter === category.id && /* @__PURE__ */ import_react.default.createElement(
        motion.div,
        {
          layoutId: "lookbook-filter-active",
          className: "absolute inset-0 bg-attire-accent shadow-md rounded-full",
          transition: { type: "spring", stiffness: 200, damping: 20 }
        }
      ),
      /* @__PURE__ */ import_react.default.createElement("span", { className: "relative z-10" }, category.name)
    ))), /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        onClick: () => scroll(1),
        className: "p-1 text-white/50 hover:text-white md:hidden"
      },
      /* @__PURE__ */ import_react.default.createElement(ChevronRight, { size: 20 })
    ))),
    /* @__PURE__ */ import_react.default.createElement(
      motion.div,
      {
        id: "main-content",
        className: "flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-y"
      },
      /* @__PURE__ */ import_react.default.createElement(
        motion.div,
        {
          key: filter,
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 lg:p-8"
        },
        filteredImages.map((image, index) => /* @__PURE__ */ import_react.default.createElement(
          "div",
          {
            key: image.id,
            className: "group relative cursor-pointer overflow-hidden h-[28rem]",
            onClick: () => openLightbox(index)
          },
          /* @__PURE__ */ import_react.default.createElement(
            "img",
            {
              src: image.src,
              alt: image.title,
              className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            }
          )
        ))
      )
    ),
    /* @__PURE__ */ import_react.default.createElement(AnimatePresence, null, selectedImage && /* @__PURE__ */ import_react.default.createElement(
      Lightbox_default,
      {
        key: "lightbox",
        selectedImage,
        closeLightbox,
        direction,
        paginate,
        toggleFavorite,
        favorites
      }
    ))
  );
};
var LookbookPage_default = LookbookPage;
export {
  LookbookPage_default as default
};
//# sourceMappingURL=LookbookPage-XAI4YQVZ.js.map
