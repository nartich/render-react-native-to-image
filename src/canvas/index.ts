
import { RenderedComponent, Settings } from "../layout"
import {styleFromComponent, textLines} from "../layout/component-to-node"
import { FontCache } from '../layout'
import * as fs from 'fs'
import * as path from 'path'
import drawText from './drawText'
import fetch from 'node-fetch'

import * as Canvas from 'canvas-prebuilt'

const getOpacity = node => {
  const {opacity = 1} = styleFromComponent(node)
  return opacity
}

const renderRect = (ctx, {left, top, width, height}, style) => {
  if (style.backgroundColor) {
    ctx.fillStyle = style.backgroundColor
    ctx.fillRect(left, top, width, height)
    ctx.fillStyle = 'transparent'
  }
  if (style.borderWidth) {
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = style.borderWidth
    ctx.strokeRect(left, top, width, height)
    // TODO much more border stuff
  }
}

const prom = fn => new Promise((res, rej) => fn((err, val) => err ? rej(err) : res(val)));

const renderers: {[key: string]: (ctx, settings: Settings, node: RenderedComponent) => Promise<void>} = {
  RCTScrollView: (ctx, settings, node) => renderers.View(ctx, settings, node),
  Image: async (ctx, settings, node) => {
    const style = styleFromComponent(node)
    console.log('image', node.props.source)
    if (node.props.source && (node.props.source.testUri || node.props.source.uri)) {
      const uri = node.props.source.testUri || node.props.source.uri
      const opacity = getOpacity(node)
      // TODO
      // node.props.resizeMode === "cover"
      const fullPath = uri
      const {top,left,width,height} = node.layout
      if (fullPath.match(/^https?:\/\//)) {
        const img = new Canvas.Image()
        img.src = await fetch(fullPath).then(response => response.buffer())
        ctx.drawImage(img, left, top, width, height)
      } else if (fs.existsSync(fullPath)) {
        const img = new Canvas.Image()
        img.src = await prom(done => fs.readFile(fullPath, done));
        ctx.drawImage(img, left, top, width, height)
      } else {
        ctx.fillStyle = '#aaa'
        ctx.fillRect(left, top, width, height)
        ctx.strokeStyle = '#888'
        ctx.strokeRect(left, top, width, height)
        ctx.beginPath()
        ctx.moveTo(left, top)
        ctx.lineTo(left + width, top + height)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(left + width, top)
        ctx.lineTo(left, top + height)
        ctx.stroke()
      }
    } else {
      await renderers.View(ctx, settings, node)
    }
  },
  Text: async (ctx, settings, node) => {
    drawText(ctx, settings.fontCache, node.layout, styleFromComponent(node), node[textLines])
  },
  View: async (ctx, settings, node) => {
    const style = styleFromComponent(node)
    renderRect(ctx, node.layout, styleFromComponent(node))
  }
}

const renderNode = async (ctx, node: RenderedComponent, settings: Settings) => {
  if (!renderers[node.type]) {
    await renderers.View(ctx, settings, node)
  } else {
    await renderers[node.type](ctx, settings, node)
  }
  if (node.children) {
    ctx.save()
    ctx.translate(node.layout.left, node.layout.top)
    for (let child of node.children) {
      await renderNode(ctx, child, settings)
    }
    ctx.restore()
  }
};

const renderToCanvas = async (dest: string, root: RenderedComponent, settings: Settings) => {
  const canvas = new Canvas(settings.width, settings.height);
  const ctx = canvas.getContext('2d')
  await renderNode(ctx, root, settings);
  await prom(done => fs.writeFile(dest, canvas.toBuffer(), done))
}

export default renderToCanvas