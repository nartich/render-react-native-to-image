
import renderToSVGString from './render-to-string'

export {renderToSVGString}
export {initFontCache, loadFont, addFontFallback} from './font-utils'

export type FontCache = {
  fonts: {[key: string]: any},
  fallbacks: {[key: string]: string}
};

export interface Component {
    type: string
    props: any
    children: Component[] | string[] | null
}

export interface RenderedComponent {
    type: string
    props: any
    textContent: string | undefined
    children: RenderedComponent[]
    layout: {
        left: number
        right: number
        top: number
        bottom: number
        width: number
        height: number
    }
}

export interface Settings {
    basePath: null | string
    fontCache: FontCache
    width: number
    height: number
}
