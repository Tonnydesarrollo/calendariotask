const fs = require("fs");
const path = require("path");

const root = process.argv[2] || ".";
const outFile = process.argv[3] || "estructura.md";

function walk(dir, prefix = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !["node_modules", ".git", "dist"].includes(e.name))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

  let result = "";
  entries.forEach((entry, i) => {
    const isLast = i === entries.length - 1;
    const pointer = isLast ? "└── " : "├── ";
    result += `${prefix}${pointer}${entry.name}\n`;

    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      result += walk(path.join(dir, entry.name), newPrefix);
    }
  });

  return result;
}

const tree = walk(root);

const md = `# Estructura del proyecto\n\n\`\`\`text\n${path.basename(path.resolve(root))}\n${tree}\`\`\`\n`;

fs.writeFileSync(outFile, md, "utf8");
console.log("Listo:", outFile);
