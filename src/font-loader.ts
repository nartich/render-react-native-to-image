

import * as fontUtils from './font-utils'

export const fontState = {fonts: {}, fallbacks: {}}

export const loadFont = (fontFile, style) => fontUtils.loadFont(fontState, fontFile, style)
export const addFontFallback = (fontFamily, fallback) => fontUtils.addFontFallback(fontState, fontFamily, fallback)
// export const fontForStyle = (style, force = false) => fontUtils.fontForStyle(fontState, style, force)
// export const fontWithFallbacks = (fontFamily: string) => fontUtils.fontWithFallbacks(fontState, fontFamily)
