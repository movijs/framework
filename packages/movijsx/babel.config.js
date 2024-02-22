


module.exports = {
  presets: [
    '@babel/preset-env',
    "@babel/preset-flow"
  ],
  plugins: [
    [require('./dist/index.js'), 
    { optimize: true, isCustomElement: (tag) => /^x-/.test(tag) }],
  ],
};
