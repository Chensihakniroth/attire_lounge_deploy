import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/context/FavoritesContext.jsx
var import_react = __toESM(require_react());
var FavoritesContext = (0, import_react.createContext)();
var useFavorites = () => (0, import_react.useContext)(FavoritesContext);
var FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = (0, import_react.useState)(() => {
    try {
      const localData = localStorage.getItem("attire-lounge-favorites");
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse favorites from localStorage", error);
      return [];
    }
  });
  (0, import_react.useEffect)(() => {
    try {
      localStorage.setItem("attire-lounge-favorites", JSON.stringify(favorites));
    } catch (error) {
      console.error("Could not save favorites to localStorage", error);
    }
  }, [favorites]);
  const addFavorite = (productId) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  };
  const removeFavorite = (productId) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  };
  const isFavorited = (productId) => {
    return favorites.includes(productId);
  };
  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorited
  };
  return /* @__PURE__ */ import_react.default.createElement(FavoritesContext.Provider, { value }, children);
};

export {
  useFavorites,
  FavoritesProvider
};
//# sourceMappingURL=chunk-42C6ZG54.js.map
