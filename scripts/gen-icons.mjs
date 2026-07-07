import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");
const svg = await readFile(join(iconsDir, "icon.svg"));

// 기본 아이콘 (any)
await sharp(svg).resize(192, 192).png().toFile(join(iconsDir, "icon-192.png"));
await sharp(svg).resize(512, 512).png().toFile(join(iconsDir, "icon-512.png"));

// maskable: 안전영역 확보를 위해 브랜드 배경 위에 축소 배치
const inner = await sharp(svg).resize(400, 400).png().toBuffer();
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 255, g: 122, b: 89, alpha: 1 },
  },
})
  .composite([{ input: inner, gravity: "center" }])
  .png()
  .toFile(join(iconsDir, "icon-maskable.png"));

console.log("icons generated");
