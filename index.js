const { JSDOM } = require("jsdom");
const CSSSelect = require("./vendor/css-select");
const cssSelectAdapter = require("./css-select-adapter-dom");

const { document } = new JSDOM(`
<html>
  <head></head>
  <body>
    <div id="scope">
      <span id="child">
        <span id="descendant"></span>
      </span>
    </div>
  </body>
</html>
`).window;

function querySelector(element, query) {
  return CSSSelect.selectOne(query, element, { adapter: cssSelectAdapter });
}

function test(query, scope = document) {
  const expected = scope.querySelector(query);
  const actual = querySelector(scope, query);

  if (expected !== actual) {
    console.log("dom");
    console.log(expected);
    console.log("css-select");
    console.log(actual);
    throw new Error("queried elements are different");
  } else {
    console.log(`passed '${query}'`);
  }
}

test(":scope > span", document.querySelector("#scope"));
