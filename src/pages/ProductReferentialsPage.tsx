import { useCallback, useEffect, useState } from 'react'
import {
  ReferentialPanel,
} from '../features/products/ReferentialPanel'
import {
  createProductFormat,
  createProductMark,
  createProductSpecification,
  createProductType,
  deleteProductFormat,
  deleteProductMark,
  deleteProductSpecification,
  deleteProductType,
  listProductFormats,
  listProductMarks,
  listProductSpecifications,
  listProductTypes,
  updateProductFormat,
  updateProductMark,
  updateProductSpecification,
  updateProductType,
  type ProductFormat,
  type ProductMark,
  type ProductSpecification,
  type ProductType,
} from '../features/products/productsApi'

type TabKey = 'types' | 'marks' | 'formats' | 'specifications'

interface ReferentialTab {
  key: TabKey
  label: string
}

const TABS: readonly ReferentialTab[] = [
  { key: 'types', label: 'Types' },
  { key: 'marks', label: 'Marques' },
  { key: 'formats', label: 'Formats' },
  { key: 'specifications', label: 'Spécifications' },
]

export function ProductReferentialsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('types')
  const [types, setTypes] = useState<ProductType[]>([])
  const [marks, setMarks] = useState<ProductMark[]>([])
  const [formats, setFormats] = useState<ProductFormat[]>([])
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const clearMessages = useCallback((): void => {
    setErrorMessage('')
    setSuccessMessage('')
  }, [])

  const loadReferentials = useCallback(async (): Promise<void> => {
    const [typesResponse, marksResponse, formatsResponse, specificationsResponse] =
      await Promise.all([
        listProductTypes(),
        listProductMarks(),
        listProductFormats(),
        listProductSpecifications(),
      ])

    setTypes(typesResponse)
    setMarks(marksResponse)
    setFormats(formatsResponse)
    setSpecifications(specificationsResponse)
  }, [])

  useEffect(() => {
    let isActive = true

    async function load(): Promise<void> {
      try {
        await loadReferentials()
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger les référentiels produits.',
          )
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isActive = false
    }
  }, [loadReferentials])

  async function runMutation(
    action: () => Promise<void>,
    successMessageValue: string,
  ): Promise<void> {
    setIsSubmitting(true)
    clearMessages()

    try {
      await action()
      await loadReferentials()
      setSuccessMessage(successMessageValue)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Opération impossible.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Gestion
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Référentiels produits
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              clearMessages()
              setActiveTab(tab.key)
            }}
            className={`rounded-t-lg px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'types' ? (
        <ReferentialPanel
          title="Types"
          fieldLabel="Type"
          createButtonLabel="Ajouter un type"
          placeholder="Type de produit"
          items={types}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          getLabel={(item) => item.type}
          onClearMessages={clearMessages}
          onCreate={(value) =>
            runMutation(
              async () => {
                await createProductType(value)
              },
              'Type ajouté avec succès.',
            )
          }
          onUpdate={(item, value) =>
            runMutation(
              async () => {
                await updateProductType(item.id, value)
              },
              'Type modifié avec succès.',
            )
          }
          onDelete={(item) =>
            runMutation(
              async () => {
                await deleteProductType(item.id)
              },
              'Type supprimé avec succès.',
            )
          }
        />
      ) : null}

      {activeTab === 'marks' ? (
        <ReferentialPanel
          title="Marques"
          fieldLabel="Marque"
          createButtonLabel="Ajouter une marque"
          placeholder="Marque du produit"
          items={marks}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          getLabel={(item) => item.name}
          onClearMessages={clearMessages}
          onCreate={(value) =>
            runMutation(
              async () => {
                await createProductMark(value)
              },
              'Marque ajoutée avec succès.',
            )
          }
          onUpdate={(item, value) =>
            runMutation(
              async () => {
                await updateProductMark(item.id, value)
              },
              'Marque modifiée avec succès.',
            )
          }
          onDelete={(item) =>
            runMutation(
              async () => {
                await deleteProductMark(item.id)
              },
              'Marque supprimée avec succès.',
            )
          }
        />
      ) : null}

      {activeTab === 'formats' ? (
        <ReferentialPanel
          title="Formats"
          fieldLabel="Format"
          createButtonLabel="Ajouter un format"
          placeholder="Format du produit"
          items={formats}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          getLabel={(item) => item.format}
          onClearMessages={clearMessages}
          onCreate={(value) =>
            runMutation(
              async () => {
                await createProductFormat(value)
              },
              'Format ajouté avec succès.',
            )
          }
          onUpdate={(item, value) =>
            runMutation(
              async () => {
                await updateProductFormat(item.id, value)
              },
              'Format modifié avec succès.',
            )
          }
          onDelete={(item) =>
            runMutation(
              async () => {
                await deleteProductFormat(item.id)
              },
              'Format supprimé avec succès.',
            )
          }
        />
      ) : null}

      {activeTab === 'specifications' ? (
        <ReferentialPanel
          title="Spécifications"
          fieldLabel="Spécification"
          createButtonLabel="Ajouter une spécification"
          placeholder="Spécification du produit"
          items={specifications}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          getLabel={(item) => item.specification}
          onClearMessages={clearMessages}
          onCreate={(value) =>
            runMutation(
              async () => {
                await createProductSpecification(value)
              },
              'Spécification ajoutée avec succès.',
            )
          }
          onUpdate={(item, value) =>
            runMutation(
              async () => {
                await updateProductSpecification(item.id, value)
              },
              'Spécification modifiée avec succès.',
            )
          }
          onDelete={(item) =>
            runMutation(
              async () => {
                await deleteProductSpecification(item.id)
              },
              'Spécification supprimée avec succès.',
            )
          }
        />
      ) : null}
    </section>
  )
}
