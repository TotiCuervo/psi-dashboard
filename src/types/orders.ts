export type SkuSummary = {
    sku: string
    totalQuantity: number
    nearestWeek: string // ISO date string
    weeklyBreakdown: Record<string, number> // ISO date string → quantity
    customerBreakdown: Record<string, number>
    isKnown: boolean
}

export type ParseResult = {
    skuSummaries: SkuSummary[]
    allWeeks: string[] // sorted ISO date strings
    allCustomers: string[]
    totalQuantity: number
    totalSkus: number
    weeksCount: number
    unknownSkus: string[]
}
