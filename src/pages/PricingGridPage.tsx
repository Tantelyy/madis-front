import { useEffect, useMemo, useState } from 'react'
import { Alert } from '../components/Alert'
import {
  getActivePricingGrid,
  type PricingGrid,
  type PricingRule,
} from '../features/pricing/pricingApi'

function formatDate(value: string | null): string {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

function formatDecimal(value: string): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

function formatPercent(value: string): string {
  return `${formatDecimal(value)} %`
}

export function PricingGridPage() {
  const [pricingGrid, setPricingGrid] = useState<PricingGrid | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    let isActive = true

    async function loadPricingGrid(): Promise<void> {
      try {
        const response = await getActivePricingGrid()

        if (!isActive) {
          return
        }

        setPricingGrid(response)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de charger la marge règlementaire.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadPricingGrid()

    return () => {
      isActive = false
    }
  }, [])

  const pricingRules = useMemo<readonly PricingRule[]>(
    () => pricingGrid?.pricingRules ?? [],
    [pricingGrid],
  )

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Tarification
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Marge règlementaire
          </h1>
        </div>

        {pricingGrid ? (
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Statut
              </p>
              <p className="mt-1 font-semibold text-teal-700">
                {pricingGrid.status}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Début
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(pricingGrid.effectiveFrom)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Fin
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(pricingGrid.effectiveTo)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm font-medium text-slate-500 shadow-sm">
          Chargement de la marge règlementaire...
        </div>
      ) : pricingRules.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm font-medium text-slate-500 shadow-sm">
          Aucune règle de marge règlementaire enregistrée.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[72rem] table-fixed border-collapse text-sm xl:w-full">
              <colgroup>
                <col className="w-36" />
                <col className="w-36" />
                <col className="w-40" />
                <col className="w-40" />
                <col className="w-40" />
                <col className="w-40" />
                <col className="w-40" />
                <col className="w-40" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Prix min
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Prix max
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Marge détail
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Marge en gros
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Moyenne détail
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Moyenne en gros
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Prix détail
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Prix en gros
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pricingRules.map((pricingRule) => {
                  const retailPrice =
                    pricingRule.maxPurchasePrice +
                    Number(pricingRule.retailAverage)
                  const wholesalePrice =
                    pricingRule.maxPurchasePrice +
                    Number(pricingRule.wholesaleAverage)

                  return (
                    <tr
                      key={pricingRule.id}
                      className="transition hover:bg-teal-50/60"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {formatPrice(pricingRule.minPurchasePrice)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {formatPrice(pricingRule.maxPurchasePrice)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatPercent(pricingRule.retailMarginPercent)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatPercent(pricingRule.wholesaleMarginPercent)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDecimal(pricingRule.retailAverage)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDecimal(pricingRule.wholesaleAverage)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {formatPrice(retailPrice)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {formatPrice(wholesalePrice)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
