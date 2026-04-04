/**
 * Generates favicon PNG sizes from public/logo.png
 * Run: npx ts-node --skip-project scripts/generate-favicons.ts
 * Or:  npx tsx scripts/generate-favicons.ts
 */
import sharp from 'sharp'
import path from 'path'

const INPUT = path.join(process.cwd(), 'public', 'logo.png')

const sizes: { name: string; size: number }[] = [
  { name: 'favicon-16x16.png',   size: 16  },
  { name: 'favicon-32x32.png',   size: 32  },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
]

async function main() {
  for (const { name, size } of sizes) {
    const out = path.join(process.cwd(), 'public', name)
    await sharp(INPUT)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out)
    console.log(`✓ ${name} (${size}×${size})`)
  }
  console.log('All favicon sizes generated.')
}

main().catch((err) => { console.error(err); process.exit(1) })
