import {
  Link
} from "./chunk-VBCTODT4.js";
import {
  collections
} from "./chunk-DDYLPRYX.js";
import {
  motion
} from "./chunk-2V3EIBA2.js";
import {
  config_default
} from "./chunk-4VPB5FGN.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/CollectionsPage.jsx
var import_react2 = __toESM(require_react());

// resources/js/components/pages/collections/CollectionCard.jsx
var import_react = __toESM(require_react());
var CollectionCard = ({ collection }) => {
  return /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      className: "group cursor-pointer",
      whileHover: { y: -8 },
      transition: { type: "spring", stiffness: 300 }
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "overflow-hidden h-[28rem]" }, /* @__PURE__ */ import_react.default.createElement(
      motion.img,
      {
        src: collection.image,
        alt: collection.title,
        className: "w-full h-full object-cover",
        style: { imageRendering: "crisp-edges" },
        initial: { scale: 1 },
        whileHover: { scale: 1.05 },
        transition: { duration: 0.4, ease: "easeOut" }
      }
    )),
    "            ",
    /* @__PURE__ */ import_react.default.createElement("div", { className: "pt-6 text-center" }, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-2xl font-serif text-attire-accent" }, collection.title), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-base text-gray-600 mt-2 mb-4" }, collection.description), /* @__PURE__ */ import_react.default.createElement("span", { className: "inline-block bg-gray-100 text-gray-700 text-xs font-medium px-4 py-2 rounded-full" }, collection.itemsCount, " items"))
  );
};
var CollectionCard_default = CollectionCard;

// resources/js/components/pages/CollectionsPage.jsx
var PageHeader = () => /* @__PURE__ */ import_react2.default.createElement("div", { className: "text-center py-16 sm:py-24 bg-attire-navy" }, /* @__PURE__ */ import_react2.default.createElement(
  motion.h1,
  {
    className: "text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-4",
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  },
  "Our Collections"
), /* @__PURE__ */ import_react2.default.createElement(
  motion.p,
  {
    className: "text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4",
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
  },
  "Discover our curated collections, where timeless elegance meets modern craftsmanship. Each piece is designed to elevate your personal style."
));
var CollectionsPage = () => {
  const [loadingCollections, setLoadingCollections] = (0, import_react2.useState)(true);
  (0, import_react2.useEffect)(() => {
    setTimeout(() => {
      setLoadingCollections(false);
    }, 500);
  }, []);
  const browseAllCard = {
    id: 0,
    slug: "products",
    title: "Browse All",
    description: "Explore our entire range of products.",
    image: `${config_default}/uploads/collections/default/of3.jpg`,
    itemsCount: "All"
  };
  const collectionsWithBrowseAll = [...collections, browseAllCard];
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "min-h-screen bg-attire-navy text-white" }, /* @__PURE__ */ import_react2.default.createElement(PageHeader, null), /* @__PURE__ */ import_react2.default.createElement("main", { className: "max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16" }, loadingCollections ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "text-center" }, "Loading collections...") : /* @__PURE__ */ import_react2.default.createElement(
    motion.div,
    {
      layout: true,
      className: "grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
    },
    collectionsWithBrowseAll.map((collection) => /* @__PURE__ */ import_react2.default.createElement(Link, { to: collection.id === 0 ? "/products" : `/products?collection=${collection.slug}`, key: collection.id }, /* @__PURE__ */ import_react2.default.createElement(
      motion.div,
      {
        layout: true,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" }
      },
      collection.id === 0 ? /* @__PURE__ */ import_react2.default.createElement(
        "div",
        {
          className: "group cursor-pointer relative",
          style: {
            height: "28rem",
            borderRadius: "0.25rem",
            overflow: "hidden"
          }
        },
        /* @__PURE__ */ import_react2.default.createElement(
          "div",
          {
            className: "absolute inset-0 bg-cover bg-center",
            style: { backgroundImage: `url(${collection.image})` }
          }
        ),
        /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 transition-opacity", style: { backgroundColor: "#f5a81c" } }),
        /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative z-10 flex items-center justify-center h-full" }, /* @__PURE__ */ import_react2.default.createElement("h3", { className: "text-3xl font-serif text-white" }, collection.title))
      ) : /* @__PURE__ */ import_react2.default.createElement(CollectionCard_default, { collection })
    )))
  )));
};
var CollectionsPage_default = CollectionsPage;
export {
  CollectionsPage_default as default
};
//# sourceMappingURL=CollectionsPage-D6CU6TPW.js.map
