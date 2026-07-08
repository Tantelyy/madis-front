import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { ProductCard } from '../features/products/ProductCard'
import { ProductDetails } from '../features/products/ProductDetails'
import { ProductForm } from '../features/products/ProductForm'
import { ProductModal } from '../features/products/ProductModal'
import {
  createProduct,
  createProductFormat,
  createProductMark,
  createProductSpecification,
  createProductType,
  deleteProduct,
  listProductFormats,
  listProductMarks,
  listProducts,
  listProductSpecifications,
  listProductTypes,
  updateProduct,
  type ListProductsParams,
  type PaginatedProducts,
  type Product,
  type ProductFormat,
  type ProductMark,
  type ProductPayload,
  type ProductSpecification,
  type ProductType,
} from '../features/products/productsApi'
import { useListControls } from '../hooks/useListControls'
import {
  createPaginationMeta,
  normalizePaginationMeta,
} from '../utils/paginationMeta'
import { getSortLabel } from '../utils/sortLabel'

const PAGE_SIZE = 12

type ProductModalState =
  | { type: 'details'; product: Product }
  | { type: 'form'; product?: Product }
  | { type: 'delete'; product: Product }
  | null

type SortableProductField = Extract<
  ListProductsParams['sortBy'],
  'name' | 'reference' | 'createdAt' | 'updatedAt'
>

interface SelectOption {
  id: number
  label: string
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [marks, setMarks] = useState<ProductMark[]>([])
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    [],
  )
  const [formats, setFormats] = useState<ProductFormat[]>([])
  const [types, setTypes] = useState<ProductType[]>([])
  const [meta, setMeta] = useState<PaginatedProducts['meta']>(() =>
    createPaginationMeta(PAGE_SIZE),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [modalState, setModalState] = useState<ProductModalState>(null)
  const {
    page,
    setPage,
    search,
    sortBy,
    sortOrder,
    handleSearchChange,
    handlePageChange,
    handleSort,
  } = useListControls<SortableProductField>({
    initialSortBy: 'createdAt',
    onBeforeChange: () => setIsLoading(true),
  })

  const fetchProducts = useCallback((): Promise<PaginatedProducts> => {
    return listProducts({
      page,
      limit: PAGE_SIZE,
      search,
      sortBy,
      order: sortOrder,
    })
  }, [page, search, sortBy, sortOrder])

  function applyProductsResponse(response: PaginatedProducts): void {
    setProducts(response.data)
    setMeta(normalizePaginationMeta(response.meta))
  }

  useEffect(() => {
    let isActive = true

    async function loadProducts(): Promise<void> {
      try {
        const [productsResponse, marksResponse, specificationsResponse, formatsResponse, typesResponse] =
          await Promise.all([
            fetchProducts(),
            listProductMarks(),
            listProductSpecifications(),
            listProductFormats(),
            listProductTypes(),
          ])

        if (!isActive) {
          return
        }

        applyProductsResponse(productsResponse)
        setMarks(marksResponse)
        setSpecifications(specificationsResponse)
        setFormats(formatsResponse)
        setTypes(typesResponse)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les produits.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isActive = false
    }
  }, [fetchProducts])

  async function handleSaveProduct(payload: ProductPayload): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (modalState?.type === 'form' && modalState.product) {
        await updateProduct(modalState.product.id, payload)
        setSuccessMessage('Produit modifié avec succès.')
      } else {
        await createProduct(payload)
        setSuccessMessage('Produit ajouté avec succès.')
      }

      setModalState(null)
      applyProductsResponse(await fetchProducts())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible d’enregistrer le produit.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteProduct(): Promise<void> {
    if (modalState?.type !== 'delete') {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteProduct(modalState.product.id)
      setSuccessMessage('Produit supprimé avec succès.')
      setModalState(null)

      if (products.length === 1 && page > 1) {
        setIsLoading(true)
        setPage(page - 1)
        return
      }

      applyProductsResponse(await fetchProducts())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer le produit.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateType(label: string): Promise<SelectOption> {
    const productType = await createProductType(label)
    setTypes((currentTypes) => [...currentTypes, productType])

    return {
      id: productType.id,
      label: productType.type,
    }
  }

  async function handleCreateMark(label: string): Promise<SelectOption> {
    const mark = await createProductMark(label)
    setMarks((currentMarks) => [...currentMarks, mark])

    return {
      id: mark.id,
      label: mark.name,
    }
  }

  async function handleCreateSpecification(
    label: string,
  ): Promise<SelectOption> {
    const specification = await createProductSpecification(label)
    setSpecifications((currentSpecifications) => [
      ...currentSpecifications,
      specification,
    ])

    return {
      id: specification.id,
      label: specification.specification,
    }
  }

  async function handleCreateFormat(label: string): Promise<SelectOption> {
    const format = await createProductFormat(label)
    setFormats((currentFormats) => [...currentFormats, format])

    return {
      id: format.id,
      label: format.format,
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Gestion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Produits</h1>
        </div>
        <button
          type="button"
          onClick={() => setModalState({ type: 'form' })}
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200"
        >
          Ajouter un produit
        </button>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label
            htmlFor="product-search"
            className="block text-sm font-medium text-slate-700"
          >
            Rechercher un produit
          </label>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Nom, référence, type, marque, spécification ou format"
            className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:w-[44rem]"
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Trier par</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ['name', 'Nom'],
              ['reference', 'Référence'],
              ['createdAt', 'Créé le'],
              ['updatedAt', 'Mis à jour'],
            ].map(([field, label]) => (
              <button
                key={field}
                type="button"
                onClick={() => handleSort(field as SortableProductField)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                {getSortLabel(
                  sortBy,
                  sortOrder,
                  field as SortableProductField,
                  label,
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm font-medium text-slate-500 shadow-sm">
          Chargement des produits...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm font-medium text-slate-500 shadow-sm">
          Aucun produit enregistré pour le moment.
        </div>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDetails={(selectedProduct) =>
                setModalState({ type: 'details', product: selectedProduct })
              }
              onEdit={(selectedProduct) =>
                setModalState({ type: 'form', product: selectedProduct })
              }
              onDelete={(selectedProduct) =>
                setModalState({ type: 'delete', product: selectedProduct })
              }
            />
          ))}
        </div>
      )}

      {meta.totalPages > 1 ? (
        <div className="mt-auto">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : null}

      {modalState?.type === 'details' ? (
        <ProductModal
          title="Détails du produit"
          onClose={() => setModalState(null)}
        >
          <ProductDetails product={modalState.product} />
        </ProductModal>
      ) : null}

      {modalState?.type === 'form' ? (
        <ProductModal
          title={
            modalState.product ? 'Modifier le produit' : 'Ajouter un produit'
          }
          onClose={() => setModalState(null)}
        >
          <ProductForm
            product={modalState.product}
            marks={marks}
            specifications={specifications}
            formats={formats}
            types={types}
            isSubmitting={isSubmitting}
            onCancel={() => setModalState(null)}
            onSubmit={handleSaveProduct}
            onCreateMark={handleCreateMark}
            onCreateSpecification={handleCreateSpecification}
            onCreateFormat={handleCreateFormat}
            onCreateType={handleCreateType}
          />
        </ProductModal>
      ) : null}

      {modalState?.type === 'delete' ? (
        <ProductModal
          title="Confirmer la suppression"
          onClose={() => setModalState(null)}
        >
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              Voulez-vous vraiment supprimer le produit{' '}
              <span className="font-semibold text-slate-950">
                {modalState.product.name}
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
                  void handleDeleteProduct()
                }}
                className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isSubmitting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </ProductModal>
      ) : null}
    </section>
  )
}
