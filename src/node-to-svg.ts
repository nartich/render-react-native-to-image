import {ViewStyle} from "react-native"
import * as yoga from "yoga-layout"
import { styleFromComponent, textLines } from "./component-to-node"
import textToSvg from "./text-to-svg"

import { RenderedComponent, Settings } from "./index"
import wsp from "./whitespace"

const renderers: {[key: string]: (node: RenderedComponent, parent: null | RenderedComponent) => string[]} = {
  RCTScrollView: (node, parent) => renderers.View(node, parent),
  Image: (node, parent) => {
    if (node.props.source && node.props.source.uri) {
      return [svg("image", node.layout, {"xlink:href": node.props.source.uri, "preserveAspectRatio": "xMidYMid slice"})]
    } else {
      return renderers.View(node, parent)
    }
  },
  Text: (node, parent) => [textToSvg(node.layout, styleFromComponent(node), parent ? styleFromComponent(parent) : {}, node[textLines])],
  View: (node, parent) => {
      const attributes: any = {
        type: node.type,
        fill: "transparent",
        stroke: "none",
        // "stroke-width": "0.5",
        // "stroke": "#ff00ff",
        // "stroke-opacity": "0.3",
      }
      const style = styleFromComponent(node)
      if (style.backgroundColor) {
        attributes.fill = style.backgroundColor
        attributes["fill-opacity"] = 1
      }
      const nodes = [svg("rect", node.layout, attributes)]

      const {left, right, top, bottom, width, height} = node.layout
      // DANGER DANGER bottom is WRONG
      if (style.borderBottomWidth) {
        const w = style.borderBottomWidth
        nodes.push(svg("rect", {left, top: top + height - w / 2, height: w, width}, {fill: style.borderBottomColor}))
      }
      if (style.borderTopWidth) {
        const w = style.borderTopWidth
        nodes.push(svg("rect", {left, top: top - w / 2, height: w, width}, {fill: style.borderTopColor}))
      }
      if (style.borderLeftWidth) {
        const w = style.borderLeftWidth
        nodes.push(svg("rect", {left: left - w / 2, top, height, width: w}, {fill: style.borderLeftColor}))
      }
      if (style.borderRightWidth) {
        const w = style.borderRightWidth
        nodes.push(svg("rect", {left: left + width - w / 2, top, height, width: w}, {fill: style.borderRightColor}))
      }

      return nodes
  }
}

const svgForNode = (node, parent) => {
  if (!renderers[node.type]) {
    console.log("unexpected node type", node.type)
    return renderers.View(node, parent)
  } else {
    return renderers[node.type](node, parent)
  }
}

const nodeToSVG = (indent: number, node: RenderedComponent, parent: null | RenderedComponent, settings: Settings) => {
  const nodes: string[] = svgForNode(node, parent)
  return nodes.map(text => "\n" + wsp(indent) + text).join("")
}

// This might be a reduce function?
const attributes = (settings) => {
  let attributeString = ""
  for (const key in settings) {
    if (settings.hasOwnProperty(key)) {
      const element = settings[key]
      attributeString += ` ${key}="${element}"`
    }
  }
  return attributeString
}

const svg = (type, {left, top, width, height}, settings) =>
  `<${type}${attributes(settings)} x="${left}" y="${top}" width="${width}" height="${height}"/>`

export default nodeToSVG
