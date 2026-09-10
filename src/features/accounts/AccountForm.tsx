import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import type { UserRole } from '../../auth/authApi'
import { TextField } from '../../components/TextField'
import { AppIcon } from '../../components/AppIcon'
import {
  getPermissionCodes,
  getRolePermissionCodes,
  mergePermissionCodes,
} from './accountAccess'
import type {
  Account,
  AccountPayload,
  CreateAccountPayload,
  Permission,
  Role,
} from './accountsApi'

interface AccountFormValues {
  userName: string
  email: string
  password: string
  role: UserRole
  selectedPermissions: string[]
}

interface AccountFormProps {
  account?: Account
  roles: Role[]
  permissions: Permission[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: AccountPayload | CreateAccountPayload) => Promise<void>
}

function getInitialRole(account: Account | undefined, roles: Role[]): UserRole {
  return (
    account?.role?.label ??
    roles.find((role) => role.label === 'SELLER')?.label ??
    roles[0]?.label ??
    'SELLER'
  )
}

function getInitialValues(
  account: Account | undefined,
  roles: Role[],
): AccountFormValues {
  const role = getInitialRole(account, roles)
  const selectedPermissions = account
    ? getPermissionCodes(account.permissions)
    : getRolePermissionCodes(roles.find((item) => item.label === role))

  return {
    userName: account?.userName ?? '',
    email: account?.email ?? '',
    password: '',
    role,
    selectedPermissions,
  }
}

export function AccountForm({
  account,
  roles,
  permissions,
  isSubmitting,
  onCancel,
  onSubmit,
}: AccountFormProps) {
  const [values, setValues] = useState<AccountFormValues>(() =>
    getInitialValues(account, roles),
  )
  const selectedRole = useMemo(
    () => roles.find((role) => role.label === values.role),
    [roles, values.role],
  )
  const rolePermissionCodes = useMemo(
    () => getRolePermissionCodes(selectedRole),
    [selectedRole],
  )
  const effectiveSelectedPermissions = useMemo(
    () =>
      mergePermissionCodes(values.selectedPermissions, rolePermissionCodes),
    [rolePermissionCodes, values.selectedPermissions],
  )

  function handleTextChange(event: ChangeEvent<HTMLInputElement>): void {
    const name = event.target.name as 'userName' | 'email' | 'password'
    const { value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleRoleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextRole = event.target.value as UserRole
    const nextRolePermissionCodes = getRolePermissionCodes(
      roles.find((role) => role.label === nextRole),
    )

    setValues((currentValues) => ({
      ...currentValues,
      role: nextRole,
      selectedPermissions: mergePermissionCodes(
        currentValues.selectedPermissions.filter(
          (code) => !rolePermissionCodes.includes(code),
        ),
        nextRolePermissionCodes,
      ),
    }))
  }

  function handlePermissionChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const { checked, value } = event.target

    setValues((currentValues) => {
      if (checked) {
        return {
          ...currentValues,
          selectedPermissions: mergePermissionCodes(
            currentValues.selectedPermissions,
            [value],
          ),
        }
      }

      return {
        ...currentValues,
        selectedPermissions: currentValues.selectedPermissions.filter(
          (code) => code !== value,
        ),
      }
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const payload: AccountPayload = {
      userName: values.userName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      permissions: effectiveSelectedPermissions,
    }

    if (values.password.trim()) {
      payload.password = values.password
    }

    await onSubmit(
      account
        ? payload
        : {
            ...payload,
            password: values.password,
          },
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="account-user-name"
          name="userName"
          label="Nom utilisateur"
          value={values.userName}
          placeholder="Nom affiché"
          required
          onChange={handleTextChange}
        />
        <TextField
          id="account-email"
          name="email"
          label="Email"
          type="email"
          value={values.email}
          placeholder="utilisateur@madis.com"
          required
          onChange={handleTextChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="account-password"
          name="password"
          label={account ? 'Nouveau mot de passe' : 'Mot de passe'}
          type="password"
          value={values.password}
          autoComplete="new-password"
          placeholder={account ? 'Laisser vide pour ne pas changer' : ''}
          required={!account}
          onChange={handleTextChange}
        />
        <div className="space-y-2">
          <label
            htmlFor="account-role"
            className="block text-sm font-medium text-slate-700"
          >
            Rôle
          </label>
          <span className="relative block">
          <select
            id="account-role"
            name="role"
            value={values.role}
            onChange={handleRoleChange}
            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.label}>
                {role.label}
              </option>
            ))}
          </select>
          <AppIcon
            name="chevron-down"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          />
          </span>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">
          Permissions
        </legend>
        <div className="grid gap-3 md:grid-cols-2">
          {permissions.map((permission) => {
            const isRolePermission = rolePermissionCodes.includes(
              permission.code,
            )

            return (
              <label
                key={permission.id}
                className="flex min-h-16 items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  value={permission.code}
                  checked={effectiveSelectedPermissions.includes(
                    permission.code,
                  )}
                  disabled={isRolePermission}
                  onChange={handlePermissionChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 disabled:opacity-60"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-semibold text-slate-900">
                    {permission.label}
                    {/* <span
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-500"
                      title={permission.descriptions ?? permission.label}
                      aria-label={permission.descriptions ?? permission.label}
                    >
                      ?
                    </span> */}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {isRolePermission
                      ? 'Permission incluse dans le rôle sélectionné.'
                      : permission.descriptions}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
