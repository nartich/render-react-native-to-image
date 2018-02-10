
import { RenderedComponent, Settings } from "../layout"
import {styleFromComponent, textLines} from "../layout/component-to-node"
import { FontCache } from '../layout'
import * as fs from 'fs'
import * as path from 'path'
import drawText from './drawText'
import fetch from 'node-fetch'

import {createCanvas, Image} from 'canvas'

const getOpacity = node => {
  const {opacity = 1} = styleFromComponent(node)
  return opacity
}

const roundedPath = (ctx, radius, {top, left, width, height}, stroke) => {
  ctx.beginPath();
  top += stroke / 2
  left += stroke / 2
  width -= stroke
  height -= stroke
  ctx.moveTo(left + radius.tl, top);
  ctx.lineTo(left + width - radius.tr, top);
  ctx.arcTo(left + width, top, left + width, top + radius.tr, radius.tr);

  ctx.lineTo(left + width, top + height - radius.br);
  ctx.arcTo(left + width, top + height, left + width - radius.br, top + height, radius.br);

  ctx.lineTo(left + radius.bl, top + height);
  ctx.arcTo(left, top + height, left, top + height - radius.bl, radius.bl);

  ctx.lineTo(left, top + radius.tl);
  ctx.arcTo(left, top, left + radius.tl, top, radius.tl);

  ctx.closePath();
}

const radiusFromStyle = (style, width, height) => {
  const all = style.borderRadius || 0
  const mx = width / 2
  const my = height / 2
  const mm = Math.min(mx, my)
  return {
    tl: Math.min(mm, style.borderTopLeftRadius || all),
    tr: Math.min(mm, style.borderTopRightRadius || all),
    bl: Math.min(mm, style.borderBottomLeftRadius || all),
    br: Math.min(mm, style.borderBottomRightRadius || all)
  }
}

const line = (ctx, y0, x0, y1, x1) => {
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
}

const renderRect = (ctx, layout, style) => {
  const radius = radiusFromStyle(style, layout.width, layout.height)
  if (style.backgroundColor) {
    ctx.fillStyle = style.backgroundColor
    roundedPath(ctx, radius, layout, style.borderWidth ? style.borderWidth / 2 : 0)
    ctx.fill()
    // ctx.fillRect(left, top, width, height)
    // ctx.fillStyle = 'transparent'
  }
  if (style.borderWidth) {
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = style.borderWidth
    roundedPath(ctx, radius, layout, style.borderWidth)
    ctx.stroke()
    // ctx.strokeRect(left, top, width, height)
    // TODO much more border stuff
  }
  const {top, left, width, height} = layout
  if (style.borderBottomWidth) {
    console.log('doing it')
    ctx.lineWidth = style.borderBottomWidth
    ctx.strokeStyle = style.borderBottomColor || style.borderColor
    line(ctx, top + height, left, top + height, left + width);
    ctx.stroke()
  }
  if (style.borderLeftWidth) {
    ctx.lineWidth = style.borderLeftWidth
    ctx.strokeStyle = style.borderLeftColor || style.borderColor
    line(ctx, top, left, top + height, left);
    ctx.stroke()
  }
  if (style.borderRightWidth) {
    ctx.lineWidth = style.borderRightWidth
    ctx.strokeStyle = style.borderRightColor || style.borderColor
    line(ctx, top, left + width, top + height, left + width);
    ctx.stroke()
  }
  if (style.borderTopWidth) {
    ctx.lineWidth = style.borderTopWidth
    ctx.strokeStyle = style.borderTopColor || style.borderColor
    line(ctx, top, left, top, left + width);
    ctx.stroke()
  }
}

const prom = fn => new Promise((res, rej) => fn((err, val) => err ? rej(err) : res(val)));

const renderers: {[key: string]: (ctx, settings: Settings, node: RenderedComponent) => Promise<void>} = {
  RCTScrollView: (ctx, settings, node) => renderers.View(ctx, settings, node),
  Image: async (ctx, settings, node) => {
    const style = styleFromComponent(node)
    if (node.props.source && (node.props.source.testUri || node.props.source.uri)) {
      let uri = node.props.source.testUri || node.props.source.uri
      uri = settings.assetMap[uri] || uri

      const opacity = getOpacity(node)
      // TODO
      // node.props.resizeMode === "cover"
      const {top,left,width,height} = node.layout
      if (uri.match(/^https?:\/\//)) {
        const img = new Image()
        img.src = await fetch(uri).then(response => response.buffer())
        ctx.drawImage(img, left, top, width, height)
      } else {
        const fullPath = uri.startsWith('/') ? uri : path.join(settings.basePath, uri)
        if (fs.existsSync(fullPath)) {
          const img = new Image()
          img.src = await prom(done => fs.readFile(fullPath, done));
          ctx.drawImage(img, left, top, width, height)
        } else {
          console.warn('Referenced image not found:', uri)
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
          ctx.font = '10px sans-serif'
          ctx.fillStyle = 'white'
          ctx.fillText(uri, left + 1, top + 11)
          ctx.fillStyle = 'black'
          ctx.fillText(uri, left, top + 10)
        }
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
  const canvas = createCanvas(settings.width, settings.height);
  const ctx = canvas.getContext('2d')
  await renderNode(ctx, root, settings);
  await prom(done => fs.writeFile(dest, canvas.toBuffer(), done))
}

export default renderToCanvas