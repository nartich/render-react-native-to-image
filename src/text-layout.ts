import * as LineBreaker from "linebreak"
import { AttributedStyle, TextWithAttributedStyle } from "./extract-text"
import { fontForStyle } from "./font-utils"
import { FontCache } from './'

export const lineWidth = (fontState: FontCache, { text, attributedStyles }: TextWithAttributedStyle): number =>
  attributedStyles.reduce((x, { start, end, style }, i) => {
    let body = text.slice(start, end)
    // Trim trailling whitespace
    if (i === attributedStyles.length - 1) {
      body = body.replace(/\s+$/, "")
    }
    const font = fontForStyle(fontState, style)
    return x + font.layout(body).advanceWidth / font.unitsPerEm * style.fontSize
  }, 0)

export const lineHeight = (line: TextWithAttributedStyle): number =>
  Math.max(
    0,
    ...line.attributedStyles.map(({ style }) => style.lineHeight)
  )

export const lineFontSize = (line: TextWithAttributedStyle): number =>
  Math.max(
    0,
    ...line.attributedStyles.map(({ style }) => style.fontSize)
  )

const baselineForAttributedStyle = (fontState: FontCache, { style }: AttributedStyle): number => {
  const font = fontForStyle(fontState, style)
  return font.ascent / font.unitsPerEm * style.fontSize
}

export const lineBaseline = (fontState: FontCache, line: TextWithAttributedStyle): number =>
  Math.max(0, ...line.attributedStyles.map(x => baselineForAttributedStyle(fontState, x)))

const textSlice = (
  textStyle: TextWithAttributedStyle,
  start: number,
  end: number
): TextWithAttributedStyle => ({
  text: textStyle.text.slice(start, end),
  attributedStyles: textStyle.attributedStyles
    .filter(a => a.end > start && a.start < end)
    .map(a => ({
      start: Math.max(a.start - start, 0),
      end: Math.min(a.end - start, end - start),
      style: a.style,
    }))
})

export const breakLines = (
  fontState: FontCache,
  textStyle: TextWithAttributedStyle,
  width: number
): TextWithAttributedStyle[] => {
  const { text, attributedStyles } = textStyle
  const breaker = new LineBreaker(text)

  const lines: TextWithAttributedStyle[] = []
  let lineStart = 0
  let lastPosition = 0
  let lastLine: TextWithAttributedStyle | null = null
  let shouldBreak = false

  let bk: any = breaker.nextBreak()
  while (bk != null) {
    const { position, required } = bk
    const testLine = textSlice(textStyle, lineStart, position)
    if (lastLine === null || (!shouldBreak && lineWidth(fontState, testLine) <= width)) {
      lastLine = testLine
    } else {
      lines.push(lastLine)
      lineStart = lastPosition
      lastLine = textSlice(textStyle, lineStart, position)
    }
    lastPosition = position
    shouldBreak = required
    bk = breaker.nextBreak()
  }

  if (lastLine !== null) {
    lines.push(lastLine)
  }

  return lines
}

export const measureLines = (fontState, lines) => ({
  width: Math.max(0, ...lines.map(x => lineWidth(fontState, x))),
  height: lines.reduce((a, b) => a + lineHeight(b), 0),
})
