import * as fs from "fs"
import * as path from "path"

import * as yoga from "yoga-layout"

import renderToSVGString from './render-to-string'

// toMatchSVGSnapshot(1024, 768)

const fail = (msg) => ({ message: () => msg, pass: false })

export { addFontFallback, loadFont } from "./font-loader"

import {fontState} from './font-loader'

// if (typeof expect !== "undefined") {
expect.extend({
        toMatchSVGSnapshot(root: Component, width, height) {
            if (!root) { return fail("A falsy Component was passed to toMatchSVGSnapshot") }
            if (!root.props) { return fail("A Component without props was passed to toMatchSVGSnapshot") }
            if (!root.type) { return fail("A Component without a type was passed to toMatchSVGSnapshot") }

            // getState isn't in the d.ts for Jest, this is ok though.
            const state = (expect as any).getState()
            const currentTest = state.testPath as string
            const currentTestName = state.currentTestName as string

            const testFile = currentTestName.replace(/\s+/g, "-").replace(/\//g, "-").toLowerCase()

            //  Figure out the paths
            const snapshotsDir = path.join(currentTest, "..", "__snapshots__")
            const expectedSnapshot = path.join(snapshotsDir, path.basename(currentTest) + "-" + testFile + ".svg")

            // Make our folder if it's needed
            if (!fs.existsSync(snapshotsDir)) { fs.mkdirSync(snapshotsDir) }

            // We will need to do something smarter in the future, these snapshots need to be 1 file per test
            // whereas jest-snapshots can be multi-test per file.

            const svgText = renderToSVGString(currentTest, root, fontState, width, height)

            // TODO: Determine if Jest is in `-u`?
            // can be done via the private API
            // state.snapshotState._updateSnapshot === "all"

            // Are we in write mode?
            if (!fs.existsSync(expectedSnapshot)) {
                fs.writeFileSync(expectedSnapshot, svgText)
                return {
                    message: () => "Created a new Snapshot for you",
                    pass: false
                }
            } else {
                const contents = fs.readFileSync(expectedSnapshot, "utf8")
                if (contents !== svgText) {
                    fs.writeFileSync(expectedSnapshot, svgText)
                    return { message: () => `SVG Snapshot failed: we have updated it for you`, pass: false }
                } else {
                    return { message: () => "All good", pass: true }
                }
            }
        }
    } as any)
// }
