
import treeToSVG from "./svg/tree-to-svg"
import layoutRoot, {Component, Settings} from './layout/'

export {Component, Settings}

export const renderToSVGString = (root: Component, settings: Settings = {width: 500, height: 500, fontCache: {fonts: {}, fallbacks: {}}, basePath: null}) => {
    return treeToSVG(layoutRoot(root, settings), settings)
}

export {initFontCache, loadFont, addFontFallback} from './layout/font-utils'
