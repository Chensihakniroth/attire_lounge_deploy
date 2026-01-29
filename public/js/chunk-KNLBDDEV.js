import {
  motion
} from "./chunk-2V3EIBA2.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/collections/ItemCard.jsx
var import_react = __toESM(require_react());
var itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};
var ItemCard = ({ product, openLightbox }) => {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : "/path/to/default/image.jpg";
  return /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      layout: true,
      className: "text-center",
      onClick: openLightbox,
      variants: itemVariants
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "relative overflow-hidden mb-4 aspect-w-3 aspect-h-4 group" }, /* @__PURE__ */ import_react.default.createElement("img", { src: imageUrl, alt: product.name, className: "w-full h-full object-cover" })),
    /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-base text-attire-cream" }, product.name)
  );
};
var ItemCard_default = ItemCard;

export {
  ItemCard_default
};
//# sourceMappingURL=chunk-KNLBDDEV.js.map
