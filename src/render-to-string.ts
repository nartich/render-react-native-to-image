
import treeToSVG from "./svg/tree-to-svg"

import {Component, Settings} from './layout/'

import layoutRoot from './layout'

const renderToSVGString = (root: Component, settings: Settings = {width: 500, height: 500, fontCache: {fonts: {}, fallbacks: {}}, basePath: null}) => {

    return treeToSVG(settings.fontCache, layoutRoot(root, settings), settings)
}

export default renderToSVGString;