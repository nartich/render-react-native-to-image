
import treeToSVG from "./svg/tree-to-svg"
import treeToCanvas from "./canvas"
import layoutRoot, {Component, Settings} from './layout/'

export {Component, Settings}

export const renderToSVGString = (root: Component, settings: Settings = {width: 500, height: 500, fontCache: {fonts: {}, fallbacks: {}}, basePath: "./"}) => {
    return treeToSVG(layoutRoot(root, settings), settings)
}

export const renderToCanvas = (dest: string, root: Component, settings: Settings = {width: 500, height: 500, fontCache: {fonts: {}, fallbacks: {}}, basePath: "./"}) => {
    treeToCanvas(dest, layoutRoot(root, settings), settings)
}

export {initFontCache, loadFont, addFontFallback} from './layout/font-utils'
