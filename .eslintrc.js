require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript'
  ],
  "rules": {
    "vue/multi-word-component-names": "off",
    "vue/valid-template-root": "off",
    "vue/no-setup-props-destructure": "off",
    "vue/no-mutating-props": "off",
  }
}
