const path = require("path");
const { range } = require("lodash");

const spacings = range(101)
  .map((_, idx) => idx)
  .reduce((prev, val) => {
    return {
      ...prev,
      [`ztg-${val}`]: `${val}px`
    };
  }, {});

const zIndexes = range(51)
  .map((_, idx) => idx)
  .reduce((prev, val) => {
    return {
      ...prev,
      [`ztg-${val}`]: val
    };
  }, {});

module.exports = {
  content: [
    path.join(__dirname, "pages/**/*.{ts,tsx}"),
    path.join(__dirname, "lib/**/*.{ts,tsx}")
  ],
  theme: {
    zIndex: {
      ...zIndexes
    },
    fontFamily: {
      mono: [
        "Roboto Mono",
        "Space Mono",
        "Menlo",
        "ui-monospace",
        "SFMono-Regular",
        "Monaco",
        "Consolas",
        "Liberation",
        "Mono",
        "Courier New",
        "monospace"
      ],
      sans: [
        "Roboto",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif"
      ],
      kanit: ["Kanit"],
      lato: ["Lato"]
    },
    extend: {
      borderWidth: {
        '1': '1px',
      },
      colors: {
        "kusama-base": "#e10178",
        "kusama-green": "#00E7BD",
        "kusama-blue": "#00B0E7",
        "purple-1": "#df0076",
        "blue-1": "#00b0e7",
        "green-1": "#00e7bd",
        "orange-1": "#ff4f18",
        "gray-1a": "#1a1a1a",
        "gray-12": "#121212",
        "gray-ee": "#eeeeee",
        "gray-dd": "#dddddd",
        "gray-42": "#424242",
        "accent-1": "#333",
        "gray-light-1": "#fff9f9",
        "gray-light-2": "#EFF4F6",
        "gray-light-3": "#E0E9EF",
        "gray-light-4": "#CBD5DC",
        "gray-dark-1": "#525C64",
        "gray-dark-2": "#6C757C",
        "gray-dark-3": "#88959F",
        "dark-1": "#232C33",
        "ztg-blue": "#0001FE",
        "laser-lemon": "#F7FF58",
        "alt-black": "#191F24",
        "alt-white": "#F7F7F2",
        "dark-gray": "#2a2a2a",
        "light-gray": "#f5f5f5",
        "sky-200": "#D9E3EE",
        "sky-600": "#748296",
        "sky-700": "#1D2533",
        "sky-1000": "#11161F",
        vermilion: "#E90303"
      },
      fontSize: {
        "ztg-10-150": ["0.625rem", "1.5"],
        "ztg-10-180": ["0.625rem", "1.8"],
        "ztg-12-120": ["0.75rem", "1.2"],
        "ztg-12-150": ["0.75rem", "1.5"],
        "ztg-14-110": ["0.875rem", "1.1"],
        "ztg-14-120": ["0.875rem", "1.2"],
        "ztg-14-150": ["0.875rem", "1.5"],
        "ztg-14-180": ["0.875rem", "1.8"],
        "ztg-16-150": ["1rem", "1.5"],
        "ztg-18-150": ["1.125rem", "1.5"],
        "ztg-19-120": ["1.1875rem", "1.2"],
        "ztg-20-150": ["1.25rem", "1.5"],
        "ztg-22-120": ["1.375rem", "1.2"],
        "ztg-28-120": ["1.75rem", "1.2"],
        "lg-2": ["1.375rem", "1.875rem"],
        xxs: ["0.5625rem", "0.75rem"],
      },
      inset: {
        "42%": "42%",
      },
      spacing: {
        ...spacings,
        "90%": "90%",
        "88%": "88%",
        "85%": "85%",
        "83%": "83%",
        "10%": "10%",
        "6%": "6%",
        "7.1%": "7.1%",
        "6.5%": "6.5%",
        "0.5%": "0.5%",
        12.5: "3.125rem",
        34: "8.5rem"
      },
      borderRadius: {
        "ztg-5": "5px",
        "ztg-10": "10px",
        "ztg-12": "12px",
        "ztg-50": "50px",
        "ztg-100": "100px"
      },
      backgroundImage: {
        "rectangle-red": "url('/background/rectangle-red.svg')", //
        "blue-circle": "url('/background/blue-circle-bg.png')", //
        "green-triangle": "url('/background/green-triangle-bg.png')", //
        "kusama-banner": "url('/background/kusama-banner-horse.png')", //
        "shapes-md-red": "url('/background/bg-md-shapes.png')", //
        "shapes-lg-red": "url('/background/bg-lg-shapes.png')", //
        "kusama-bg-slot-1-md": "url('/background/bg-md-rectangles.png')",
        "kusama-bg-slot-1-lg": "url('/background/bg-lg-rectangles.png')",
        "kusama-bg-slot-2-md": "url('/background/bg-md-rectangles-blue.png')",
        "kusama-bg-slot-2-lg": "url('/background/bg-lg-rectangles-blue.png')",
        "kusama-bg-slot-3-md": "url('/background/bg-md-rectangles-green.png')",
        "kusama-bg-slot-3-lg": "url('/background/bg-lg-rectangles-green.png')",
        "background-position": "url('/background/position-bg.jpg')",
        "finishline-slot-1-lg": "url('/background/finishline-slot-1.png')",
        "finishline-slot-2-lg": "url('/background/finishline-slot-2.png')",
        "finishline-slot-3-lg": "url('/background/finishline-slot-3.png')",
        "finishline-slot-1-md": "url('/background/finishline-slot-1-md.png')",
        "finishline-slot-2-md": "url('/background/finishline-slot-2-md.png')",
        "finishline-slot-3-md": "url('/background/finishline-slot-3-md.png')"
      },
      backgroundPosition: {
        "center-30": "center 30%",
        "center-15": "center 15%",
        "center-75": "center 75%",
        "center-675px": "center 675px",
        "70-0": "70% 0",
        "40-center": "40% center",
        "30-center": "30% center",
        "20-center": "20% center"
      },
      backgroundSize: {
        "165px": "165px",
        "248px": "248px",
        "365px": "365px",
        "560px": "560px"
      },
      boxShadow: {
        // "ztg-1": "0px 4px 10px rgba(0, 0, 0, 0.1)",
        // "ztg-2":
        //   "0px 12.5216px 10.0172px rgba(0, 1, 254, 0.14), 0px 4.5288px 3.62304px rgba(0, 1, 254, 0.0975551)",
        // "ztg-3": "10px 30px 80px rgba(0, 1, 254, 0.5)",
        "ztg-4": "0px 0px 80px #3A475A"
      },
      width: {
        "ztg-168": "168px",
        "ztg-176": "176px",
        "ztg-275": "275px",
        "ztg-360": "360px",
        29: "7.25rem",
        100: "25rem",
        160: "40rem",
        176: "44rem",
        192: "48rem",
        200: "50rem",
        240: "60rem",
        320: "80rem"
      },
      maxWidth: {
        "170px": "170px",
        "150px": "150px"
      },
      maxHeight: {
        "40px": "40px"
      }
    }
  },
  variants: {
    extend: {
      cursor: ["disabled"],
      opacity: ["disabled"],
      borderWidth: ["first"]
    }
  },
  plugins: []
};
