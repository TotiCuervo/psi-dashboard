import * as XLSX from 'xlsx'
import { isKnownSku } from './skus'
import type { ParseResult, SkuSummary } from '@/types/orders'

const TAB_NAME = 'Order Data'

const REQUIRED_COLUMNS = ['Item', 'Status', 'QuantityOrdered', 'Start of the Ship Week', 'Customer'] as const

function toIsoDate(value: unknown): string | null {
    if (!value) return null
    // SheetJS may return a JS Date or a serial number
    if (value instanceof Date) {
        return value.toISOString().split('T')[0]
    }
    if (typeof value === 'number') {
        const date = XLSX.SSF.parse_date_code(value)
        if (!date) return null
        const y = date.y
        const m = String(date.m).padStart(2, '0')
        const d = String(date.d).padStart(2, '0')
        return `${y}-${m}-${d}`
    }
    if (typeof value === 'string' && value.trim()) {
        const d = new Date(value)
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
    }
    return null
}

export function parseOrders(data: ArrayBuffer): ParseResult {
    const workbook = XLSX.read(new Uint8Array(data), { type: 'array', cellDates: true })

    if (!workbook.SheetNames.includes(TAB_NAME)) {
        throw new Error(`Could not find a tab named '${TAB_NAME}' in the uploaded file.`)
    }

    const sheet = workbook.Sheets[TAB_NAME]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null })

    if (rows.length < 2) {
        throw new Error(`The '${TAB_NAME}' tab appears to be empty.`)
    }

    const headers = (rows[0] as unknown[]).map((h) => (h != null ? String(h).trim() : ''))

    // Validate required columns
    const colIndex: Record<string, number> = {}
    for (const col of REQUIRED_COLUMNS) {
        const idx = headers.indexOf(col)
        if (idx === -1) {
            throw new Error(`Required column '${col}' was not found in the Order Data tab.`)
        }
        colIndex[col] = idx
    }

    // Process rows
    const skuMap = new Map<string, SkuSummary>()
    const weekSet = new Set<string>()
    const customerSet = new Set<string>()
    const unknownSkuSet = new Set<string>()

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i] as unknown[]
        const status = row[colIndex['Status']]
        if (!status || String(status).trim() !== 'Open') continue

        const sku = row[colIndex['Item']]
        const qty = row[colIndex['QuantityOrdered']]
        const weekRaw = row[colIndex['Start of the Ship Week']]
        const customer = row[colIndex['Customer']]

        if (!sku || qty == null) continue

        const skuStr = String(sku).trim()
        const qtyNum = typeof qty === 'number' ? qty : parseFloat(String(qty)) || 0
        const weekStr = toIsoDate(weekRaw)
        const customerStr = customer ? String(customer).trim() : 'Unknown'

        if (!isKnownSku(skuStr)) unknownSkuSet.add(skuStr)
        if (weekStr) weekSet.add(weekStr)
        customerSet.add(customerStr)

        if (!skuMap.has(skuStr)) {
            skuMap.set(skuStr, {
                sku: skuStr,
                totalQuantity: 0,
                nearestWeek: weekStr ?? '',
                weeklyBreakdown: {},
                customerBreakdown: {},
                isKnown: isKnownSku(skuStr),
            })
        }

        const summary = skuMap.get(skuStr)!
        summary.totalQuantity += qtyNum

        if (weekStr) {
            summary.weeklyBreakdown[weekStr] = (summary.weeklyBreakdown[weekStr] ?? 0) + qtyNum
            if (!summary.nearestWeek || weekStr < summary.nearestWeek) {
                summary.nearestWeek = weekStr
            }
        }

        summary.customerBreakdown[customerStr] = (summary.customerBreakdown[customerStr] ?? 0) + qtyNum
    }

    const allWeeks = Array.from(weekSet).sort()
    const allCustomers = Array.from(customerSet).sort()
    const skuSummaries = Array.from(skuMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)

    return {
        skuSummaries,
        allWeeks,
        allCustomers,
        totalQuantity: skuSummaries.reduce((sum, s) => sum + s.totalQuantity, 0),
        totalSkus: skuSummaries.length,
        weeksCount: allWeeks.length,
        unknownSkus: Array.from(unknownSkuSet),
    }
}
