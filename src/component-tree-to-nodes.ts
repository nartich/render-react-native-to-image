import * as yoga from "yoga-layout"

import componentToNode from "./component-to-node"
import { Component, Settings } from "./index"

const treeToNodes = (root: Component, settings: Settings) => recurseTree(root, settings, null)

export default treeToNodes

export const recurseTree = (component: Component, settings: Settings, parentStyleOverrides: null | any) => {
  const node = componentToNode(component, settings, parentStyleOverrides)

  // Don't go into Text nodes
  if (component.type !== "Text" && component.children) {
    const styleOverrides = component.type === "RCTScrollView" ? component.props.contentContainerStyle : null
    for (let index = 0; index < component.children.length; index++) {
      const childComponent = component.children[index]
      if (typeof childComponent === "string") {
        throw new Error("Unexpected string child in non-Text node")
      }
      const childNode = recurseTree(childComponent, settings, styleOverrides)
      node.insertChild(childNode, index)
    }
  }

  return node
}
