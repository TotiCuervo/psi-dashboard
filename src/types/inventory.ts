export type SkuInventory = {
    sku: string
    w10Available: number   // raw (may be negative)
    d02Available: number   // raw (may be negative)
    totalAvailable: number // sum of max(0, each facility)
}

export type DosStatus = 'green' | 'yellow' | 'red' | 'stockout'

export type SkuDos = {
    sku: string
    totalOpenOrders: number
    avgWeeklyDemand: number
    totalAvailable: number
    dosWeeks: number // capped at 999 if infinite
    dosDays: number  // capped at 999 if infinite
    status: DosStatus
}

export type InventoryResult = {
    skuInventory: Record<string, SkuInventory>
    unknownSkus: string[]
}

export type DosThresholds = {
    green: number  // dosDays >= this → green
    yellow: number // dosDays >= this → yellow
    red: number    // dosDays >= this → red
    // below red → stockout
}

export const DEFAULT_DOS_THRESHOLDS: DosThresholds = {
    green: 28,  // 4 weeks
    yellow: 14, // 2 weeks
    red: 7,     // 1 week
}
