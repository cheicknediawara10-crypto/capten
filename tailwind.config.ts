import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        capten: {
          orange: "#FF5C00",
          peach: "#FFF0E8",
          grayBorder: "#E5E5E5",
          textGray: "#A3A3A3",
          snow: "#FDFCF8",
          greenSuccess: "#10B981",
        },
      },
      fontFamily: {
        display: ["var(--font-barlow)", "Anton", "sans-serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        mono: ["var(--font-dm-mono)", "DM Mono", "monospace"],
      },
      letterSpacing: {
        tighter: "0.025em",
        tight: "0.04em",
      },
      borderWidth: {
        "0.5": "0.5px",
      },
      borderRadius: {
        capten: "24px",
        modal: "32px",
        'card-outer': '12px',
        'card-inner': '8px',
        'control': '6px',
        'modal-box': '16px',
      },
      maxWidth: {
        'form-single': '480px',
        'form-wide': '720px',
        'page-wide': '1440px',
      },
      fontSize: {
        h1: ["36px", { lineHeight: "1.1", fontWeight: "900", letterSpacing: "0.025em" }],
        h2: ["28px", { lineHeight: "1.2", fontWeight: "900" }],
        label: ["10px", { lineHeight: "1", fontWeight: "700", letterSpacing: "0.2em" }],
      },
    },
  },
  plugins: [],
};

export default config;
