import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // These rules were introduced in a newer eslint-plugin-react-hooks
      // major version than the codebase was written against. Downgraded to
      // warnings so `next lint`'s removal doesn't block on a pre-existing,
      // unrelated mass-refactor; address incrementally instead.
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
];

export default eslintConfig;
