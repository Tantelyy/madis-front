import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { AccountForm } from '../features/accounts/AccountForm'
import { AccountModal } from '../features/accounts/AccountModal'
import { AccountsTable } from '../features/accounts/AccountsTable'
import {
  createAccount,
  disableAccount,
  listAccounts,
  listPermissions,
  listRoles,
  updateAccount,
  type Account,
  type AccountPayload,
  type CreateAccountPayload,
  type ListAccountsParams,
  type PaginatedAccounts,
  type Permission,
  type Role,
} from '../features/accounts/accountsApi'
import { useListControls } from '../hooks/useListControls'
import {
  createPaginationMeta,
  normalizePaginationMeta,
} from '../utils/paginationMeta'

const PAGE_SIZE = 10

type AccountModalState =
  | { type: 'form'; account?: Account }
  | { type: 'disable'; account: Account }
  | null

type SortableAccountField = Extract<
  ListAccountsParams['sortBy'],
  'userName' | 'email' | 'createdAt' | 'updatedAt'
>

interface AccountsPageProps {
  currentUserId: number | null
}

function isCreateAccountPayload(
  payload: AccountPayload | CreateAccountPayload,
): payload is CreateAccountPayload {
  return typeof payload.password === 'string' && payload.password.length > 0
}

export function AccountsPage({ currentUserId }: AccountsPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [meta, setMeta] = useState<PaginatedAccounts['meta']>(() =>
    createPaginationMeta(PAGE_SIZE),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [modalState, setModalState] = useState<AccountModalState>(null)
  const {
    page,
    setPage,
    search,
    sortBy,
    sortOrder,
    handleSearchChange,
    handlePageChange,
    handleSort,
  } = useListControls<SortableAccountField>({
    initialSortBy: 'createdAt',
    onBeforeChange: () => setIsLoading(true),
  })

  const fetchAccounts = useCallback((): Promise<PaginatedAccounts> => {
    return listAccounts({
      page,
      limit: PAGE_SIZE,
      search,
      sortBy,
      order: sortOrder,
    })
  }, [page, search, sortBy, sortOrder])

  function applyAccountsResponse(response: PaginatedAccounts): void {
    setAccounts(response.data)
    setMeta(normalizePaginationMeta(response.meta))
  }

  useEffect(() => {
    let isActive = true

    async function loadInitialData(): Promise<void> {
      try {
        const [accountsResponse, rolesResponse, permissionsResponse] =
          await Promise.all([fetchAccounts(), listRoles(), listPermissions()])

        if (!isActive) {
          return
        }

        applyAccountsResponse(accountsResponse)
        setRoles(rolesResponse)
        setPermissions(permissionsResponse)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les comptes.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialData()

    return () => {
      isActive = false
    }
  }, [fetchAccounts])

  async function handleSaveAccount(
    payload: AccountPayload | CreateAccountPayload,
  ): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (modalState?.type === 'form' && modalState.account) {
        await updateAccount(modalState.account.id, payload)
        setSuccessMessage('Compte modifié avec succès.')
      } else if (isCreateAccountPayload(payload)) {
        await createAccount(payload)
        setSuccessMessage('Compte ajouté avec succès.')
      } else {
        throw new Error('Le mot de passe est requis pour créer un compte.')
      }

      setModalState(null)
      applyAccountsResponse(await fetchAccounts())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible d’enregistrer le compte.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDisableAccount(): Promise<void> {
    if (modalState?.type !== 'disable') {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await disableAccount(modalState.account.id)
      setSuccessMessage('Compte désactivé avec succès.')
      setModalState(null)

      if (accounts.length === 1 && page > 1) {
        setIsLoading(true)
        setPage(page - 1)
        return
      }

      applyAccountsResponse(await fetchAccounts())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de désactiver le compte.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Comptes</h1>
        </div>
        <button
          type="button"
          onClick={() => setModalState({ type: 'form' })}
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200"
        >
          Ajouter un compte
        </button>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label
          htmlFor="account-search"
          className="block text-sm font-medium text-slate-700"
        >
          Rechercher un compte
        </label>
        <input
          id="account-search"
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Nom, email ou rôle"
          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:w-[36rem]"
        />
      </div>

      <AccountsTable
        accounts={accounts}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        currentUserId={currentUserId}
        onSort={handleSort}
        onEdit={(account) => setModalState({ type: 'form', account })}
        onDisable={(account) => setModalState({ type: 'disable', account })}
      />

      {meta.totalPages > 1 ? (
        <div className="mt-auto">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : null}

      {modalState?.type === 'form' ? (
        <AccountModal
          title={modalState.account ? 'Modifier le compte' : 'Ajouter un compte'}
          onClose={() => setModalState(null)}
          errorMessage={errorMessage}
        >
          <AccountForm
            account={modalState.account}
            roles={roles}
            permissions={permissions}
            isSubmitting={isSubmitting}
            onCancel={() => setModalState(null)}
            onSubmit={handleSaveAccount}
          />
        </AccountModal>
      ) : null}

      {modalState?.type === 'disable' ? (
        <AccountModal
          title="Confirmer la désactivation"
          onClose={() => setModalState(null)}
          errorMessage={errorMessage}
        >
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              Voulez-vous vraiment désactiver le compte{' '}
              <span className="font-semibold text-slate-950">
                {modalState.account.userName}
              </span>{' '}
              ?
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void handleDisableAccount()
                }}
                className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isSubmitting ? 'Désactivation...' : 'Désactiver'}
              </button>
            </div>
          </div>
        </AccountModal>
      ) : null}
    </section>
  )
}
