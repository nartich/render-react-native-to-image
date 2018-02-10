
import treeToSVG from "./svg/tree-to-svg"
import treeToCanvas from "./canvas"
import layoutRoot, {Component, Settings} from './layout/'

const {registerFont: registerCanvasFont} = require('canvas')
export {registerCanvasFont}

export {Component, Settings}

export const renderToSVGString = (root: Component, settings: Settings = {width: 500, height: 500, fontCache: {fonts: {}, fallbacks: {}}, basePath: "./"}) => {
    if (!settings.fontCache)  {
        throw new Error('No font cache provided')
    }
    return treeToSVG(layoutRoot(root, settings), settings)
}

export const renderToCanvas = async (dest: string, root: Component, settings: Settings = {width: 500, height: 500, fontCache: {fonts: {}, fallbacks: {}}, basePath: "./"}) => {
    if (!settings.fontCache)  {
        throw new Error('No font cache provided')
    }
    await treeToCanvas(dest, layoutRoot(root, settings), settings)
}

export {initFontCache, loadFont, addFontFallback} from './layout/font-utils'
