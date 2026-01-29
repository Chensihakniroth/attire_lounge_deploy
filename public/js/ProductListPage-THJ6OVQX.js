import {
  Lightbox_default,
  wrap
} from "./chunk-D2GBM4HJ.js";
import {
  ItemCard_default
} from "./chunk-KNLBDDEV.js";
import {
  Link,
  useLocation
} from "./chunk-VBCTODT4.js";
import {
  useFavorites
} from "./chunk-42C6ZG54.js";
import {
  collections,
  products
} from "./chunk-DDYLPRYX.js";
import {
  AnimatePresence,
  motion
} from "./chunk-2V3EIBA2.js";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X
} from "./chunk-MEGF3DJD.js";
import "./chunk-4VPB5FGN.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/ProductListPage.jsx
var import_react2 = __toESM(require_react());

// resources/js/hooks/useDebounce.js
var import_react = __toESM(require_react());

// resources/js/components/pages/ProductListPage.jsx
var sortOptions = [
  { value: "popularity-desc", label: "Most Popular" },
  { value: "createdAt-desc", label: "Newest" },
  { value: "createdAt-asc", label: "Oldest" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" }
];
var useQuery = () => {
  return new URLSearchParams(useLocation().search);
};
var ProductListPage = () => {
  const query = useQuery();
  const location = useLocation();
  const collectionQuery = query.get("collection");
  const [sortOrder, setSortOrder] = (0, import_react2.useState)("popularity-desc");
  const [priceRange, setPriceRange] = (0, import_react2.useState)([0, 1e3]);
  const [[page, direction], setPage] = (0, import_react2.useState)([null, 0]);
  const { favorites, addFavorite, removeFavorite, isFavorited } = useFavorites();
  const [selectedCollections, setSelectedCollections] = (0, import_react2.useState)(() => {
    return collectionQuery ? [collectionQuery] : [];
  });
  const { pageTitle, filteredProducts } = (0, import_react2.useMemo)(() => {
    let products2 = [...products];
    if (selectedCollections.length > 0) {
      products2 = products2.filter((p) => selectedCollections.includes(p.collectionSlug));
    }
    const currentCollectionDetails = collections.find((c) => c.slug === selectedCollections[0]);
    const pageTitle2 = selectedCollections.length === 1 && currentCollectionDetails ? currentCollectionDetails.title : "All Products";
    const [sortKey, sortDirection] = sortOrder.split("-");
    products2.sort((a, b) => {
      if (sortKey === "price") {
        return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
      }
      if (sortKey === "createdAt") {
        return sortDirection === "asc" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortKey === "popularity") {
        return sortDirection === "asc" ? a.popularity - b.popularity : b.popularity - a.popularity;
      }
      if (sortKey === "name") {
        if (a.name < b.name) return sortDirection === "asc" ? -1 : 1;
        if (a.name > b.name) return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
    return { pageTitle: pageTitle2, filteredProducts: products2 };
  }, [sortOrder, selectedCollections]);
  const imageIndex = page !== null ? wrap(0, filteredProducts.length, page) : null;
  const selectedImage = page !== null ? filteredProducts[imageIndex] : null;
  const openLightbox = (index) => setPage([index, 0]);
  const closeLightbox = () => setPage([null, 0]);
  const paginate = (newDirection) => {
    if (page === null || !filteredProducts.length) return;
    setPage([page + newDirection, newDirection]);
  };
  const toggleFavorite = (id) => {
    if (isFavorited(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };
  (0, import_react2.useEffect)(() => {
    const handleKeyDown = (e) => {
      if (page === null) return;
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page]);
  (0, import_react2.useEffect)(() => {
    const newCollectionQuery = new URLSearchParams(location.search).get("collection");
    if (newCollectionQuery && !selectedCollections.includes(newCollectionQuery)) {
      setSelectedCollections([newCollectionQuery]);
    } else if (!newCollectionQuery && selectedCollections.length > 0 && collectionQuery) {
    }
  }, [location.search]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const handleCollectionToggle = (slug) => {
    setSelectedCollections((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  };
  const clearFilters = () => {
    setSelectedCollections([]);
  };
  const removeCollectionFilter = (slug) => {
    setSelectedCollections((prev) => prev.filter((s) => s !== slug));
  };
  const isDefaultPrice = true;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "min-h-screen bg-attire-navy" }, /* @__PURE__ */ import_react2.default.createElement("header", { className: "text-center py-16 sm:py-24" }, /* @__PURE__ */ import_react2.default.createElement(
    motion.h1,
    {
      className: "text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-4",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    pageTitle
  ), /* @__PURE__ */ import_react2.default.createElement(Link, { to: "/collections", className: "flex items-center justify-center gap-2 text-sm text-white hover:text-black transition-colors" }, /* @__PURE__ */ import_react2.default.createElement(ChevronLeft, { size: 16 }), "Back to Collections")), /* @__PURE__ */ import_react2.default.createElement("main", { className: "max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12" }, /* @__PURE__ */ import_react2.default.createElement(
    Controls,
    {
      sortOrder,
      setSortOrder,
      selectedCollections,
      handleCollectionToggle,
      clearFilters,
      removeCollectionFilter
    }
  ), /* @__PURE__ */ import_react2.default.createElement(
    motion.div,
    {
      className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-8",
      variants: containerVariants,
      initial: "hidden",
      animate: "visible"
    },
    filteredProducts.map((item, index) => /* @__PURE__ */ import_react2.default.createElement(ItemCard_default, { key: item.id, product: item, openLightbox: () => openLightbox(index) }))
  ), filteredProducts.length === 0 && /* @__PURE__ */ import_react2.default.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "text-center py-20 w-full" }, /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-2xl font-serif text-attire-cream" }, "No products found."), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-attire-cream mt-2" }, "Try adjusting your filters or search term."))), /* @__PURE__ */ import_react2.default.createElement(AnimatePresence, null, selectedImage && /* @__PURE__ */ import_react2.default.createElement(
    Lightbox_default,
    {
      key: "lightbox",
      selectedImage: {
        ...selectedImage,
        src: selectedImage.images[0],
        title: selectedImage.name,
        collection: selectedImage.collection
      },
      closeLightbox,
      direction,
      paginate,
      toggleFavorite,
      favorites
    }
  )));
};
var Controls = ({
  sortOrder,
  setSortOrder,
  selectedCollections,
  handleCollectionToggle,
  clearFilters,
  removeCollectionFilter
}) => {
  const scrollContainerRef = (0, import_react2.useRef)(null);
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction * 150, behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex flex-col gap-4 mb-6 p-4 bg-black/10 rounded-lg shadow-sm border border-attire-silver/10" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex flex-col md:flex-row items-center justify-between gap-4 w-full" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center w-full" }, /* @__PURE__ */ import_react2.default.createElement("button", { onClick: () => scroll(-1), className: "p-1 text-attire-silver/70 hover:text-white md:hidden" }, /* @__PURE__ */ import_react2.default.createElement(ChevronLeft, { size: 20 })), /* @__PURE__ */ import_react2.default.createElement("div", { ref: scrollContainerRef, className: "flex items-center gap-2 overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-sm font-medium text-attire-silver flex-shrink-0" }, "Collections:"), collections.map((collection) => /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      key: collection.id,
      onClick: () => handleCollectionToggle(collection.slug),
      className: `px-3 py-1 text-sm rounded-full transition-colors flex-shrink-0 ${selectedCollections.includes(collection.slug) ? "bg-attire-accent text-attire-dark font-semibold" : "bg-attire-charcoal text-attire-silver hover:bg-attire-navy"}`
    },
    collection.title
  ))), /* @__PURE__ */ import_react2.default.createElement("button", { onClick: () => scroll(1), className: "p-1 text-attire-silver/70 hover:text-white md:hidden" }, /* @__PURE__ */ import_react2.default.createElement(ChevronRight, { size: 20 }))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-4 flex-shrink-0" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-sm font-medium text-attire-silver hidden lg:block" }, "Sort by:"), /* @__PURE__ */ import_react2.default.createElement(
    FilterSortDropdown,
    {
      sortOrder,
      setSortOrder,
      clearFilters
    }
  ))), selectedCollections.length > 0 && /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center flex-wrap gap-2 pt-4 border-t border-attire-silver/10" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-sm font-medium text-attire-silver" }, "Active Filters:"), selectedCollections.map((slug) => {
    const collection = collections.find((c) => c.slug === slug);
    return /* @__PURE__ */ import_react2.default.createElement(FilterTag, { key: slug, onRemove: () => removeCollectionFilter(slug) }, collection?.title || slug);
  }), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      onClick: clearFilters,
      className: "text-sm font-semibold text-attire-accent hover:underline ml-auto"
    },
    "Clear All"
  )));
};
var FilterTag = ({ children, onRemove }) => /* @__PURE__ */ import_react2.default.createElement(
  motion.div,
  {
    layout: true,
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    className: "flex items-center gap-2 bg-attire-accent text-attire-dark rounded-full pl-3 pr-2 py-1 text-sm font-medium"
  },
  /* @__PURE__ */ import_react2.default.createElement("span", null, children),
  /* @__PURE__ */ import_react2.default.createElement("button", { onClick: onRemove, className: "text-attire-dark/80 hover:text-attire-dark" }, /* @__PURE__ */ import_react2.default.createElement(X, { size: 16 }))
);
var FilterSortDropdown = ({
  sortOrder,
  setSortOrder,
  clearFilters
}) => {
  const [isOpen, setIsOpen] = (0, import_react2.useState)(false);
  const dropdownRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const allSortOptions = [...sortOptions];
  const selectedLabel = allSortOptions.find((opt) => opt.value === sortOrder)?.label || "Sort & Filter";
  return /* @__PURE__ */ import_react2.default.createElement("div", { ref: dropdownRef, className: "relative w-64 z-20" }, /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      onClick: () => setIsOpen(!isOpen),
      className: "flex items-center justify-between w-full px-4 py-2 bg-attire-charcoal border border-attire-silver/20 rounded-full text-sm font-medium text-white hover:bg-attire-navy focus:outline-none focus:ring-2 focus:ring-attire-accent"
    },
    /* @__PURE__ */ import_react2.default.createElement("span", null, selectedLabel),
    /* @__PURE__ */ import_react2.default.createElement(motion.div, { animate: { rotate: isOpen ? 180 : 0 } }, /* @__PURE__ */ import_react2.default.createElement(ChevronDown, { size: 16 }))
  ), /* @__PURE__ */ import_react2.default.createElement(AnimatePresence, null, isOpen && /* @__PURE__ */ import_react2.default.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      className: "absolute right-0 mt-2 w-full bg-attire-charcoal border border-attire-silver/10 rounded-md shadow-lg overflow-hidden p-4"
    },
    /* @__PURE__ */ import_react2.default.createElement("div", { className: "mb-4" }, /* @__PURE__ */ import_react2.default.createElement("h4", { className: "font-semibold text-lg mb-2 text-white" }, "Sort by"), sortOptions.map((option) => /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        key: option.value,
        onClick: () => {
          setSortOrder(option.value);
          setIsOpen(false);
        },
        className: `px-2 py-1 text-sm cursor-pointer rounded-md hover:bg-attire-navy ${sortOrder === option.value ? "font-bold bg-attire-navy text-white" : "font-medium text-attire-silver"}`
      },
      /* @__PURE__ */ import_react2.default.createElement("span", null, option.label)
    ))),
    /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        onClick: () => {
          clearFilters();
          setIsOpen(false);
        },
        className: "w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-attire-dark bg-attire-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-attire-accent"
      },
      "Clear All Filters"
    )
  )));
};
var ProductListPage_default = ProductListPage;
export {
  ProductListPage_default as default
};
//# sourceMappingURL=ProductListPage-THJ6OVQX.js.map
