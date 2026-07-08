import { formatDateTime, formatUser } from '../../utils/displayFormatters'
import { formatMovementType, formatPrice } from './inventoryFormatters'
import type { InventoryMovement } from './inventoriesApi'

interface InventoryMovementsTableProps {
  movements: InventoryMovement[]
  isLoading: boolean
}

export function InventoryMovementsTable({
  movements,
  isLoading,
}: InventoryMovementsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[62rem] divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <Header label="Date" />
              <Header label="Type" />
              <Header label="Produit" />
              <Header label="Entrée" />
              <Header label="Sortie" />
              <Header label="Prix achat" />
              <Header label="Prix vente" />
              <Header label="Prix gros" />
              <Header label="Acteur" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <EmptyRow message="Chargement de l'historique..." />
            ) : movements.length === 0 ? (
              <EmptyRow message="Aucun mouvement de stock." />
            ) : (
              movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-teal-50/60">
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatDateTime(movement.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                    {formatMovementType(movement.type)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {movement.inventory?.product?.name ??
                      `Stock #${movement.inventoryId}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-teal-700">
                    {movement.incomingQuantity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-red-700">
                    {movement.outgoingQuantity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatPrice(movement.purchasePrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatPrice(movement.salePrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatPrice(movement.wholesalePrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatUser(movement.actor)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Header({ label }: { label: string }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
    </th>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td
        colSpan={9}
        className="px-4 py-10 text-center text-sm font-medium text-slate-500"
      >
        {message}
      </td>
    </tr>
  )
}
