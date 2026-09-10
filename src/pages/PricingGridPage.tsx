import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from '../components/Alert'
import { PricingGridTable } from '../features/pricing/PricingGridTable'
import { formatDate } from '../features/pricing/pricingFormatters'
import {
  getActivePricingGrid,
  updatePricingGrid,
  type PricingGrid,
  type PricingRule,
} from '../features/pricing/pricingApi'
import {
  buildEditablePricingRules,
  buildPricingRulePayload,
  validatePricingRules,
  type EditablePricingRule,
  type EditablePricingRuleField,
} from '../features/pricing/pricingRules'

export function PricingGridPage() {
  const [pricingGrid, setPricingGrid] = useState<PricingGrid | null>(null)
  const [editablePricingRules, setEditablePricingRules] = useState<
    EditablePricingRule[]
  >([])
  const [nextEditableRuleId, setNextEditableRuleId] = useState<number>(1)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    let isActive = true

    async function loadPricingGrid(): Promise<void> {
      try {
        const response = await getActivePricingGrid()

        if (isActive) {
          setPricingGrid(response)
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger la marge règlementaire.',
          )
        }
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
  const validationMessage = useMemo(
    () => validatePricingRules(editablePricingRules),
    [editablePricingRules],
  )
  const canSave = isEditing && !validationMessage && !isSaving

  function handleStartEditing(): void {
    setEditablePricingRules(buildEditablePricingRules(pricingRules))
    setNextEditableRuleId(1)
    setSuccessMessage('')
    setErrorMessage('')
    setIsEditing(true)
  }

  function handleCancelEditing(): void {
    setEditablePricingRules([])
    setIsEditing(false)
    setErrorMessage('')
  }

  const handleEditableRuleChange = useCallback((
    key: string,
    field: EditablePricingRuleField,
    value: string,
  ): void => {
    setEditablePricingRules((currentPricingRules) =>
      currentPricingRules.map((pricingRule) =>
        pricingRule.key === key
          ? { ...pricingRule, [field]: value }
          : pricingRule,
      ),
    )
  }, [])

  const handleAddRule = useCallback((afterIndex: number): void => {
    setEditablePricingRules((currentPricingRules) => {
      const selectedRule = currentPricingRules[afterIndex]

      if (!selectedRule) {
        return currentPricingRules
      }

      const nextPricingRules = [...currentPricingRules]

      nextPricingRules.splice(afterIndex + 1, 0, {
        key: `new-${nextEditableRuleId}`,
        minPurchasePrice: selectedRule.minPurchasePrice,
        maxPurchasePrice: selectedRule.maxPurchasePrice,
        retailMarginPercent: selectedRule.retailMarginPercent,
        wholesaleMarginPercent: selectedRule.wholesaleMarginPercent,
      })

      return nextPricingRules
    })
    setNextEditableRuleId((currentId) => currentId + 1)
  }, [nextEditableRuleId])

  const handleDeleteRule = useCallback((key: string): void => {
    setEditablePricingRules((currentPricingRules) =>
      currentPricingRules.filter((pricingRule) => pricingRule.key !== key),
    )
  }, [])

  async function handleSavePricingGrid(): Promise<void> {
    if (!canSave) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await updatePricingGrid({
        pricingRules: buildPricingRulePayload(editablePricingRules),
      })

      setPricingGrid(response)
      setEditablePricingRules([])
      setIsEditing(false)
      setSuccessMessage('Marge règlementaire mise à jour avec succès.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de mettre à jour la marge règlementaire.',
      )
    } finally {
      setIsSaving(false)
    }
  }

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
            <PricingGridInfo label="Statut" value={pricingGrid.status} />
            <PricingGridInfo
              label="Début"
              value={formatDate(pricingGrid.effectiveFrom)}
            />
            <PricingGridInfo
              label="Fin"
              value={formatDate(pricingGrid.effectiveTo)}
            />
          </div>
        ) : null}
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      {!isLoading && pricingRules.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={isSaving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={() => {
                  void handleSavePricingGrid()
                }}
                className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? 'Validation...' : 'Valider la modification'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartEditing}
              className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200"
            >
              Modifier la marge
            </button>
          )}
        </div>
      ) : null}

      {isEditing && validationMessage ? (
        <Alert type="error" message={validationMessage} />
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm font-medium text-slate-500 shadow-sm">
          Chargement de la marge règlementaire...
        </div>
      ) : pricingRules.length === 0 && !isEditing ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm font-medium text-slate-500 shadow-sm">
          Aucune règle de marge règlementaire enregistrée.
        </div>
      ) : (
        <PricingGridTable
          pricingRules={pricingRules}
          editablePricingRules={editablePricingRules}
          isEditing={isEditing}
          onEditableRuleChange={handleEditableRuleChange}
          onAddRule={handleAddRule}
          onDeleteRule={handleDeleteRule}
        />
      )}
    </section>
  )
}

interface PricingGridInfoProps {
  label: string
  value: string
}

function PricingGridInfo({ label, value }: PricingGridInfoProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}
