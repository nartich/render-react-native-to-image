# render-react-native-to-image

Take a React Native component tree, and render it into an SVG or PNG image.

(based on [jest-snapshots-svg](https://github.com/jest-community/jest-snapshots-svg) by @orta over at Artsy)

## What is this for?

Our goal with this is to function as a more human-viewable snapshot, a companion to jest json snapshots.
Commit both to your repository, and the machine can diff the json to show *if* something changed, while you can look at the generated images to see *what* changed and *how*.

## How ready is it?

Very alpha.

If it proves useful at Khan Academy, I might turn it into something much more streamlined.

## How can I use it?

```ts
import * as React from "react"
import { Text } from "react-native"
import * as renderer from "react-test-renderer"
import {renderToSVGString, renderToCanvas} from "render-react-native-to-image"

describe("Fixtures", () => {
  it("does some simple JSX", () => {
    const component = renderer.create(<Text>Hello</Text>).toJSON()
    expect(component).toMatchSnapshot()
    renderToCanvas('./example.png', component)
    fs.writeFileSync('./example.svg', renderToSVGString(component))
  })
})
```

## License

MIT