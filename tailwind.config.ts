import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ตั้งค่า Font หลักที่นี่
        sans: ['"Google Sans"', "sans-serif"],
      },
      // (เดี๋ยว shadcn จะมาเติมสีตรงนี้ให้เอง)
    },
  },
  plugins: [],
};
export default config;