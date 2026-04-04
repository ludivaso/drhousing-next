import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Marca' }

const PALETTE = [
  { name: 'Background',    hex: '#F5F2EE', textDark: true  },
  { name: 'Gold (accent)', hex: '#C9A96E', textDark: false },
  { name: 'Foreground',    hex: '#1A1A1A', textDark: false },
  { name: 'Dark panels',   hex: '#2C2C2C', textDark: false },
  { name: 'Forest dark',   hex: '#1B3A2D', textDark: false },
  { name: 'Muted',         hex: '#F0EDE8', textDark: true  },
]

const FONTS = [
  { name: 'Lora',    role: 'Serif — títulos, precios, logotipo', sample: 'AaBbCc 123' },
  { name: 'Poppins', role: 'Sans-serif — cuerpo, UI, etiquetas',  sample: 'AaBbCc 123' },
]

export default function BrandSettingsPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold mb-1">Identidad de Marca</h1>
        <p className="text-sm text-muted-foreground">
          Referencia visual de colores, tipografías y activos gráficos de DR Housing.
        </p>
      </div>

      {/* Logo */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-lg font-medium">Logotipo</h2>
        <div className="flex flex-wrap gap-6 items-start">
          {/* Light bg */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-40 h-40 rounded-xl border border-border bg-[#F5F2EE] flex items-center justify-center p-4">
              <Image src="/logo.png" alt="DR Housing logo" width={120} height={120} className="w-auto h-auto object-contain" />
            </div>
            <span className="text-xs text-muted-foreground">Fondo claro</span>
          </div>
          {/* Dark bg */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-40 h-40 rounded-xl bg-[#1B3A2D] flex items-center justify-center p-4">
              <Image src="/logo.png" alt="DR Housing logo" width={120} height={120} className="w-auto h-auto object-contain" />
            </div>
            <span className="text-xs text-muted-foreground">Fondo oscuro</span>
          </div>
          {/* Favicon */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-40 h-40 rounded-xl border border-border bg-white flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <Image src="/favicon-32x32.png" alt="favicon 32" width={32} height={32} />
                <span className="text-[10px] text-muted-foreground">32×32</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Image src="/apple-touch-icon.png" alt="apple icon" width={60} height={60} />
                <span className="text-[10px] text-muted-foreground">180×180</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Iconos</span>
          </div>
        </div>

        <div className="mt-2 text-sm text-muted-foreground space-y-1">
          <p><span className="font-medium text-foreground">Archivo fuente:</span> <code className="text-xs bg-muted px-1.5 py-0.5 rounded">public/logo.png</code> — 1668×1668 px PNG</p>
          <p><span className="font-medium text-foreground">Favicon ICO:</span> <code className="text-xs bg-muted px-1.5 py-0.5 rounded">public/favicon.ico</code> — 256×256 px</p>
          <p><span className="font-medium text-foreground">Favicon SVG:</span> <code className="text-xs bg-muted px-1.5 py-0.5 rounded">public/favicon.svg</code> — vectorial</p>
        </div>
      </section>

      {/* Palette */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-lg font-medium">Paleta de Colores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PALETTE.map(({ name, hex, textDark }) => (
            <div key={hex} className="rounded-xl overflow-hidden border border-border">
              <div
                className="h-20 flex items-end p-2"
                style={{ backgroundColor: hex }}
              >
                <span
                  className="text-xs font-mono font-medium"
                  style={{ color: textDark ? '#1A1A1A' : '#F5F2EE' }}
                >
                  {hex}
                </span>
              </div>
              <div className="px-3 py-2 bg-card">
                <p className="text-sm font-medium">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-lg font-medium">Tipografía</h2>
        <div className="space-y-4">
          {FONTS.map(({ name, role, sample }) => (
            <div key={name} className="flex items-baseline gap-4 p-4 rounded-lg bg-muted/40 border border-border">
              <div className="w-28 shrink-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{name}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-2xl truncate"
                  style={{ fontFamily: name === 'Lora' ? 'var(--font-serif)' : 'var(--font-sans)' }}
                >
                  {sample}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manifest + icons reference */}
      <section className="card-elevated p-6 space-y-3">
        <h2 className="font-serif text-lg font-medium">Archivos de Marca</h2>
        <div className="text-sm space-y-2 font-mono">
          {[
            'public/logo.png',
            'public/favicon.ico',
            'public/favicon.svg',
            'public/favicon-16x16.png',
            'public/favicon-32x32.png',
            'public/apple-touch-icon.png',
            'public/icon-192.png',
            'public/icon-512.png',
            'public/site.webmanifest',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <code className="text-xs bg-muted px-2 py-0.5 rounded">{f}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
