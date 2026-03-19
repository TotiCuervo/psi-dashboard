import type { ParseResult } from '@/types/orders'
import type { InventoryResult, SkuDos, DosStatus, DosThresholds } from '@/types/inventory'
import { DEFAULT_DOS_THRESHOLDS } from '@/types/inventory'

function getStatus(dosDays: number, totalAvailable: number, thresholds: DosThresholds): DosStatus {
    if (totalAvailable === 0) return 'stockout'
    if (dosDays >= thresholds.green) return 'green'
    if (dosDays >= thresholds.yellow) return 'yellow'
    if (dosDays >= thresholds.red) return 'red'
    return 'stockout'
}

export function calculateDos(
    orderResult: ParseResult,
    inventoryResult: InventoryResult,
    thresholds: DosThresholds = DEFAULT_DOS_THRESHOLDS,
): SkuDos[] {
    const { skuSummaries, weeksCount } = orderResult
    const { skuInventory } = inventoryResult

    const dos: SkuDos[] = skuSummaries.map((s) => {
        // Average weekly demand based on open orders spread across demand weeks
        const avgWeeklyDemand = weeksCount > 0 ? s.totalQuantity / weeksCount : 0
        const inventory = skuInventory[s.sku]
        const totalAvailable = inventory?.totalAvailable ?? 0

        let dosWeeks: number
        let dosDays: number

        if (avgWeeklyDemand === 0) {
            // No demand signal — treat as infinite supply
            dosWeeks = totalAvailable > 0 ? 999 : 0
            dosDays = totalAvailable > 0 ? 999 : 0
        } else {
            dosWeeks = totalAvailable / avgWeeklyDemand
            dosDays = dosWeeks * 7
        }

        return {
            sku: s.sku,
            totalOpenOrders: s.totalQuantity,
            avgWeeklyDemand,
            totalAvailable,
            dosWeeks: Math.min(dosWeeks, 999),
            dosDays: Math.min(dosDays, 999),
            status: getStatus(Math.min(dosDays, 999), totalAvailable, thresholds),
        }
    })

    // Sort: stockout first, then red, yellow, green — within each tier sort by dosDays ascending
    const tierOrder: Record<DosStatus, number> = { stockout: 0, red: 1, yellow: 2, green: 3 }
    return dos.sort((a, b) => {
        const tierDiff = tierOrder[a.status] - tierOrder[b.status]
        if (tierDiff !== 0) return tierDiff
        return a.dosDays - b.dosDays
    })
}
