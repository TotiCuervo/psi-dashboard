import { isKnownSku } from './skus'
import type { InventoryResult, SkuInventory } from '@/types/inventory'

/**
 * Minimal RFC-4180-compatible CSV line parser.
 * Handles double-quoted fields (RJW export wraps all values in quotes).
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
            // doubled quote inside a quoted field → literal quote
            if (inQuotes && line[i + 1] === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += ch
        }
    }
    result.push(current.trim())
    return result
}

function toFloat(raw: string | undefined): number {
    if (!raw) return 0
    const n = parseFloat(raw.replace(/[^0-9.\-]/g, ''))
    return isNaN(n) ? 0 : n
}

export function parseInventory(csvText: string): InventoryResult {
    const lines = csvText
        .split('\n')
        .map(l => l.replace(/\r$/, ''))
        .filter(l => l.trim())

    if (lines.length < 2) {
        throw new Error('Inventory file appears to be empty.')
    }

    const headers = parseCSVLine(lines[0])

    function col(name: string): number {
        const idx = headers.indexOf(name)
        if (idx === -1) throw new Error(`Required column '${name}' not found in inventory file.`)
        return idx
    }

    const skuIdx = col('SKU')
    const facilityIdx = col('Facility')
    const availableIdx = col('Available')

    const skuMap = new Map<string, SkuInventory>()
    const unknownSkuSet = new Set<string>()

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i])
        const sku = cols[skuIdx]
        const facility = cols[facilityIdx]
        const available = toFloat(cols[availableIdx])

        if (!sku) continue

        if (!isKnownSku(sku)) {
            unknownSkuSet.add(sku)
            continue
        }

        if (!skuMap.has(sku)) {
            skuMap.set(sku, { sku, w10Available: 0, d02Available: 0, totalAvailable: 0 })
        }

        const entry = skuMap.get(sku)!

        if (facility === 'W10') {
            entry.w10Available = available
            entry.totalAvailable += Math.max(0, available)
        } else if (facility === 'D02') {
            entry.d02Available = available
            entry.totalAvailable += Math.max(0, available)
        }
    }

    return {
        skuInventory: Object.fromEntries(skuMap),
        unknownSkus: Array.from(unknownSkuSet),
    }
}
