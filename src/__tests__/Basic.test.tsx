import renderToCanvas from "../canvas"
import layoutNode from "../layout"
import renderToSVG from "../svg/tree-to-svg"

import * as React from "react"
import { Image, Text, View } from "react-native"
import * as renderer from "react-test-renderer"

import * as fs from "fs"
import {ReactTestRendererJSON} from "react-test-renderer";

describe("Counting nodes", () => {
  it("it is good with memory", async () => {
    const jsx = (
      <View
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: "red",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image source={require("./example.png")} />
        <Image
          source={{
            uri:
              "https://cdn.kastatic.org/images/badges/meteorite/ten-to-fourth-40x40.png",
          }}
          style={{ width: 50, height: 50 }}
        />
        {/* <Image source={{ uri: "https://google.com/favicon.ico" }} /> */}
        <Image source={require("./example.png")} style={{ tintColor: "red" }} />
        <Text>Hello folks</Text>
        <View
          style={{ width: 50, height: 50, backgroundColor: "powderblue" }}
        />
        <Text style={{ maxWidth: 100 }}>
          Ok <Text style={{ fontWeight: "bold" }}>here</Text> is something{" "}
          <Text style={{ fontStyle: "italic" }}>long that </Text>is going to
          wrap for me.
        </Text>
        <View style={{ width: 50, height: 50, backgroundColor: "skyblue" }} />
        <View
          style={{
            width: 50,
            height: 50,
            backgroundColor: "steelblue",
            borderBottomWidth: 10,
            borderColor: "yellow",
            borderWidth: 2,
          }}
        />
        <View
          style={{ padding: 10, backgroundColor: "green", borderRadius: 10 }}
        >
          <View
            style={{
              padding: 10,
              backgroundColor: "blue",
              borderRadius: 100,
              borderColor: "orange",
              borderWidth: 2,
            }}
          />
        </View>
      </View>
    )

    const component = renderer.create(jsx).toJSON()! as renderer.ReactTestRendererJSON
    expect(component).toMatchSnapshot()
    if (component == null) {
      return
    }

    const fontCache = { fonts: {}, fallbacks: {} }
    console.log(__dirname)
    const settings = {
      assetMap: {},
      width: 320,
      height: 480,
      fontCache,
      basePath: __dirname + "/../../",
      renderPath: __dirname,
    }
    const node = layoutNode(component, settings)
    const svg = renderToSVG(node, settings)
    fs.writeFileSync(__dirname + "/Basic.test.svg", svg)
    await renderToCanvas(__dirname + "/Basic.test.png", node, settings)
    // expect(component).toMatchSVGSnapshot(320, 480)
  })
})
