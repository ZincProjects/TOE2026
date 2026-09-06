// eslint-config-next 16 ships flat config directly, so the legacy FlatCompat wrapper
// that create-next-app generates is no longer needed (and throws against ESLint 9.39).
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
