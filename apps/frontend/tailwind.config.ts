import type { Config } from "tailwindcss";
import tokens from "../../theme.tokens.json";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.radius,
      boxShadow: tokens.shadow
    }
  }
};

export default config;

