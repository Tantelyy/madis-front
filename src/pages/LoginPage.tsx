import type { AuthenticatedUser } from '../auth/authApi'
import { LoginForm } from '../features/auth/LoginForm'
import { MADIS_BRANDING } from '../config/branding'

interface LoginPageProps {
  onLoginSuccess: (user: AuthenticatedUser) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-28 -top-40 h-96 w-96 rounded-full border border-teal-300/50" />
        <div className="absolute left-36 -top-52 h-96 w-96 rounded-full bg-cyan-100/60 blur-2xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-teal-100/70 blur-3xl" />
        <div className="absolute -bottom-64 -left-36 h-[34rem] w-[46rem] rotate-12 rounded-[50%] bg-gradient-to-tr from-cyan-700 via-cyan-500/80 to-teal-100/20" />
        <div className="absolute -bottom-72 -right-44 h-[31rem] w-[42rem] -rotate-12 rounded-[50%] bg-gradient-to-tl from-teal-600/80 via-cyan-300/60 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center">
        <section className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20">
          <div className="mx-auto w-full max-w-2xl lg:mx-0">
            <div className="mb-7 inline-flex h-32 w-32 items-center justify-center rounded-2xl border border-white/80 bg-white p-3 shadow-xl shadow-slate-300/40">
              <img
                src={MADIS_BRANDING.logoPath}
                alt="Ma Distribution"
                className="h-full w-full object-contain"
              />
            </div>

            <p className="mb-5 flex w-fit items-center gap-2 rounded-full border border-teal-200/80 bg-white/75 px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm backdrop-blur">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100">
                ✓
              </span>
              Plateforme de gestion intelligente
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Connectez-vous à votre
              <span className="block text-teal-700">espace de gestion.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Accédez rapidement à vos outils avec votre adresse email et votre
              mot de passe.
            </p>
            <p className="mt-7 text-xl font-semibold italic text-teal-800">
              « {MADIS_BRANDING.slogan} »
            </p>
          </div>

          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl shadow-slate-400/20 backdrop-blur sm:p-9 lg:mx-0">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                  Connexion
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Renseignez vos identifiants pour continuer.
                </p>
              </div>
            </div>

            <LoginForm onLoginSuccess={onLoginSuccess} />
          </div>
        </section>
      </div>
    </main>
  )
}
