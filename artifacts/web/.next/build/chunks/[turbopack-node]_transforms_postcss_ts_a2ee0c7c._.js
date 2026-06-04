module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/project/artifacts/web/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/95e86__pnpm_1ae16701._.js",
  "build/chunks/[root-of-the-server]__b53b83c5._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/project/artifacts/web/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];