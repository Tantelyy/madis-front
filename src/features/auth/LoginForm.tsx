import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  login,
  type AuthenticatedUser,
  type LoginCredentials,
} from '../../auth/authApi'
import { consumeLoginRedirectMessage } from '../../auth/loginRedirect'
import { Alert } from '../../components/Alert'
import { TextField } from '../../components/TextField'

interface LoginFormProps {
  onLoginSuccess: (user: AuthenticatedUser) => void
}

const initialCredentials: LoginCredentials = {
  email: '',
  password: '',
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [credentials, setCredentials] =
    useState<LoginCredentials>(initialCredentials)
  const [errorMessage, setErrorMessage] = useState<string>(() =>
    consumeLoginRedirectMessage(),
  )
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target
    const name = event.target.name as keyof LoginCredentials

    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await login(credentials)
      setSuccessMessage(response.message)
      onLoginSuccess(response.user)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de se connecter pour le moment.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      <TextField
        id="email"
        name="email"
        label="Adresse email"
        type="email"
        value={credentials.email}
        autoComplete="email"
        placeholder="nom@entreprise.com"
        required
        leadingIcon={
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        }
        onChange={handleChange}
      />

      <TextField
        id="password"
        name="password"
        label="Mot de passe"
        type="password"
        value={credentials.password}
        autoComplete="current-password"
        placeholder="Votre mot de passe"
        required
        leadingIcon={
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        }
        onChange={handleChange}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition hover:from-teal-800 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:from-teal-300 disabled:to-teal-300"
      >
        {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
      </button>
    </form>
  )
}
