import treeToCanvas from "./canvas"
import layoutRoot, { Settings } from "./layout/"
import treeToSVG from "./svg/tree-to-svg"

const { registerFont: registerCanvasFont } = require("canvas")
export { registerCanvasFont }
import * as renderer from "react-test-renderer"

export { Settings }

const defaultSettings = {
  width: 500,
  height: 500,
  fontCache: { fonts: {}, fallbacks: {} },
  basePath: "./",
  renderPath: "./",
  assetMap: {}
}

export const renderToSVGString = (root: renderer.ReactTestRendererJSON, settings: Settings = defaultSettings) => {
  if (!settings.fontCache) {
    throw new Error("No font cache provided")
  }
  return treeToSVG(layoutRoot(root, settings), settings)
}

export const renderToCanvas = async (
  dest: string,
  root: renderer.ReactTestRendererJSON,
  settings: Settings = defaultSettings
) => {
  if (!settings.fontCache) {
    throw new Error("No font cache provided")
  }
  await treeToCanvas(dest, layoutRoot(root, settings), settings)
}

export { initFontCache, loadFont, addFontFallback } from "./layout/font-utils"
