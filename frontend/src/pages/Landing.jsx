import { useAuth } from '../context/AuthContext'

function Landing() {
  const { login } = useAuth()

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center overflow-hidden relative">
      {/* Background Vector Graphics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left decorative circles */}
        <svg className="absolute -top-20 -left-20 w-80 h-80 text-primary-200 opacity-50 animate-[spin_30s_linear_infinite]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        
        {/* Top-right link chain */}
        <svg className="absolute top-10 right-10 w-48 h-48 text-primary-300 opacity-40 animate-[float_4s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
          <path d="M30 50 L45 50 M55 50 L70 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <rect x="20" y="40" width="30" height="20" rx="10" stroke="currentColor" strokeWidth="2" />
          <rect x="50" y="40" width="30" height="20" rx="10" stroke="currentColor" strokeWidth="2" />
        </svg>
        
        {/* Bottom-left abstract shape */}
        <svg className="absolute bottom-20 left-10 w-64 h-64 text-primary-200 opacity-30 animate-[pulse_4s_ease-in-out_infinite]" viewBox="0 0 200 200">
          <path d="M40 100 Q40 40 100 40 Q160 40 160 100 Q160 160 100 160 Q40 160 40 100" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M60 100 Q60 60 100 60 Q140 60 140 100 Q140 140 100 140 Q60 140 60 100" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        
        {/* Bottom-right dots pattern */}
        <svg className="absolute -bottom-10 -right-10 w-72 h-72 text-primary-300 opacity-40 animate-[float_5s_ease-in-out_infinite_0.5s]" viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="3" fill="currentColor" />
          <circle cx="40" cy="20" r="3" fill="currentColor" />
          <circle cx="60" cy="20" r="3" fill="currentColor" />
          <circle cx="80" cy="20" r="3" fill="currentColor" />
          <circle cx="20" cy="40" r="3" fill="currentColor" />
          <circle cx="40" cy="40" r="3" fill="currentColor" />
          <circle cx="60" cy="40" r="3" fill="currentColor" />
          <circle cx="80" cy="40" r="3" fill="currentColor" />
          <circle cx="20" cy="60" r="3" fill="currentColor" />
          <circle cx="40" cy="60" r="3" fill="currentColor" />
          <circle cx="60" cy="60" r="3" fill="currentColor" />
          <circle cx="80" cy="60" r="3" fill="currentColor" />
          <circle cx="20" cy="80" r="3" fill="currentColor" />
          <circle cx="40" cy="80" r="3" fill="currentColor" />
          <circle cx="60" cy="80" r="3" fill="currentColor" />
          <circle cx="80" cy="80" r="3" fill="currentColor" />
        </svg>
        
        {/* Floating link icon - left side */}
        <svg className="absolute top-1/3 left-20 w-16 h-16 text-primary-400 opacity-30 animate-[float_3.5s_ease-in-out_infinite_0.2s]" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        
        {/* Floating scissors icon - right side */}
        <svg className="absolute bottom-1/3 right-20 w-20 h-20 text-primary-400 opacity-25 animate-[float_4.5s_ease-in-out_infinite_0.8s]" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.121 14.121L7.05 21.192m0-14.142l7.071 7.071m2.828-2.828a3 3 0 104.243 4.243 3 3 0 00-4.243-4.243zm-9.9 9.9a3 3 0 104.243 4.242 3 3 0 00-4.243-4.243z" />
        </svg>
        
        {/* Wave line at bottom */}
        <svg className="absolute bottom-0 left-0 w-full h-24 text-primary-100" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,120 400,0 600,60 C800,120 900,0 1200,60 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="text-center px-4 relative z-10">
        {/* Logo */}
        <img 
          src="/logo.png" 
          alt="Snippy" 
          className="h-28 mx-auto mb-1 animate-[float_3s_ease-in-out_infinite]" 
        />

        {/* Tagline */}
        <p 
          className="text-l text-gray-500 mb-10 max-w-md mx-auto font-medium animate-[fadeIn_0.8s_ease-out_0.2s_both]" 
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Shorten, share, and track your links with ease.
        </p>

        {/* Login Button */}
        <button
          onClick={login}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-primary-200 rounded-xl text-gray-700 font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] animate-[fadeInUp_0.6s_ease-out_0.4s_both]"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Footer - Creator Info */}
        <div className="mt-8 flex items-center justify-center gap-4 animate-[fadeIn_0.6s_ease-out_0.6s_both]">
          <span className="text-sm text-gray-400">Built by Rishabh Kanojiya</span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/rishexx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/rishabhhkanojiya/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
