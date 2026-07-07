import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");
const publicDir = join(root, "public");
// 최적화된 logo.png 우선, 없으면 원본 tinywords.png
const logoPath = [join(publicDir, "logo.png"), join(publicDir, "tinywords.png")].find(
  (p) => existsSync(p),
);
if (!logoPath) {
  console.error("logo.png 또는 tinywords.png 가 public/ 에 필요합니다.");
  process.exit(1);
}
const logo = await readFile(logoPath);

// 기본 아이콘 (any)
await sharp(logo).resize(192, 192).png().toFile(join(iconsDir, "icon-192.png"));
await sharp(logo).resize(512, 512).png().toFile(join(iconsDir, "icon-512.png"));

// maskable: 원형 마스크 안전영역 확보를 위해 핑크 배경 위에 88% 크기로 배치
const inner = await sharp(logo).resize(450, 450).png().toBuffer();
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 255, g: 240, b: 246, alpha: 1 },
  },
})
  .composite([{ input: inner, gravity: "center" }])
  .png()
  .toFile(join(iconsDir, "icon-maskable.png"));

console.log("icons generated from logo");
