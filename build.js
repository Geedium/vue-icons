import https from "node:https";

import DomParser from "dom-parser";

import fs from "node:fs";

import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Alphabet
// A, B, C,
// D, E, F,
// G, H, I,
// J, K, L,
// M, N, O,
// P, Q, R,
// S, T, U,
// V, W, X,
// Y, Z
const letterIndex = "Z";

const config = {
  bundle: false,
  minify: false,
};

// BUILDING FILES===>
function build(input) {
  const html = input;

  let _bundled = [];
  _bundled.push('import { Icon } from "../../index.js"');

  var parser = new DomParser();

  var dom = parser.parseFromString(html);
  const svgRoots = dom.getElementsByClassName("MuiSvgIcon-root");
  for (const svgRoot of svgRoots) {
    const attr = svgRoot.getAttribute("data-testid");
    if (!attr || !attr.startsWith(letterIndex)) {
      continue;
    }

    let paths = [];
    let circles = [];

    for (const child of svgRoot?.childNodes) {
      if (child?.nodeName === "path") {
        paths.push(child.getAttribute("d"));
        continue;
      } else if (child?.nodeName === "circle") {
        const c = {
          cx: child.getAttribute("cx"),
          cy: child.getAttribute("cy"),
          r: child.getAttribute("r"),
        };
        circles.push(c);
      }
    }

    const json = JSON.stringify(circles);
    const unquoted = json.replace(/"([^"]+)":/g, "$1:");

    if (config.bundle) {
      _bundled.push(`
export const ${attr} = (props) =>
  Icon(props, ${paths.length > 0 ? JSON.stringify(paths) : "[]"}${
        circles.length > 0 ? `,${unquoted}` : ""
      });
`);
      continue;
    }

    const buffer = `import { Icon } from "../../index.js";

const ${attr} = (props) =>
  Icon(props, ${paths.length > 0 ? JSON.stringify(paths) : "[]"}${
      circles.length > 0 ? `,${unquoted}` : ""
    });

export default ${attr};
`;

    fs.writeFile(
      path.join(__dirname, "material-icons", letterIndex, `${attr}.js`),
      buffer,
      (err) => {
        if (err) throw err;
        // console.log("The file has been saved!");
      }
    );
  }

  if (config.bundle) {
    fs.writeFile(
      path.join(__dirname, "material-icons", "bundle.min.js"),
      _bundled.join(";"),
      (err) => {
        if (err) throw err;
      }
    );
  }
}

// READING FS===>
const cacheLocation = path.resolve(__dirname, "mui.cache");
if (fs.existsSync(cacheLocation)) {
  build(fs.readFileSync(cacheLocation, { encoding: "utf8", flag: "r" }));
} else {
  const req = https.request(
    "https://mui.com/material-ui/material-icons/",
    (res) => {
      const data = [];

      res.setEncoding("utf8");

      res.on("data", (_) => data.push(_));

      res.on("end", () => {
        const html = data.join();

        fs.writeFile("mui.cache", html, (err) => {
          if (err) throw err;
          console.log("The cache file has been saved! Re-run.");
          process.exit(0);
        });
      });
    }
  );

  req.end();
}
