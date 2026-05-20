import nextVitals from "eslint-config-next/core-web-vitals.js";

const nextConfig = Array.isArray(nextVitals) ? nextVitals : [nextVitals];

export default [
  ...nextConfig,
  { ignores: [".next/**", "node_modules/**", "dist/**", "build/**"] }
];
