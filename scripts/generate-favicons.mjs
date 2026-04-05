import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'

const INPUT = 'public/logo.png'

async function main() {
  // PNG sizes
  const sizes = [
    { name: 'public/favicon-16x16.png', size: 16 },
    { name: 'public/favicon-32x32.png', size: 32 },
    { name: 'public/apple-touch-icon.png', size: 180 },
    { name: 'public/icon-192.png', size: 192 },
    { name: 'public/icon-512.png', size: 512 },
  ]

  for (const { name, size } of sizes) {
    await sharp(INPUT)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(name)
    console.log(`✓ ${name} (${size}×${size})`)
  }

  // Replace favicon.ico with the 32×32 PNG bytes.
  // All modern browsers accept PNG data inside .ico files.
  const png32 = readFileSync('public/favicon-32x32.png')
  writeFileSync('public/favicon.ico', png32)
  console.log(`✓ favicon.ico replaced (${png32.length} bytes, was Lovable pink heart)`)
}

main().catch(err => { console.error(err); process.exit(1) })
