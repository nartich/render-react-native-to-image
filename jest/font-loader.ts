import * as fontUtils from "../src/layout/font-utils"

export const fontState = fontUtils.initFontCache()

export const loadFont = (fontFile, style = {}) =>
  fontUtils.loadFont(fontState, fontFile, style)
export const addFontFallback = (fontFamily, fallback) =>
  fontUtils.addFontFallback(fontState, fontFamily, fallback)
// export const fontForStyle = (style, force = false) => fontUtils.fontForStyle(fontState, style, force)
// export const fontWithFallbacks = (fontFamily: string) => fontUtils.fontWithFallbacks(fontState, fontFamily)
