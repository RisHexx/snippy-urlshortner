import { useAuth } from '../context/AuthContext'

function Landing() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen app-hero">
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/80 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-slate-500">
            Snippy. URL Shortener
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink-900">
            Short links, clear insight.
          </h1>
<p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl">
  Build <span className="text-primary-500">tidy links</span>, share them <span className="text-primary-500">fast</span>, track <span className="text-primary-500">every click</span> — and stay protected with <span className="text-primary-500">rate limiting</span> at every layer.
</p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={login}
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-[0_12px_30px_-18px_rgba(249,115,22,0.8)]"
            >
<svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path
    fill="#ffffff"
    d="M12 11h8.533c.087.5.133 1.02.133 1.556C20.666 17.5 17.096 21 12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9c2.43 0 4.637.963 6.25 2.528L16.1 7.67C14.993 6.61 13.574 6 12 6c-3.313 0-6 2.687-6 6s2.687 6 6 6c2.9 0 5.15-1.95 5.8-4.625H12V11z"
  />
</svg>
              Continue with Google
            </button>

          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 text-xs text-slate-500 max-w-md">
            <div className="rounded-lg border border-sand-200 bg-white/80 px-3 py-2 text-center">Custom aliases</div>
            <div className="rounded-lg border border-sand-200 bg-white/80 px-3 py-2 text-center">AI Summary</div>
            <div className="rounded-lg border border-sand-200 bg-white/80 px-3 py-2 text-center">Live Dashboard</div>
          </div>
        </div>

        <div className="bg-white/90 border border-sand-200 rounded-2xl shadow-[0_20px_50px_-35px_rgba(15,23,42,0.4)] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Snippy" className="h-12" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Snippy Shortner</p>
              <p className="text-xs text-slate-500">Clean, trackable links</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-slate-600">
              https://very-long-link.example.com/articles/marketing
            </div>
            <div className="flex items-center justify-between rounded-xl border border-sand-200 bg-white px-4 py-3">
              <span className="text-sm font-semibold text-primary-600">snippy.rishabhkanojiya.in/customname</span>
              <span className="rounded-full bg-sand-100 px-3 py-1 text-[11px] font-semibold text-slate-500">Copied</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-sand-200 bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400">Clicks</p>
                <p className="text-xl font-semibold text-ink-900 mt-2">2,481</p>
              </div>
              <div className="rounded-xl border border-sand-200 bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400">Top source</p>
                <p className="text-xl font-semibold text-ink-900 mt-2">Desktop</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-10 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <span>Built by Rishabh Kanojiya</span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/rishexx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/rishabhhkanojiya/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
