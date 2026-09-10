import { useEffect, useState } from 'react'
import { Alert } from '../../components/Alert'
import { Pagination } from '../../components/Pagination'
import { formatQuantity } from '../../utils/displayFormatters'
import { listProductTypes, type ProductType } from '../products/productsApi'
import { ProductForecastModal } from './ProductForecastModal'
import {
  getSalesStockAnalysis,
  type SalesStockAnalysis,
  type SalesStockItem,
} from './dashboardApi'
import {
  createPresetPeriod,
  formatDashboardPeriod,
  type DashboardFilter,
  type DashboardPeriod,
} from './dashboardDateRange'
import { DashboardPeriodFilter } from './DashboardPeriodFilter'

const PAGE_SIZE = 10
const STOCK_DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function SalesStockAnalysisSection() {
  const [selectedProduct, setSelectedProduct] = useState<SalesStockItem | null>(
    null,
  )

  return (
    <section className="space-y-5 border-t border-slate-200 pt-7">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Analyse croisée des produits vendus et du stock
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Comparez les quantités vendues sur une période au stock disponible aujourd’hui.
        </p>
      </div>
      <CurrentSalesStockAnalysis onForecastRequest={setSelectedProduct} />
      {selectedProduct ? (
        <ProductForecastModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </section>
  )
}

function CurrentSalesStockAnalysis({
  onForecastRequest,
}: {
  onForecastRequest: (product: SalesStockItem) => void
}) {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>('MONTH')
  const [period, setPeriod] = useState<DashboardPeriod>(() =>
    createPresetPeriod('MONTH'),
  )
  const [productTypeId, setProductTypeId] = useState<number | null>(null)
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [page, setPage] = useState<number>(1)
  const [analysis, setAnalysis] = useState<SalesStockAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState<string>('')
  const [productTypesErrorMessage, setProductTypesErrorMessage] =
    useState<string>('')

  useEffect(() => {
    let isActive = true
    void listProductTypes()
      .then((types) => {
        if (isActive) setProductTypes(types)
      })
      .catch((error: unknown) => {
        if (isActive) {
          setProductTypesErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger les types de produit.',
          )
        }
      })
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true
    void getSalesStockAnalysis(
      {
        period,
        page,
        limit: PAGE_SIZE,
        ...(productTypeId === null ? {} : { productTypeId }),
      },
      controller.signal,
    )
      .then((response) => {
        if (isActive) setAnalysis(response)
      })
      .catch((error: unknown) => {
        if (
          isActive &&
          !(error instanceof DOMException && error.name === 'AbortError')
        ) {
          setAnalysisErrorMessage(
            error instanceof Error
              ? error.message
              : "Impossible de charger l'analyse des ventes et du stock.",
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })
    return () => {
      isActive = false
      controller.abort()
    }
  }, [page, period, productTypeId])

  function prepareAnalysisChange(): void {
    setIsLoading(true)
    setAnalysisErrorMessage('')
    setAnalysis(null)
  }

  function changePeriod(
    filter: DashboardFilter,
    nextPeriod: DashboardPeriod,
  ): void {
    prepareAnalysisChange()
    setActiveFilter(filter)
    setPeriod(nextPeriod)
    setPage(1)
  }

  function changeProductType(value: string): void {
    prepareAnalysisChange()
    setProductTypeId(value ? Number(value) : null)
    setPage(1)
  }

  function changePage(nextPage: number): void {
    prepareAnalysisChange()
    setPage(nextPage)
  }

  return (
    <div className="space-y-5">
      <DashboardPeriodFilter
        activeFilter={activeFilter}
        period={period}
        onChange={changePeriod}
        ariaLabel="Filtrer la période de l'analyse des ventes et du stock"
      />
      <div className="w-fit max-w-full">
        <label
          htmlFor="sales-stock-product-type"
          className="block text-sm font-medium text-slate-700"
        >
          Type de produit
        </label>
        <div className="relative mt-2 inline-block max-w-full">
          <select
            id="sales-stock-product-type"
            value={productTypeId ?? ''}
            onChange={(event) => changeProductType(event.target.value)}
            className="block w-auto min-w-40 max-w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-11 text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          >
            <option value="">Tous les types</option>
            {productTypes.map((productType) => (
              <option key={productType.id} value={productType.id}>
                {productType.type}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          >
            <path d="m6 8 4 4 4-4" />
          </svg>
        </div>
      </div>
      {productTypesErrorMessage ? (
        <Alert type="error" message={productTypesErrorMessage} />
      ) : null}
      {analysisErrorMessage ? (
        <Alert type="error" message={analysisErrorMessage} />
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <AnalysisHeader
          activeFilter={activeFilter}
          period={period}
          analysis={analysis}
          isLoading={isLoading}
        />
        <SalesStockTable
          analysis={analysis}
          isLoading={isLoading}
          onForecastRequest={onForecastRequest}
        />
      </div>
      {analysis && analysis.meta.totalPages > 1 ? (
        <Pagination
          currentPage={analysis.meta.page}
          totalPages={analysis.meta.totalPages}
          onPageChange={changePage}
        />
      ) : null}
    </div>
  )
}

function AnalysisHeader({
  activeFilter,
  period,
  analysis,
  isLoading,
}: {
  activeFilter: DashboardFilter
  period: DashboardPeriod
  analysis: SalesStockAnalysis | null
  isLoading: boolean
}) {
  const stockDate = analysis
    ? STOCK_DATE_FORMATTER.format(new Date(analysis.stockAsOf))
    : null
  const productCount = analysis?.meta.total ?? 0
  return (
    <div className="flex flex-col gap-2 px-5 pb-3 pt-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
      <div>
        <h3 className="text-base font-bold text-slate-950">
          {formatDashboardPeriod(period, activeFilter)}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Les ventes suivent la période choisie
          {stockDate ? ` · le stock est celui du ${stockDate}` : ''}
        </p>
      </div>
      <p className="text-sm text-slate-500">
        {isLoading && !analysis
          ? 'Chargement...'
          : `${formatQuantity(productCount)} produit${productCount > 1 ? 's' : ''}`}
      </p>
    </div>
  )
}

function SalesStockTable({
  analysis,
  isLoading,
  onForecastRequest,
}: {
  analysis: SalesStockAnalysis | null
  isLoading: boolean
  onForecastRequest: (product: SalesStockItem) => void
}) {
  return (
    <div className="overflow-x-auto px-5 pb-5 sm:px-6">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-700">
            <th className="py-3 pr-4 font-semibold">Produit</th>
            <th className="px-4 py-3 font-semibold">Type de produit</th>
            <th className="px-4 py-3 text-right font-semibold">Vendus</th>
            <th className="px-4 py-3 text-right font-semibold">Stock actuel</th>
            <th className="px-4 py-3 font-semibold">Comparaison</th>
            <th className="py-3 pl-4 font-semibold">Prévision</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && !analysis ? (
            <EmptyRow message="Chargement de l’analyse..." />
          ) : !analysis || analysis.data.length === 0 ? (
            <EmptyRow message="Aucun produit ne correspond aux filtres." />
          ) : (
            analysis.data.map((item) => (
              <SalesStockRow
                key={item.productId}
                item={item}
                maximumQuantity={analysis.maximumQuantity}
                onForecastRequest={onForecastRequest}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function SalesStockRow({
  item,
  maximumQuantity,
  onForecastRequest,
}: {
  item: SalesStockItem
  maximumQuantity: number
  onForecastRequest: (product: SalesStockItem) => void
}) {
  return (
    <tr className="border-b border-slate-100 text-slate-700 last:border-0">
      <td className="py-3 pr-4 font-semibold text-slate-950">
        {item.productName}
      </td>
      <td className="px-4 py-3">{item.productType}</td>
      <td className="px-4 py-3 text-right tabular-nums">
        {formatQuantity(item.soldQuantity)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {formatQuantity(item.currentStock)}
      </td>
      <td className="px-4 py-3">
        <QuantityBar label="Vendus" value={item.soldQuantity} maximum={maximumQuantity} colorClassName="bg-blue-500" />
        <QuantityBar label="Stock" value={item.currentStock} maximum={maximumQuantity} colorClassName="bg-emerald-500" />
      </td>
      <td className="py-3 pl-4">
        <button
          type="button"
          onClick={() => onForecastRequest(item)}
          className="rounded-lg border border-teal-600 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          Voir la prévision
        </button>
      </td>
    </tr>
  )
}

function QuantityBar({
  label,
  value,
  maximum,
  colorClassName,
}: {
  label: string
  value: number
  maximum: number
  colorClassName: string
}) {
  const width = value === 0 ? 0 : Math.max(2, (value / maximum) * 100)
  return (
    <div className="flex min-w-64 items-center gap-3 py-0.5">
      <span className="w-12 shrink-0 text-xs text-slate-400">{label}</span>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
        role="meter"
        aria-label={`${label} : ${formatQuantity(value)}`}
        aria-valuemin={0}
        aria-valuemax={maximum}
        aria-valuenow={value}
      >
        <div className={`h-full rounded-full ${colorClassName}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={6} className="py-10 text-center text-slate-500">
        {message}
      </td>
    </tr>
  )
}
