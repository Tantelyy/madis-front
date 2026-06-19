import type { AuthenticatedUser } from '../auth/authApi'
import { LoginForm } from '../features/auth/LoginForm'

interface LoginPageProps {
  onLoginSuccess: (user: AuthenticatedUser) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-sky-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <section className="grid w-full items-center gap-10 lg:grid-cols-[1fr_420px]">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
              Espace sécurisé
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Connectez-vous à votre espace de gestion.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Accédez rapidement à vos outils avec votre adresse email et votre
              mot de passe.
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/70 sm:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-950">
                Connexion
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Renseignez vos identifiants pour continuer.
              </p>
            </div>

            <LoginForm onLoginSuccess={onLoginSuccess} />
          </div>
        </section>
      </div>
    </main>
  )
}
