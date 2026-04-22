import { verifyPinAction } from './actions'

const COPY = {
  title:    'Private Preview',
  subtitle: 'Enter the access PIN to continue.',
  button:   'Unlock',
  errors: {
    invalid: 'PIN must be at least 4 characters.',
    wrong:   'Incorrect PIN.',
    nopin:   'No preview PIN has been configured yet.',
  },
} as const

export const metadata = {
  title: 'Private Preview · DR Housing',
  robots: { index: false, follow: false },
}

export default function PreviewGatePage({
  searchParams,
}: {
  searchParams: { next?: string; err?: keyof typeof COPY.errors }
}) {
  const next = searchParams.next ?? '/'
  const err  = searchParams.err ? COPY.errors[searchParams.err] : null

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F2EE] px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-3">
            DR Housing
          </p>
          <h1 className="font-serif text-2xl text-[#1A1A1A]">{COPY.title}</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">{COPY.subtitle}</p>
        </div>

        <form action={verifyPinAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <input
            type="password"
            name="pin"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            minLength={4}
            required
            className="w-full px-4 py-3 text-center tracking-widest rounded bg-white border border-[#E8E3DC] text-[#1A1A1A] focus:outline-none focus:border-[#C9A96E]"
            placeholder="••••"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 rounded bg-[#C9A96E] text-[#1A1A1A] text-sm font-medium hover:bg-[#b89656] transition-colors"
          >
            {COPY.button}
          </button>
          {err && (
            <p className="text-center text-sm text-[#1A1A1A] mt-2">{err}</p>
          )}
        </form>
      </div>
    </main>
  )
}
