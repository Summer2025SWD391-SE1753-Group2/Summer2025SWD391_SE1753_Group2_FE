import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
// This file is used to configure Tailwind CSS. It specifies the content files to scan for class names, extends the default theme, and includes any plugins you want to use.
// The `content` array specifies the paths to your HTML and JavaScript/TypeScript files where Tailwind CSS classes are used.
