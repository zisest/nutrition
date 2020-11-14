const path = require('path')

module.exports = {
  stories: ['../stories/*.story.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links'
  ],
  webpackFinal: async (config) =>  {
    // remove svg from existing rule, add svgr rule
    const fileLoaderRule = config.module.rules.find(rule => rule.test.test('.svg'))
    fileLoaderRule.exclude = /\.svg$/
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack", "url-loader"],
    })
    return config
  }
}
