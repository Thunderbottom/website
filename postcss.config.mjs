export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    cssnano: {
      preset: [
        "default",
        {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          reduceIdents: false,
          zindex: false,
          discardUnused: false,
          mergeIdents: false,
          reduceInitial: false,
          minifySelectors: false,
          colormin: true,
          mergeLonghand: true,
          mergeRules: true,
          normalizeUrl: true,
          convertValues: true,
        },
      ],
    },
  },
};
