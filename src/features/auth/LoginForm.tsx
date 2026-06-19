import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  login,
  type AuthenticatedUser,
  type LoginCredentials,
} from '../../auth/authApi'
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
  const [errorMessage, setErrorMessage] = useState<string>('')
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
        onChange={handleChange}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-rose-300"
      >
        {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
      </button>
    </form>
  )
}
