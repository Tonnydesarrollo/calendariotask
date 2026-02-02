import fs from "fs";
import path from "path";
import sharp from "sharp";

const input = "public/favicon.png"; // o tu imagen base grande
const outDir = "public/icons";

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

await sharp(input).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
await sharp(input).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));

console.log("Listo: icon-192.png y icon-512.png generados correctamente");
