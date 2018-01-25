import * as yoga from "yoga-layout"

import componentToNode from "./component-to-node"
import { Component, Settings } from "./index"
import { FontState } from './font-utils'

const treeToNodes = (basePath: string, fontState: FontState, root: Component, settings: Settings) => recurseTree(basePath, fontState, root, settings, null)

export default treeToNodes

export const recurseTree = (basePath: string, fontState: FontState, component: Component, settings: Settings, parentStyleOverrides: null | any) => {
  const node = componentToNode(basePath, fontState, component, settings, parentStyleOverrides)

  // Don't go into Text nodes
  if (component.type !== "Text" && component.children) {
    const styleOverrides = component.type === "RCTScrollView" ? {flex: 1, ...component.props.contentContainerStyle} : null
    for (let index = 0; index < component.children.length; index++) {
      const childComponent = component.children[index]
      if (typeof childComponent === "string") {
        throw new Error("Unexpected string child in non-Text node")
      }
      const childNode = recurseTree(basePath, fontState, childComponent, settings, styleOverrides)
      node.insertChild(childNode, index)
    }
  }

  return node
}
