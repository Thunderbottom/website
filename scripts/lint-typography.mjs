// Enforces the type system: only src/styles/typography.css may set text
// styles, and every value there must be a token from tokens.css.
// Run with: node scripts/lint-typography.mjs
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";

const postcss = createRequire(process.cwd() + "/")("postcss");
const TEXT_PROPS =
  /^(font|font-(size|weight|family|style|variant-numeric))$|^(line-height|letter-spacing|text-transform)$/;
const OWNERS = new Set(["typography.css", "tokens.css", "print.css"]);
const ALLOWED_VALUE =
  /^(var\(--(text|w|lh|track|serif|sans|mono)[a-z0-9-]*\)|inherit|italic|tabular-nums|0\.875em|0\.75em|0)$/;

let problems = 0;
const report = (msg) => {
  problems++;
  console.log("  x " + msg);
};

for (const file of readdirSync("src/styles").filter((f) =>
  f.endsWith(".css"),
)) {
  const root = postcss.parse(readFileSync(`src/styles/${file}`, "utf8"));
  root.walkDecls((d) => {
    if (!TEXT_PROPS.test(d.prop)) return;
    if (d.parent.type === "atrule") return; // @font-face descriptors
    const where = `${file}:${d.source.start.line} ${d.parent.selector} { ${d.prop}: ${d.value} }`;
    if (!OWNERS.has(file))
      return report(`text style outside typography.css  ${where}`);
    if (file === "typography.css" && !ALLOWED_VALUE.test(d.value.trim()))
      report(`value is not a token  ${where}`);
  });
}

// Raw sizes must not appear in components either.
for (const dir of ["src/components", "src/pages", "src/layouts"]) {
  const walk = (p) =>
    readdirSync(p, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${p}/${e.name}`) : [`${p}/${e.name}`],
    );
  for (const f of walk(dir).filter((f) => f.endsWith(".astro"))) {
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (/style="[^"]*(font|line-height|letter-spacing)/.test(line))
          report(`inline text style  ${f}:${i + 1}`);
      });
  }
}

console.log(problems ? `\n${problems} problem(s)` : "typography: clean");
process.exit(problems ? 1 : 0);
