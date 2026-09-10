import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { TabularExportButton } from '../components/TabularExportButton'
import { InventoryModal } from '../features/inventories/InventoryModal'
import { SpecialOfferForm } from '../features/promotions/SpecialOfferForm'
import {
  createSpecialOffer,
  deleteSpecialOffer,
  listAllSpecialOffers,
  listSpecialOffers,
  updateSpecialOffer,
  type PaginatedSpecialOffers,
  type SpecialOffer,
  type SpecialOfferPayload,
} from '../features/promotions/promotionsApi'
import {
  listAllSaleCatalogProducts,
  type SaleCatalogProduct,
} from '../features/sales/salesApi'
import { formatDate, formatDateTime } from '../utils/displayFormatters'
import { createPaginationMeta } from '../utils/paginationMeta'
import type { ExportColumn } from '../utils/tabularExport'

const PAGE_SIZE = 10

function formatPromotionRule(offer: SpecialOffer): string {
  return offer.type === 'REDUCTION'
    ? `-${Number(offer.value)} ${offer.unit === 'PERCENT' ? '%' : 'Ar'}`
    : `Acheter ${offer.buyQuantity}, recevoir ${offer.freeQuantity}`
}

function formatPromotionState(offer: SpecialOffer): string {
  if (offer.deletedAt) {
    return 'Supprimée'
  }

  return offer.isLocked ? 'Verrouillée par une vente' : 'Modifiable'
}

export function PromotionsPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([])
  const [products, setProducts] = useState<SaleCatalogProduct[]>([])
  const [meta, setMeta] = useState<PaginatedSpecialOffers['meta']>(() =>
    createPaginationMeta(PAGE_SIZE),
  )
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [validAt, setValidAt] = useState<string>('')
  const [selectedOffer, setSelectedOffer] = useState<
    SpecialOffer | null | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const fetchOffers = useCallback(
    (): Promise<PaginatedSpecialOffers> =>
      listSpecialOffers({
        page,
        limit: PAGE_SIZE,
        search,
        validAt: validAt || undefined,
      }),
    [page, search, validAt],
  )

  const applyOffers = useCallback((response: PaginatedSpecialOffers): void => {
    setOffers(response.data)
    setMeta(response.meta)
  }, [])

  async function refreshOffers(): Promise<void> {
    setIsLoading(true)

    try {
      applyOffers(await fetchOffers())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les promotions.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true

    void fetchOffers()
      .then((response) => {
        if (isActive) {
          applyOffers(response)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger les promotions.',
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [applyOffers, fetchOffers])

  useEffect(() => {
    let isActive = true

    void listAllSaleCatalogProducts()
      .then((response) => {
        if (isActive) {
          setProducts(response)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger les produits.',
          )
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  async function handleSave(payload: SpecialOfferPayload): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      if (selectedOffer) {
        await updateSpecialOffer(selectedOffer.id, payload)
        setSuccessMessage('Promotion modifiée avec succès.')
      } else {
        await createSpecialOffer(payload)
        setSuccessMessage('Promotion créée avec succès.')
      }

      setSelectedOffer(undefined)
      await refreshOffers()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la promotion.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(offer: SpecialOffer): Promise<void> {
    if (!window.confirm(`Supprimer la promotion « ${offer.label} » ?`)) {
      return
    }

    try {
      await deleteSpecialOffer(offer.id)
      setSuccessMessage(
        'Promotion supprimée. Elle reste visible dans l’historique.',
      )
      await refreshOffers()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer la promotion.',
      )
    }
  }

  function productNames(productIds: readonly number[]): string {
    const names = productIds.map(
      (productId) =>
        products.find((product) => product.id === productId)?.name ??
        `Produit n°${productId}`,
    )

    return names.join(', ')
  }

  function offeredProductName(offer: SpecialOffer): string | null {
    if (!offer.productIdOffer) {
      return null
    }

    return (
      products.find((product) => product.id === offer.productIdOffer)?.name ??
      `Produit n°${offer.productIdOffer}`
    )
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>): void {
    setSearch(event.target.value)
    setPage(1)
  }

  const exportColumns: readonly ExportColumn<SpecialOffer>[] = [
    { header: 'Promotion', value: (offer) => offer.label, width: 2 },
    {
      header: 'Produits',
      value: (offer) => productNames(offer.productIds),
      width: 4,
    },
    { header: 'Règle', value: formatPromotionRule, width: 2 },
    {
      header: 'Début',
      value: (offer) => formatDateTime(offer.startDateTime),
      width: 2,
    },
    {
      header: 'Fin',
      value: (offer) => formatDateTime(offer.endDateTime),
      width: 2,
    },
    {
      header: 'Lots jusqu’au',
      value: (offer) => formatDate(offer.limitDate),
      width: 2,
    },
    { header: 'État', value: formatPromotionState, width: 2 },
  ]

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Gestion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Promotions</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <TabularExportButton
            currentRows={offers}
            columns={exportColumns}
            title="Liste des promotions"
            fileNamePrefix="promotions"
            isLoading={isLoading}
            loadAllRows={() =>
              listAllSpecialOffers({
                search,
                validAt: validAt || undefined,
              })
            }
          />
          <button
            type="button"
            onClick={() => setSelectedOffer(null)}
            className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Nouvelle promotion
          </button>
        </div>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? (
        <Alert type="success" message={successMessage} />
      ) : null}

      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Nom de la promotion
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            className="mt-2 block w-full rounded-lg border border-slate-200 px-4 py-3 sm:w-72"
            placeholder="Rechercher par nom"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Valide jusqu'au
          <input
            type="date"
            value={validAt}
            onChange={(event) => {
              setValidAt(event.target.value)
              setPage(1)
            }}
            className="mt-2 block w-full rounded-lg border border-slate-200 px-4 py-3 sm:w-44"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Promotion</th>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Règle</th>
              <th className="px-4 py-3">Validité</th>
              <th className="px-4 py-3">Lots jusqu’au</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Chargement...
                </td>
              </tr>
            ) : offers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Aucune promotion.
                </td>
              </tr>
            ) : (
              offers.map((offer) => (
                <tr
                  key={offer.id}
                  className={
                    offer.deletedAt ? 'bg-slate-50 text-slate-400' : ''
                  }
                >
                  <td className="px-4 py-4 font-bold">{offer.label}</td>
                  <td className="max-w-xs px-4 py-4">
                    <p>{productNames(offer.productIds)}</p>
                    {offeredProductName(offer) ? (
                      <p className="mt-1 text-xs text-teal-700">
                        Offert : {offeredProductName(offer)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">{formatPromotionRule(offer)}</td>
                  <td className="px-4 py-4">
                    {formatDateTime(offer.startDateTime)} →{' '}
                    {formatDateTime(offer.endDateTime)}
                  </td>
                  <td className="px-4 py-4">{formatDate(offer.limitDate)}</td>
                  <td className="px-4 py-4">{formatPromotionState(offer)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={Boolean(offer.deletedAt) || offer.isLocked}
                        onClick={() => setSelectedOffer(offer)}
                        className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Modifier
                      </button>
                      {!offer.deletedAt ? (
                        <button
                          type="button"
                          onClick={() => void handleDelete(offer)}
                          className="rounded-lg px-3 py-2 font-semibold text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 ? (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      ) : null}

      {selectedOffer !== undefined ? (
        <InventoryModal
          title={selectedOffer ? 'Modifier la promotion' : 'Nouvelle promotion'}
          onClose={() => setSelectedOffer(undefined)}
          size="lg"
          errorMessage={errorMessage}
        >
          <SpecialOfferForm
            offer={selectedOffer ?? undefined}
            products={products}
            isSubmitting={isSubmitting}
            onCancel={() => setSelectedOffer(undefined)}
            onSubmit={handleSave}
          />
        </InventoryModal>
      ) : null}
    </section>
  )
}
