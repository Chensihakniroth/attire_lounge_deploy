import {
  Footer_default
} from "./chunk-FEWFWKRS.js";
import "./chunk-BKED7RJF.js";
import "./chunk-M5DYWXOV.js";
import {
  Link,
  useLocation
} from "./chunk-VBCTODT4.js";
import {
  motion
} from "./chunk-2V3EIBA2.js";
import {
  BookOpen,
  Camera,
  CheckCircle,
  ChevronDown,
  Coffee,
  Scissors,
  Sparkles,
  Users
} from "./chunk-MEGF3DJD.js";
import {
  config_default
} from "./chunk-4VPB5FGN.js";
import {
  __toESM,
  require_react
} from "./chunk-JTW3NHAX.js";

// resources/js/components/pages/HomePage.jsx
var import_react2 = __toESM(require_react());

// resources/js/components/pages/SectionIndicator.jsx
var import_react = __toESM(require_react());
var SectionIndicator = ({ sections, activeSection, scrollToSection, isMenuOpen }) => {
  if (isMenuOpen) {
    return null;
  }
  const getBubbleStyle = (index) => {
    const distance = Math.abs(activeSection - index);
    if (distance === 0) {
      return {
        scale: 1,
        backgroundColor: "#f5a81c"
      };
    }
    const scale = Math.max(1 - distance * 0.2, 0.3);
    const opacity = Math.max(1 - distance * 0.25, 0.2);
    return {
      scale,
      backgroundColor: `rgba(255, 255, 255, ${opacity})`
    };
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 mr-1" }, /* @__PURE__ */ import_react.default.createElement("ul", { className: "flex flex-col items-center justify-center p-0 space-y-2" }, sections.map((section, index) => {
    const bubbleStyle = getBubbleStyle(index);
    return /* @__PURE__ */ import_react.default.createElement("li", { key: index, className: "relative group" }, /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        onClick: () => scrollToSection(index),
        className: "w-3 h-3 rounded-full flex items-center justify-center"
      },
      /* @__PURE__ */ import_react.default.createElement(
        motion.div,
        {
          className: "w-full h-full rounded-full",
          animate: bubbleStyle,
          whileHover: {
            scale: activeSection === index ? 1 : bubbleStyle.scale * 1.2
          },
          transition: { duration: 0.3, ease: "easeInOut" }
        }
      )
    ), /* @__PURE__ */ import_react.default.createElement("span", { className: "absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 bg-gray-900/80 text-white text-xs rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap origin-right" }, section));
  })));
};
var SectionIndicator_default = SectionIndicator;

// resources/js/components/pages/HomePage.jsx
var homePageData = {
  services: [
    { name: "Milan-Certified Styling", description: "Receive a free, expert styling consultation from our Milan-certified team to discover the perfect look for you.", icon: /* @__PURE__ */ import_react2.default.createElement(Users, { size: 32, className: "text-attire-accent" }) },
    { name: "The Perfect Fit", description: "We offer diverse sizes and provide complimentary in-house alterations to ensure your garments fit impeccably.", icon: /* @__PURE__ */ import_react2.default.createElement(Scissors, { size: 32, className: "text-attire-accent" }) },
    { name: "A Premium Experience", description: "Enjoy a relaxing atmosphere and complimentary drinks during your visit, making your styling session a true pleasure.", icon: /* @__PURE__ */ import_react2.default.createElement(Coffee, { size: 32, className: "text-attire-accent" }) }
  ],
  lookbookFeatures: [
    {
      title: "Seasonal Collections",
      description: "Explore our latest seasonal curations, from summer linens to winter wools, all shot in stunning, high-resolution detail.",
      icon: /* @__PURE__ */ import_react2.default.createElement(BookOpen, { size: 40, className: "text-attire-accent" })
    },
    {
      title: "Behind The Seams",
      description: "Get an exclusive look at our design process, the craftsmanship involved, and the stories that inspire each collection.",
      icon: /* @__PURE__ */ import_react2.default.createElement(Camera, { size: 40, className: "text-attire-accent" })
    },
    {
      title: "Style Guides",
      description: "Not just what to wear, but how to wear it. Our guides help you master the art of dressing for any occasion.",
      icon: /* @__PURE__ */ import_react2.default.createElement(Sparkles, { size: 40, className: "text-attire-accent" })
    }
  ],
  tipsAndTricks: [
    {
      title: "Mastering the Tie Knot",
      image: `${config_default}/uploads/asset/vid1.jpg`,
      link: "https://www.instagram.com/p/placeholder1/",
      // Placeholder link
      description: "Learn essential tie knots for every occasion."
    },
    {
      title: "Cufflink Elegance",
      image: `${config_default}/uploads/asset/vid2.jpg`,
      link: "https://www.tiktok.com/@placeholder2/",
      // Placeholder link
      description: "Elevate your look with the perfect cufflinks."
    },
    {
      title: "Pocket Square Folds",
      image: `${config_default}/uploads/asset/vid3.jpg`,
      link: "https://www.youtube.com/watch?v=placeholder3",
      // Placeholder link
      description: "Add a touch of class with stylish pocket square folds."
    }
  ]
};
var containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } }
};
var itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};
var HeroSection = (0, import_react2.memo)((0, import_react2.forwardRef)(({ scrollToSection }, ref) => /* @__PURE__ */ import_react2.default.createElement("section", { className: "relative snap-section overflow-hidden min-h-screen h-screen", ref }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 w-full h-full overflow-hidden" }, /* @__PURE__ */ import_react2.default.createElement("video", { autoPlay: true, muted: true, loop: true, playsInline: true, preload: "metadata", className: "absolute w-full h-full object-cover", style: { objectPosition: "center 10%" } }, /* @__PURE__ */ import_react2.default.createElement("source", { src: `${config_default}/uploads/asset/hero-background1.mp4`, type: "video/mp4" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 bg-attire-dark/40" })), /* @__PURE__ */ import_react2.default.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8 }, className: "relative z-10 h-full flex flex-col items-center justify-center" }, /* @__PURE__ */ import_react2.default.createElement("img", { src: `${config_default}/uploads/asset/AL_logo.png`, alt: "Attire Lounge", className: "h-auto mx-auto filter brightness-0 invert drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-90 max-w-[280px] md:max-w-sm", loading: "eager" }), /* @__PURE__ */ import_react2.default.createElement(
  motion.div,
  {
    className: "flex flex-col items-center text-attire-cream opacity-70 mt-16",
    animate: { y: ["-10%", "10%", "-10%"] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  /* @__PURE__ */ import_react2.default.createElement("span", { className: "mb-2 text-xs tracking-wide" }, "Scroll Down"),
  /* @__PURE__ */ import_react2.default.createElement(ChevronDown, { size: 18 }),
  /* @__PURE__ */ import_react2.default.createElement(ChevronDown, { size: 18, className: "-mt-2" }),
  /* @__PURE__ */ import_react2.default.createElement(ChevronDown, { size: 18, className: "-mt-2" })
)))));
var PhilosophySection = (0, import_react2.memo)((0, import_react2.forwardRef)((props, ref) => /* @__PURE__ */ import_react2.default.createElement("section", { className: "relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-navy", ref }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex flex-col justify-center text-attire-cream p-8 md:p-16 h-full" }, /* @__PURE__ */ import_react2.default.createElement(
  motion.div,
  {
    variants: containerVariants,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.6 }
  },
  /* @__PURE__ */ import_react2.default.createElement(motion.h2, { variants: itemVariants, className: "font-serif text-sm md:text-base tracking-[0.2em] text-attire-accent uppercase mb-4" }, "Our Philosophy"),
  /* @__PURE__ */ import_react2.default.createElement(motion.p, { variants: itemVariants, transition: { delay: 0.2 }, className: "font-serif text-2xl md:text-4xl leading-relaxed mb-8" }, "Attire Lounge is Cambodia's first sartorial gentlemen's styling house, offering a variety of ready-to-wear collections and premium styling with our Milan-certified team."),
  /* @__PURE__ */ import_react2.default.createElement(motion.div, { variants: itemVariants, transition: { delay: 0.4 } }, /* @__PURE__ */ import_react2.default.createElement(Link, { to: "/contact", className: "inline-block bg-attire-accent text-white font-semibold px-10 py-4 rounded-lg hover:bg-attire-accent/90 transition-colors" }, "Make Appointment"))
)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative w-full h-full overflow-hidden hidden md:block" }, /* @__PURE__ */ import_react2.default.createElement(
  "img",
  {
    src: `${config_default}/uploads/collections/default/as5.jpg`,
    alt: "Attire Lounge Interior",
    className: "absolute inset-0 w-full h-full object-cover",
    loading: "lazy"
  }
), /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-attire-navy via-transparent to-transparent" })))));
var CollectionsSection = (0, import_react2.memo)((0, import_react2.forwardRef)((props, ref) => /* @__PURE__ */ import_react2.default.createElement("section", { className: "relative snap-section min-h-screen h-screen", ref }, /* @__PURE__ */ import_react2.default.createElement(
  "img",
  {
    src: `${config_default}/uploads/collections/default/g1.jpg`,
    alt: "Collections Background",
    className: "absolute inset-0 w-full h-full object-cover object-center",
    loading: "lazy"
  }
), /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 bg-black/50" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative z-10 flex flex-col justify-center items-center text-center h-full max-w-4xl mx-auto px-6" }, /* @__PURE__ */ import_react2.default.createElement(
  motion.div,
  {
    variants: containerVariants,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.6 },
    className: "w-full"
  },
  /* @__PURE__ */ import_react2.default.createElement(motion.h2, { variants: itemVariants, className: "font-serif text-3xl md:text-5xl text-white mb-4" }, "Our Collections"),
  /* @__PURE__ */ import_react2.default.createElement(motion.p, { variants: itemVariants, transition: { delay: 0.2 }, className: "text-attire-silver text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8" }, "From timeless classics to modern statements, our collections are curated to suit every gentleman's style. We offer a diverse range of ready-to-wear pieces, each crafted with precision and an eye for detail."),
  /* @__PURE__ */ import_react2.default.createElement(motion.div, { variants: itemVariants, transition: { delay: 0.4 } }, /* @__PURE__ */ import_react2.default.createElement(Link, { to: "/collections", className: "inline-block bg-attire-accent text-white font-semibold px-10 py-4 rounded-lg hover:bg-attire-accent/90 transition-colors" }, "Browse Collections"))
)))));
var ExperienceSection = (0, import_react2.memo)((0, import_react2.forwardRef)((props, ref) => /* @__PURE__ */ import_react2.default.createElement("section", { className: "relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-navy", ref }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "md:hidden absolute inset-0" }, /* @__PURE__ */ import_react2.default.createElement("img", { src: `${config_default}/uploads/collections/default/both.jpg`, alt: "Background", className: "w-full h-full object-cover" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 bg-black/60" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative w-full h-full overflow-hidden hidden md:block" }, /* @__PURE__ */ import_react2.default.createElement(
  "img",
  {
    src: `${config_default}/uploads/collections/default/both.jpg`,
    alt: "Attire Lounge Style",
    className: "absolute inset-0 w-full h-full object-cover",
    loading: "lazy"
  }
), /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 bg-gradient-to-l from-attire-navy via-transparent to-transparent" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative flex flex-col justify-center text-attire-cream p-8 md:p-16 h-full" }, /* @__PURE__ */ import_react2.default.createElement(
  motion.div,
  {
    variants: containerVariants,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.6 }
  },
  /* @__PURE__ */ import_react2.default.createElement(motion.h2, { variants: itemVariants, className: "font-serif text-3xl md:text-5xl text-white mb-8" }, "What sets us apart?"),
  /* @__PURE__ */ import_react2.default.createElement(motion.div, { variants: itemVariants, transition: { delay: 0.2 } }, /* @__PURE__ */ import_react2.default.createElement("ul", { className: "space-y-5 text-base md:text-lg leading-relaxed" }, /* @__PURE__ */ import_react2.default.createElement("li", { className: "flex items-start gap-4" }, /* @__PURE__ */ import_react2.default.createElement(CheckCircle, { className: "w-7 h-7 text-attire-accent mt-1 flex-shrink-0" }), /* @__PURE__ */ import_react2.default.createElement("span", null, "Receive free styling consultation upon your appointment")), /* @__PURE__ */ import_react2.default.createElement("li", { className: "flex items-start gap-4" }, /* @__PURE__ */ import_react2.default.createElement(CheckCircle, { className: "w-7 h-7 text-attire-accent mt-1 flex-shrink-0" }), /* @__PURE__ */ import_react2.default.createElement("span", null, "Styling team certified from Milan, Italy")), /* @__PURE__ */ import_react2.default.createElement("li", { className: "flex items-start gap-4" }, /* @__PURE__ */ import_react2.default.createElement(CheckCircle, { className: "w-7 h-7 text-attire-accent mt-1 flex-shrink-0" }), /* @__PURE__ */ import_react2.default.createElement("span", null, "Diverse sizes suitable for all body types"))))
)))));
var MembershipSection = (0, import_react2.memo)((0, import_react2.forwardRef)((props, ref) => /* @__PURE__ */ import_react2.default.createElement("section", { className: "relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-navy", ref }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "md:hidden absolute inset-0" }, /* @__PURE__ */ import_react2.default.createElement("img", { src: `${config_default}/uploads/collections/default/vc.jpg`, alt: "Background", className: "w-full h-full object-cover" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 bg-black/60" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative flex flex-col justify-center text-attire-cream p-8 md:p-12 h-full overflow-y-auto" }, /* @__PURE__ */ import_react2.default.createElement(
  motion.div,
  {
    variants: containerVariants,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.1 },
    className: "w-full max-w-xl"
  },
  /* @__PURE__ */ import_react2.default.createElement(motion.h2, { variants: itemVariants, className: "font-serif text-3xl md:text-4xl text-white mb-2" }, "ATTIRE CLUB"),
  /* @__PURE__ */ import_react2.default.createElement(motion.h3, { variants: itemVariants, transition: { delay: 0.1 }, className: "text-attire-accent tracking-[0.2em] uppercase text-sm mb-6" }, "Membership Card"),
  /* @__PURE__ */ import_react2.default.createElement(motion.div, { variants: itemVariants, transition: { delay: 0.2 }, className: "text-sm md:text-base text-attire-silver space-y-3 leading-relaxed" }, /* @__PURE__ */ import_react2.default.createElement("p", null, "Entitlement upon a minimum purchase of US$500 per receipt. Requires full name, DOB (month & date), and contact number."), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("h4", { className: "font-semibold text-attire-cream mb-1 mt-3" }, "Benefits"), /* @__PURE__ */ import_react2.default.createElement("ul", { className: "list-disc list-outside space-y-1 pl-5 text-sm" }, /* @__PURE__ */ import_react2.default.createElement("li", null, "Up to 15% on regular purchases:", /* @__PURE__ */ import_react2.default.createElement("ul", { className: "list-['\u2013'] list-outside pl-5 space-y-px mt-1" }, /* @__PURE__ */ import_react2.default.createElement("li", null, "8% off on purchases from US$500 to US$1,000"), /* @__PURE__ */ import_react2.default.createElement("li", null, "10% off on purchases from US$1,001 to US$1,500"), /* @__PURE__ */ import_react2.default.createElement("li", null, "15% off on all purchases of US$1,501 and above"))), /* @__PURE__ */ import_react2.default.createElement("li", null, "Extra seasonal benefits including birthday gifts and access to exclusive gentleman's club events."), /* @__PURE__ */ import_react2.default.createElement("li", null, "Special offers from our partners:", /* @__PURE__ */ import_react2.default.createElement("ul", { className: "list-['\u2013'] list-outside pl-5 space-y-px mt-1" }, /* @__PURE__ */ import_react2.default.createElement("li", null, "10% off at CUFFEINE: plant-based coffee"), /* @__PURE__ */ import_react2.default.createElement("li", null, "8% off cocktails at Kravat Speakeasy Bar"))))), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("h4", { className: "font-semibold text-attire-cream mb-1 mt-3" }, "Terms & Conditions"), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-xs text-gray-400" }, "Not responsible for lost, stolen, or damaged cards (reissue fee: US$10). Cannot be used with other offers. Not redeemable for cash. Non-transferable; cardholder must be present. Membership may be terminated for non-compliance. Subject to renewal and may be discontinued at our discretion. Terms are subject to change.")))
)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative w-full h-full overflow-hidden hidden md:block" }, /* @__PURE__ */ import_react2.default.createElement(
  "img",
  {
    src: `${config_default}/uploads/collections/default/vc.jpg`,
    alt: "Attire Club Membership",
    className: "absolute inset-0 w-full h-full object-cover",
    loading: "lazy"
  }
), /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-attire-navy via-transparent to-transparent" })))));
var LookbookSection = (0, import_react2.memo)((0, import_react2.forwardRef)(({ lookbookFeatures }, ref) => /* @__PURE__ */ import_react2.default.createElement("section", { className: "relative snap-section bg-attire-dark py-8 md:py-16", ref }, /* @__PURE__ */ import_react2.default.createElement("img", { src: `${config_default}/uploads/collections/default/of3.jpg`, alt: "Lookbook Background", className: "absolute inset-0 w-full h-full object-cover object-center", loading: "lazy", decoding: "async" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-attire-dark/80 to-attire-dark/40" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative h-full flex flex-col items-center justify-center text-center text-attire-cream p-4 md:p-8" }, /* @__PURE__ */ import_react2.default.createElement(
  motion.div,
  {
    variants: containerVariants,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.2 },
    className: "w-full max-w-6xl mx-auto"
  },
  /* @__PURE__ */ import_react2.default.createElement(motion.h2, { variants: itemVariants, className: "font-serif text-3xl md:text-5xl mb-4" }, "The Art of Style"),
  /* @__PURE__ */ import_react2.default.createElement(motion.p, { variants: itemVariants, transition: { delay: 0.2 }, className: "max-w-2xl mx-auto text-attire-silver text-base md:text-lg mb-6 md:mb-10" }, "Explore our curated lookbook for inspiration and discover the timeless elegance that defines Attire Lounge."),
  /* @__PURE__ */ import_react2.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-10" }, lookbookFeatures.map((feature, index) => /* @__PURE__ */ import_react2.default.createElement(
    motion.div,
    {
      key: index,
      variants: itemVariants,
      transition: { delay: 0.4 + index * 0.2 },
      className: "bg-attire-dark/30 backdrop-blur-md border border-attire-cream/10 rounded-2xl shadow-lg p-6 flex flex-col items-center"
    },
    /* @__PURE__ */ import_react2.default.createElement(
      motion.div,
      {
        whileHover: { scale: 1.1, rotate: 5 },
        transition: { type: "spring", stiffness: 300 },
        className: "mb-2"
      },
      feature.icon
    ),
    /* @__PURE__ */ import_react2.default.createElement("h3", { className: "font-serif text-base md:text-xl text-white mb-1" }, feature.title),
    /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-attire-silver text-xs leading-snug" }, feature.description)
  ))),
  /* @__PURE__ */ import_react2.default.createElement(motion.div, { variants: itemVariants, transition: { delay: 1 } }, /* @__PURE__ */ import_react2.default.createElement(Link, { to: "/lookbook", className: "inline-block bg-attire-accent text-white font-semibold px-8 py-3 rounded-lg hover:bg-attire-accent/90 transition-colors text-sm md:text-base" }, "View Lookbook"))
)))));
var TipsAndTricksSection = (0, import_react2.memo)((0, import_react2.forwardRef)(({ tipsAndTricks }, ref) => {
  return /* @__PURE__ */ import_react2.default.createElement("section", { className: "relative snap-section bg-attire-navy min-h-screen !h-auto !overflow-visible flex flex-col py-24 md:py-32", ref }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative z-10 w-full max-w-7xl mx-auto text-center text-attire-cream px-4 my-auto" }, /* @__PURE__ */ import_react2.default.createElement(
    motion.div,
    {
      variants: containerVariants,
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, amount: 0.2 },
      className: "mb-10"
    },
    /* @__PURE__ */ import_react2.default.createElement(motion.h2, { variants: itemVariants, className: "font-serif text-3xl md:text-5xl mb-4" }, "Tips & Tricks"),
    /* @__PURE__ */ import_react2.default.createElement(motion.p, { variants: itemVariants, transition: { delay: 0.2 }, className: "max-w-2xl mx-auto text-attire-silver text-base md:text-lg" }, "Master the art of sophisticated dressing with our expert guidance.")
  ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "hidden md:grid md:grid-cols-3 md:gap-8" }, tipsAndTricks.map((tip, i) => /* @__PURE__ */ import_react2.default.createElement(
    motion.div,
    {
      key: i,
      variants: itemVariants,
      transition: { delay: 0.4 + i * 0.2 },
      className: "flex flex-col items-center text-center"
    },
    /* @__PURE__ */ import_react2.default.createElement(
      "a",
      {
        href: tip.link,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "block w-full aspect-video rounded-lg overflow-hidden group shadow-lg"
      },
      /* @__PURE__ */ import_react2.default.createElement(
        "img",
        {
          src: tip.image,
          alt: tip.title,
          className: "w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-in-out",
          loading: "lazy"
        }
      )
    ),
    /* @__PURE__ */ import_react2.default.createElement("div", { className: "mt-4" }, /* @__PURE__ */ import_react2.default.createElement("h3", { className: "font-serif text-lg md:text-xl text-white mb-1 break-words" }, tip.title), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-attire-silver text-sm break-words" }, tip.description))
  ))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "md:hidden flex flex-wrap justify-center gap-4" }, tipsAndTricks.map((tip, i) => /* @__PURE__ */ import_react2.default.createElement("div", { key: i, className: "w-[calc(50%-0.5rem)] flex flex-col items-center text-center" }, /* @__PURE__ */ import_react2.default.createElement(
    "a",
    {
      href: tip.link,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "block w-full aspect-video rounded-lg overflow-hidden group shadow-lg"
    },
    /* @__PURE__ */ import_react2.default.createElement(
      "img",
      {
        src: tip.image,
        alt: tip.title,
        className: "w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105",
        loading: "lazy"
      }
    )
  ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mt-2" }, /* @__PURE__ */ import_react2.default.createElement("h3", { className: "font-serif text-base text-white mb-1" }, tip.title), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-attire-silver text-xs leading-snug" }, tip.description)))))));
}));
var FooterSection = (0, import_react2.memo)((0, import_react2.forwardRef)((props, ref) => /* @__PURE__ */ import_react2.default.createElement("section", { className: "relative bg-black", ref }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-full" }, /* @__PURE__ */ import_react2.default.createElement(Footer_default, null)))));
var HomePage = () => {
  const [isMobile, setIsMobile] = (0, import_react2.useState)(false);
  const [activeSection, setActiveSection] = (0, import_react2.useState)(0);
  const [isMenuOpen, setIsMenuOpen] = (0, import_react2.useState)(false);
  const location = useLocation();
  const sectionsRef = (0, import_react2.useRef)([]);
  const isScrollingRef = (0, import_react2.useRef)(false);
  (0, import_react2.useEffect)(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  (0, import_react2.useEffect)(() => {
    sectionsRef.current = sectionsRef.current.slice(0, 8);
    const handleMenuStateChange = (e) => {
      if (e.detail && e.detail.isMenuOpen !== void 0) setIsMenuOpen(e.detail.isMenuOpen);
    };
    window.addEventListener("menuStateChange", handleMenuStateChange);
    return () => window.removeEventListener("menuStateChange", handleMenuStateChange);
  }, []);
  const scrollToSection = (0, import_react2.useCallback)((index) => {
    if (isScrollingRef.current || !sectionsRef.current[index] || isMenuOpen) return;
    if (index === 7) return;
    setActiveSection(index);
    isScrollingRef.current = true;
    const targetY = sectionsRef.current[index].offsetTop;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 400;
    let startTime = null;
    const easing = (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      window.scrollTo(0, startY + distance * easing(progress));
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        isScrollingRef.current = false;
      }
    };
    requestAnimationFrame(animation);
  }, [isMenuOpen]);
  (0, import_react2.useEffect)(() => {
    if (isMobile || isMenuOpen) return;
    const handleWheel = (e) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }
      const section = sectionsRef.current[activeSection];
      if (activeSection === 6 && e.deltaY > 0) {
        return;
      }
      if (activeSection === 7) {
        return;
      }
      if (section) {
        const isLongSection = section.offsetHeight > window.innerHeight + 10;
        if (isLongSection) {
          const atBottom = Math.ceil(window.scrollY + window.innerHeight) >= section.offsetTop + section.offsetHeight - 5;
          const atTop = window.scrollY <= section.offsetTop + 5;
          if (e.deltaY > 0 && !atBottom) return;
          if (e.deltaY < 0 && !atTop) return;
        }
      }
      e.preventDefault();
      const deltaY = e.deltaY;
      let newIndex = activeSection;
      if (Math.abs(deltaY) > 5) {
        if (deltaY > 0) newIndex = Math.min(activeSection + 1, sectionsRef.current.length - 1);
        else newIndex = Math.max(activeSection - 1, 0);
        if (newIndex === 7 && deltaY > 0) return;
        if (newIndex !== activeSection) scrollToSection(newIndex);
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isMobile, isMenuOpen, activeSection, scrollToSection]);
  (0, import_react2.useEffect)(() => {
    const handleKeyDown = (e) => {
      if (isMobile || isMenuOpen || isScrollingRef.current) return;
      const section = sectionsRef.current[activeSection];
      if (activeSection === 6 && (e.key === "ArrowDown" || e.key === "PageDown") || activeSection === 7) {
        return;
      }
      if (section && section.offsetHeight > window.innerHeight + 10) {
        const atBottom = Math.ceil(window.scrollY + window.innerHeight) >= section.offsetTop + section.offsetHeight - 5;
        const atTop = window.scrollY <= section.offsetTop + 5;
        if ((e.key === "ArrowDown" || e.key === "PageDown") && !atBottom) return;
        if ((e.key === "ArrowUp" || e.key === "PageUp") && !atTop) return;
      }
      let newIndex = activeSection;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          newIndex = Math.min(activeSection + 1, sectionsRef.current.length - 1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          newIndex = Math.max(activeSection - 1, 0);
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = sectionsRef.current.length - 1;
          break;
        default:
          return;
      }
      if (newIndex === 7) return;
      if (newIndex !== activeSection) scrollToSection(newIndex);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, isMenuOpen, activeSection, scrollToSection]);
  (0, import_react2.useEffect)(() => {
    if (location.hash === "#membership") {
      setTimeout(() => {
        scrollToSection(4);
      }, 100);
    }
  }, [location.hash, scrollToSection]);
  const { services, lookbookFeatures, tipsAndTricks } = homePageData;
  const sectionNames = ["Home", "Philosophy", "Collections", "Experience", "Membership", "Lookbook", "Tips & Tricks", "Appointment and Contact"];
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "snap-scroll-container bg-attire-dark" }, /* @__PURE__ */ import_react2.default.createElement(
    SectionIndicator_default,
    {
      sections: sectionNames,
      activeSection,
      scrollToSection,
      isMenuOpen
    }
  ), /* @__PURE__ */ import_react2.default.createElement(HeroSection, { ref: (el) => sectionsRef.current[0] = el, scrollToSection }), /* @__PURE__ */ import_react2.default.createElement(PhilosophySection, { ref: (el) => sectionsRef.current[1] = el }), /* @__PURE__ */ import_react2.default.createElement(CollectionsSection, { ref: (el) => sectionsRef.current[2] = el }), /* @__PURE__ */ import_react2.default.createElement(ExperienceSection, { ref: (el) => sectionsRef.current[3] = el, services }), /* @__PURE__ */ import_react2.default.createElement(MembershipSection, { ref: (el) => sectionsRef.current[4] = el }), /* @__PURE__ */ import_react2.default.createElement(LookbookSection, { ref: (el) => sectionsRef.current[5] = el, lookbookFeatures }), /* @__PURE__ */ import_react2.default.createElement(TipsAndTricksSection, { ref: (el) => sectionsRef.current[6] = el, tipsAndTricks }), /* @__PURE__ */ import_react2.default.createElement(FooterSection, { ref: (el) => sectionsRef.current[7] = el }));
};
var HomePage_default = HomePage;
export {
  HomePage_default as default
};
//# sourceMappingURL=HomePage-JMYGP5EV.js.map
