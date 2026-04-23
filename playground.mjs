import { createInterface } from "readline";

const prettier = await import(
  "/Users/bi/github/biome/crates/biome_formatter_test/src/prettier/node_modules/prettier/index.mjs"
);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "md> ",
});

console.log("Remark + Prettier Markdown Playground");
console.log('Type markdown, see the AST and Prettier output. Type "quit" to exit.\n');

rl.prompt();

rl.on("line", async (line) => {
  if (line.trim() === "quit") {
    rl.close();
    return;
  }

  const input = line + "\n";

  try {
    // Parse AST
    const { ast } = await prettier.__debug.parse(input, {
      filepath: "test.md",
    });

    // Format
    const formatted = await prettier.format(input, { filepath: "test.md" });

    console.log("\n--- AST ---");
    printNode(ast.children[0], 0);
    console.log("\n--- Prettier ---");
    console.log(formatted.trimEnd());
    console.log();
  } catch (e) {
    console.error("Error:", e.message);
  }

  rl.prompt();
});

function printNode(node, depth) {
  if (!node) return;
  const indent = "  ".repeat(depth);

  if (node.type === "text") {
    console.log(`${indent}text: ${JSON.stringify(node.value)}`);
  } else if (node.type === "inlineCode") {
    console.log(`${indent}inlineCode: ${JSON.stringify(node.value)}`);
  } else {
    const pos = node.position;
    const range = pos
      ? ` [${pos.start.offset}..${pos.end.offset}]`
      : "";
    console.log(`${indent}${node.type}${range}`);

    if (node.children) {
      for (const child of node.children) {
        printNode(child, depth + 1);
      }
    }
    if (node.value !== undefined && node.type !== "text") {
      console.log(`${indent}  value: ${JSON.stringify(node.value)}`);
    }
  }
}
