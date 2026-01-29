import {
  api_default
} from "./chunk-BKED7RJF.js";
import "./chunk-M5DYWXOV.js";
import {
  motion
} from "./chunk-2V3EIBA2.js";
import {
  ArrowRight,
  Check,
  Gift,
  Loader,
  Mail,
  Phone,
  User
} from "./chunk-MEGF3DJD.js";
import {
  config_default
} from "./chunk-4VPB5FGN.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/CustomizeGiftPage.jsx
var import_react = __toESM(require_react());
var giftOptions = {
  ties: [
    { id: "tie-brown69", name: "Silk Tie", color: "Brown", image: `${config_default}/uploads/collections/accessories/brown69.jpg` },
    { id: "tie-cream49", name: "Silk Tie", color: "Cream", image: `${config_default}/uploads/collections/accessories/cream49.jpg` },
    { id: "tie-cyan69", name: "Silk Tie", color: "Cyan", image: `${config_default}/uploads/collections/accessories/cyan69.jpg` },
    { id: "tie-blue69", name: "Silk Tie", color: "Blue", image: `${config_default}/uploads/collections/accessories/blue69.jpg` },
    { id: "tie-green49", name: "Silk Tie", color: "Green", image: `${config_default}/uploads/collections/accessories/green49.jpg` },
    { id: "tie-white69", name: "Silk Tie", color: "White", image: `${config_default}/uploads/collections/accessories/white69.jpg` },
    { id: "tie-red69", name: "Silk Tie", color: "Red", image: `${config_default}/uploads/collections/accessories/red69.jpg` }
  ],
  pocketSquares: [
    { id: "ps-blue", name: "Linen Pocket Square", color: "Blue", image: `${config_default}/uploads/collections/accessories/psblue.jpg` },
    { id: "ps-green", name: "Linen Pocket Square", color: "Green", image: `${config_default}/uploads/collections/accessories/psgreen.jpg` },
    { id: "ps-pink", name: "Linen Pocket Square", color: "Pink", image: `${config_default}/uploads/collections/accessories/pspink.jpg` },
    { id: "ps-red", name: "Linen Pocket Square", color: "Red", image: `${config_default}/uploads/collections/accessories/psred.jpg` },
    { id: "ps-yellowgreen", name: "Linen Pocket Square", color: "Yellow Green", image: `${config_default}/uploads/collections/accessories/psyellowgreen.jpg` },
    { id: "ps-yellow", name: "Linen Pocket Square", color: "Yellow", image: `${config_default}/uploads/collections/accessories/psyellow.jpg` }
  ],
  boxes: [
    { id: "box-small", name: "Small Box", image: `${config_default}/uploads/collections/accessories/smallbox.jpg` },
    { id: "box-mid", name: "Mid Box", image: `${config_default}/uploads/collections/accessories/midbox.jpg` },
    { id: "box-designer", name: "Designer Box", image: `${config_default}/uploads/collections/accessories/designer_box.jpg` }
  ]
};
var SelectionCard = ({ item, isSelected, onSelect }) => /* @__PURE__ */ import_react.default.createElement(
  motion.div,
  {
    onClick: onSelect,
    className: `relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${isSelected ? "border-attire-accent" : "border-transparent"}`,
    whileHover: { scale: 1.05 }
  },
  /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute inset-0 bg-black/20 z-10" }),
  /* @__PURE__ */ import_react.default.createElement("img", { src: item.image, alt: item.name, className: "w-full h-full object-cover" }),
  /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute bottom-0 left-0 p-3 z-20" }, /* @__PURE__ */ import_react.default.createElement("h4", { className: "font-semibold text-white" }, item.name), item.color && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm text-white/80" }, item.color)),
  isSelected && /* @__PURE__ */ import_react.default.createElement(
    motion.div,
    {
      layoutId: `selected-check-${item.id}`,
      className: "absolute top-2 right-2 bg-attire-accent text-attire-dark rounded-full w-6 h-6 flex items-center justify-center z-20"
    },
    /* @__PURE__ */ import_react.default.createElement(Check, { size: 16 })
  )
);
var InputField = ({ icon, ...props }) => /* @__PURE__ */ import_react.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" }, icon), /* @__PURE__ */ import_react.default.createElement(
  "input",
  {
    ...props,
    className: "w-full pl-10 p-3 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 focus:border-white focus:ring-1 focus:ring-white transition-colors"
  }
));
var CustomizeGiftPage = () => {
  const [step, setStep] = (0, import_react.useState)(1);
  const [formData, setFormData] = (0, import_react.useState)({ name: "", email: "", phone: "" });
  const [selectedTie, setSelectedTie] = (0, import_react.useState)(null);
  const [selectedPocketSquare, setSelectedPocketSquare] = (0, import_react.useState)(null);
  const [selectedBox, setSelectedBox] = (0, import_react.useState)(null);
  const [note, setNote] = (0, import_react.useState)("");
  const [submissionStatus, setSubmissionStatus] = (0, import_react.useState)({ state: "idle" });
  const [formErrors, setFormErrors] = (0, import_react.useState)({});
  const [availableBoxes, setAvailableBoxes] = (0, import_react.useState)([]);
  (0, import_react.useEffect)(() => {
    let newAvailableBoxes = [];
    if (selectedTie && selectedPocketSquare) {
      newAvailableBoxes = giftOptions.boxes;
    } else if (selectedTie && !selectedPocketSquare) {
      newAvailableBoxes = giftOptions.boxes.filter((box) => box.id !== "box-designer");
    } else {
      newAvailableBoxes = [];
    }
    setAvailableBoxes(newAvailableBoxes);
    if (selectedBox && !newAvailableBoxes.some((box) => box.id === selectedBox.id)) {
      setSelectedBox(null);
    }
  }, [selectedTie, selectedPocketSquare]);
  (0, import_react.useEffect)(() => {
    if (submissionStatus.state === "success") {
      window.scrollTo(0, 0);
    }
  }, [submissionStatus.state]);
  const isItemsComplete = selectedTie && selectedPocketSquare && selectedBox;
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid.";
    if (!formData.phone.trim()) errors.phone = "Phone is required.";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setStep(2);
  };
  const handleFinalize = async () => {
    if (!isItemsComplete) return;
    const preferences = `
Tie: ${selectedTie.name} (${selectedTie.color})
Pocket Square: ${selectedPocketSquare.name} (${selectedPocketSquare.color})
Box: ${selectedBox.name}
${note ? `Note: "${note}"` : ""}
        `.trim();
    const dataToSend = { ...formData, preferences };
    setSubmissionStatus({ state: "loading" });
    try {
      await api_default.submitGiftRequest(dataToSend);
      setSubmissionStatus({ state: "success" });
    } catch (error) {
      setSubmissionStatus({ state: "error", message: "Something went wrong. Please try again." });
    }
  };
  const resetForm = () => {
    setStep(1);
    setFormData({ name: "", email: "", phone: "" });
    setSelectedTie(null);
    setSelectedPocketSquare(null);
    setSelectedBox(null);
    setNote("");
    setSubmissionStatus({ state: "idle" });
    setFormErrors({});
  };
  if (submissionStatus.state === "success") {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen bg-attire-navy py-12 md:py-24 flex items-center justify-center" }, /* @__PURE__ */ import_react.default.createElement(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "max-w-md w-full mx-auto px-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-8 text-center" }, /* @__PURE__ */ import_react.default.createElement(Check, { size: 48, className: "mx-auto text-green-400 mb-4" }), /* @__PURE__ */ import_react.default.createElement("h1", { className: "text-3xl font-serif text-white mb-4" }, "Request Sent!"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-attire-silver mb-8" }, "Thank you, ", formData.name, ". We have received your custom gift request and will contact you shortly."), /* @__PURE__ */ import_react.default.createElement("button", { onClick: resetForm, className: "text-attire-accent hover:text-white transition-colors font-semibold" }, "Create Another Gift"))));
  }
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen bg-attire-navy py-12 md:py-24" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ import_react.default.createElement("h1", { className: "text-4xl md:text-5xl font-serif text-white mb-4" }, "Customize a Gift Box"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-lg text-attire-silver max-w-2xl mx-auto" }, "Follow the steps to create a unique and thoughtful gift.")), step === 1 && /* @__PURE__ */ import_react.default.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "max-w-xl mx-auto" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-attire-dark/20 backdrop-blur-sm rounded-xl p-8" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-2xl font-serif text-white mb-6" }, "Step 1: Your Details"), /* @__PURE__ */ import_react.default.createElement("form", { onSubmit: handleDetailsSubmit, className: "space-y-4" }, /* @__PURE__ */ import_react.default.createElement(
    InputField,
    {
      icon: /* @__PURE__ */ import_react.default.createElement(User, { size: 16, className: "text-gray-400" }),
      type: "text",
      placeholder: "Full Name",
      value: formData.name,
      onChange: (e) => setFormData({ ...formData, name: e.target.value })
    }
  ), formErrors.name && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-red-400 text-sm" }, formErrors.name), /* @__PURE__ */ import_react.default.createElement(
    InputField,
    {
      icon: /* @__PURE__ */ import_react.default.createElement(Mail, { size: 16, className: "text-gray-400" }),
      type: "email",
      placeholder: "Email Address",
      value: formData.email,
      onChange: (e) => setFormData({ ...formData, email: e.target.value })
    }
  ), formErrors.email && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-red-400 text-sm" }, formErrors.email), /* @__PURE__ */ import_react.default.createElement(
    InputField,
    {
      icon: /* @__PURE__ */ import_react.default.createElement(Phone, { size: 16, className: "text-gray-400" }),
      type: "tel",
      placeholder: "Phone Number",
      value: formData.phone,
      onChange: (e) => setFormData({ ...formData, phone: e.target.value })
    }
  ), formErrors.phone && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-red-400 text-sm" }, formErrors.phone), /* @__PURE__ */ import_react.default.createElement("button", { type: "submit", className: "w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-attire-accent text-attire-dark hover:opacity-90" }, "Next Step ", /* @__PURE__ */ import_react.default.createElement(ArrowRight, { size: 20 }))))), step === 2 && /* @__PURE__ */ import_react.default.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "lg:col-span-2 space-y-12" }, /* @__PURE__ */ import_react.default.createElement("section", null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-2xl font-serif text-white mb-6" }, "Step 2: Choose Items"), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-8" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-xl font-semibold text-white/90 mb-4" }, "Ties"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, giftOptions.ties.map((tie) => /* @__PURE__ */ import_react.default.createElement(SelectionCard, { key: tie.id, item: tie, isSelected: selectedTie?.id === tie.id, onSelect: () => setSelectedTie((prev) => prev?.id === tie.id ? null : tie) })))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-xl font-semibold text-white/90 mb-4" }, "Pocket Squares"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4" }, giftOptions.pocketSquares.map((ps) => /* @__PURE__ */ import_react.default.createElement(SelectionCard, { key: ps.id, item: ps, isSelected: selectedPocketSquare?.id === ps.id, onSelect: () => setSelectedPocketSquare((prev) => prev?.id === ps.id ? null : ps) })))), availableBoxes.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-xl font-semibold text-white/90 mb-4" }, "Boxes"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }, availableBoxes.map((box) => /* @__PURE__ */ import_react.default.createElement(SelectionCard, { key: box.id, item: box, isSelected: selectedBox?.id === box.id, onSelect: () => setSelectedBox((prev) => prev?.id === box.id ? null : box) })))))), /* @__PURE__ */ import_react.default.createElement("section", null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-2xl font-serif text-white mb-6" }, "Step 3: Personal Note (Optional)"), /* @__PURE__ */ import_react.default.createElement("textarea", { value: note, onChange: (e) => setNote(e.target.value), placeholder: "e.g. Happy Birthday, John!", className: "w-full p-4 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none", rows: "4" }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "lg:col-span-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "sticky top-24 bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-6" }, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-xl font-serif text-white mb-4" }, "Summary"), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-3 text-sm" }, /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", { className: "font-semibold text-white/90" }, "Name:"), " ", formData.name), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", { className: "font-semibold text-white/90" }, "Email:"), " ", formData.email), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", { className: "font-semibold text-white/90" }, "Tie:"), " ", selectedTie ? `${selectedTie.name} (${selectedTie.color})` : "Not selected"), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", { className: "font-semibold text-white/90" }, "Pocket Square:"), " ", selectedPocketSquare ? `${selectedPocketSquare.name} (${selectedPocketSquare.color})` : "Not selected"), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", { className: "font-semibold text-white/90" }, "Box:"), " ", selectedBox ? selectedBox.name : "Not selected"), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", { className: "font-semibold text-white/90" }, "Note:"), " ", note || "None")), /* @__PURE__ */ import_react.default.createElement("div", { className: "border-t border-white/10 my-6" }), submissionStatus.state === "error" && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-red-400 text-center mb-4" }, submissionStatus.message), /* @__PURE__ */ import_react.default.createElement("button", { onClick: handleFinalize, disabled: !isItemsComplete || submissionStatus.state === "loading", className: "w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-attire-accent text-attire-dark disabled:bg-gray-500 disabled:cursor-not-allowed hover:opacity-90" }, submissionStatus.state === "loading" ? /* @__PURE__ */ import_react.default.createElement(Loader, { className: "animate-spin", size: 20 }) : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(Gift, { size: 20 }), " Submit Request")), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setStep(1), className: "w-full text-center mt-4 text-attire-silver hover:text-white text-sm" }, "Back to details")))))));
};
var CustomizeGiftPage_default = CustomizeGiftPage;
export {
  CustomizeGiftPage_default as default
};
//# sourceMappingURL=CustomizeGiftPage-G4TBVQBV.js.map
