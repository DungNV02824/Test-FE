import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal valid PNG - 1x1 pixel blue
const minimalPng = Buffer.from([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a, // PNG signature
  0x00,
  0x00,
  0x00,
  0x0d, // IHDR chunk size
  0x49,
  0x48,
  0x44,
  0x52, // IHDR
  0x00,
  0x00,
  0x00,
  0x01, // width: 1
  0x00,
  0x00,
  0x00,
  0x01, // height: 1
  0x08,
  0x02,
  0x00,
  0x00,
  0x00, // bit depth, color type, etc
  0x90,
  0x77,
  0x53,
  0xde, // CRC
  0x00,
  0x00,
  0x00,
  0x0c, // IDAT chunk size
  0x49,
  0x44,
  0x41,
  0x54, // IDAT
  0x08,
  0x99,
  0x01,
  0x01,
  0x00,
  0x00,
  0xfe,
  0xff,
  0x00,
  0x00,
  0x00,
  0x02,
  0x00,
  0x01, // compressed data
  0x49,
  0xb4,
  0xe8,
  0xb7, // CRC
  0x00,
  0x00,
  0x00,
  0x00, // IEND chunk size
  0x49,
  0x45,
  0x4e,
  0x44, // IEND
  0xae,
  0x42,
  0x60,
  0x82, // CRC
]);

const dir = path.join(__dirname, "public", "images");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Create icons of different sizes by duplicating and scaling the minimal PNG
fs.writeFileSync(path.join(dir, "icon-16.png"), minimalPng);
fs.writeFileSync(path.join(dir, "icon-48.png"), minimalPng);
fs.writeFileSync(path.join(dir, "icon-128.png"), minimalPng);

console.log("✓ Icons created successfully");
