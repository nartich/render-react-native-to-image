
import componentTreeToNodeTree from "./component-tree-to-nodes"
import renderedComponentTree from "./reapply-layouts-to-components"
import treeToSVG from "./svg/tree-to-svg"
import * as yoga from "yoga-layout"
import {FontCache} from './'

import {Component, Settings} from './'

const renderToSVGString = (root: Component, settings: Settings) => {
    const rootNode = componentTreeToNodeTree(root, settings)
    if (!rootNode) { return }

    // This will mutate the node tree, we cannot trust that the nodes  in the original tree will
    // still exist.
    rootNode.calculateLayout(settings.width, settings.height, yoga.DIRECTION_LTR)

    // Generate a tree of components with the layout baked into it, them clean up yog memory
    const renderedComponentRoot = renderedComponentTree(root, rootNode)
    rootNode.freeRecursive()

    return treeToSVG(settings.fontCache, renderedComponentRoot, settings)
}

export default renderToSVGString;