import {ViewStyle} from "react-native"
import * as yoga from "yoga-layout"
import { styleFromComponent, textLines } from "./component-to-node"
import textToSvg from "./text-to-svg"
import { FontState } from './font-utils'

import { RenderedComponent, Settings } from "./index"
import wsp from "./whitespace"

export const getOpacity = node => {
  const {opacity = 1} = styleFromComponent(node)
  return opacity
}

// I did this to try to get finder's quick-look preview to load images. doesn't seem to do it.
// const getImageUri = (source) => {
//   if (source.uri) {
//     return source.uri
//   } else if (source.testUri) {
//     const path = require("path")
//     const state = (expect as any).getState()
//     const currentTest = state.testPath as string
//     const fullPath = path.join(currentTest, source.testUri)
//     return fullPath
//   }
// }

const renderers: {[key: string]: (fontState: FontState, node: RenderedComponent) => string[]} = {
  RCTScrollView: (fontState, node) => renderers.View(fontState, node),
  Image: (fontState, node) => {
    const style = styleFromComponent(node)
    if (node.props.source && (node.props.source.testUri || node.props.source.uri)) {
      console.log(style)
      const uri = node.props.source.testUri || node.props.source.uri
      return [svg("image", node.layout, {
        "xlink:href": uri,
        "preserveAspectRatio": node.props.resizeMode === "cover" ? "xMidYMid slice" : "",
        "opacity": getOpacity(node)
      })]
    } else {
      return renderers.View(fontState, node)
    }
  },
  Text: (fontState, node) => [textToSvg(fontState, node.layout, styleFromComponent(node), node[textLines])],
  View: (fontState, node) => {
      const attributes: any = {
        type: node.type,
        fill: "transparent",
        stroke: "none",
        opacity: getOpacity(node),
        // "stroke-width": "0.5",
        // "stroke": "#ff00ff",
        // "stroke-opacity": "0.3",
      }
      const style = styleFromComponent(node)
      if (style.backgroundColor) {
        attributes.fill = style.backgroundColor
        attributes["fill-opacity"] = 1
      }
      if (style.borderRadius) {
        attributes.rx = style.borderRadius
        attributes.ry = style.borderRadius
      }
      const nodes = [svg("rect", node.layout, attributes)]

      // TODO: borderWidth, also border radius
      const {left, top, width, height} = node.layout
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

const svgForNode = (fontState: FontState, node) => {
  if (!renderers[node.type]) {
    console.log("unexpected node type", node.type)
    return renderers.View(fontState, node)
  } else {
    return renderers[node.type](fontState, node)
  }
}

const nodeToSVG = (fontState: FontState, indent: number, node: RenderedComponent, settings: Settings) => {
  const nodes: string[] = svgForNode(fontState, node)
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
