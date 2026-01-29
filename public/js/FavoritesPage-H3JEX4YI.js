import {
  ItemCard_default
} from "./chunk-KNLBDDEV.js";
import {
  Link
} from "./chunk-VBCTODT4.js";
import {
  useFavorites
} from "./chunk-42C6ZG54.js";
import {
  products
} from "./chunk-DDYLPRYX.js";
import {
  motion
} from "./chunk-2V3EIBA2.js";
import {
  ChevronLeft
} from "./chunk-MEGF3DJD.js";
import "./chunk-4VPB5FGN.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/FavoritesPage.jsx
var import_react = __toESM(require_react());
var FavoritesPage = () => {
  const { favorites } = useFavorites();
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen bg-attire-navy" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "text-center py-16 sm:py-24 border-b border-attire-silver/10" }, /* @__PURE__ */ import_react.default.createElement(
    motion.h1,
    {
      className: "text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-4",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    "Your Favorites"
  ), /* @__PURE__ */ import_react.default.createElement(Link, { to: "/collections", className: "flex items-center justify-center gap-2 text-sm text-white hover:text-attire-accent transition-colors" }, /* @__PURE__ */ import_react.default.createElement(ChevronLeft, { size: 16 }), "Back to Collections")), /* @__PURE__ */ import_react.default.createElement("main", { className: "max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12" }, favoriteProducts.length > 0 ? /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-8",
      variants: containerVariants,
      initial: "hidden",
      animate: "visible"
    },
    favoriteProducts.map((item) => /* @__PURE__ */ import_react.default.createElement(ItemCard_default, { key: item.id, product: item }))
  ) : /* @__PURE__ */ import_react.default.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "text-center py-20 w-full" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-2xl font-serif text-attire-cream" }, "No favorites yet."), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-attire-cream mt-2" }, "Browse our collections and add some products to your favorites."), /* @__PURE__ */ import_react.default.createElement(Link, { to: "/collections", className: "mt-6 inline-block bg-attire-accent text-attire-dark font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity" }, "Browse Collections"))));
};
var FavoritesPage_default = FavoritesPage;
export {
  FavoritesPage_default as default
};
//# sourceMappingURL=FavoritesPage-H3JEX4YI.js.map
