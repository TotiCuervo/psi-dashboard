'use client'

import { useState } from 'react'
import { FileUploadZone } from '@/components/FileUploadZone'
import { SummaryScorecard } from '@/components/panels/SummaryScorecard'
import { OpenOrdersBySkuPanel } from '@/components/panels/OpenOrdersBySkuPanel'
import { WeeklyDemandCalendar } from '@/components/panels/WeeklyDemandCalendar'
import { CustomerBreakdownPanel } from '@/components/panels/CustomerBreakdownPanel'
import { DosPanel } from '@/components/panels/DosPanel'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { calculateDos } from '@/lib/calculateDos'
import type { ParseResult } from '@/types/orders'
import type { InventoryResult, SkuDos } from '@/types/inventory'

export default function DashboardPage() {
    // Orders (Excel) state
    const [orderFile, setOrderFile] = useState<File | null>(null)
    const [result, setResult] = useState<ParseResult | null>(null)

    // Inventory (CSV) state
    const [inventoryFile, setInventoryFile] = useState<File | null>(null)
    const [inventoryResult, setInventoryResult] = useState<InventoryResult | null>(null)

    // DOS — computed from order + inventory results
    const [dosSummaries, setDosSummaries] = useState<SkuDos[] | null>(null)

    // Shared UI state
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    function handleOrderFileSelected(f: File) {
        setOrderFile(f)
        setResult(null)
        setInventoryResult(null)
        setDosSummaries(null)
        setError(null)
    }

    function handleInventoryFileSelected(f: File) {
        setInventoryFile(f)
        setInventoryResult(null)
        setDosSummaries(null)
        setError(null)
    }

    async function handleProcess() {
        if (!orderFile) return
        setLoading(true)
        setError(null)
        setResult(null)
        setInventoryResult(null)
        setDosSummaries(null)

        try {
            // Always process the orders file
            const orderForm = new FormData()
            orderForm.append('file', orderFile)
            const orderRes = await fetch('/api/parse', { method: 'POST', body: orderForm })
            const orderData = await orderRes.json()

            if (!orderRes.ok) {
                setError(orderData.error ?? 'Failed to process the orders file.')
                return
            }

            const parsedOrders = orderData as ParseResult
            setResult(parsedOrders)

            // Optionally process the inventory file if provided
            if (inventoryFile) {
                const invForm = new FormData()
                invForm.append('file', inventoryFile)
                const invRes = await fetch('/api/parse-inventory', { method: 'POST', body: invForm })
                const invData = await invRes.json()

                if (!invRes.ok) {
                    // Surface inventory error but still show order panels
                    setError(`Inventory file error: ${invData.error ?? 'Unknown error'}`)
                } else {
                    const parsedInventory = invData as InventoryResult
                    setInventoryResult(parsedInventory)
                    setDosSummaries(calculateDos(parsedOrders, parsedInventory))
                }
            }
        } catch {
            setError('Failed to process the file. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function handleNewFile() {
        setOrderFile(null)
        setInventoryFile(null)
        setResult(null)
        setInventoryResult(null)
        setDosSummaries(null)
        setError(null)
    }

    const isUploading = !result && !loading
    const unknownInventorySkus = inventoryResult?.unknownSkus ?? []

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Sticky top bar */}
            <header className="sticky top-0 z-20 bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold tracking-tight">PSI Dashboard</span>
                        {result && orderFile && (
                            <span className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5 font-mono truncate max-w-[240px]">
                                {orderFile.name}
                            </span>
                        )}
                        {result && inventoryFile && inventoryResult && (
                            <span className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5 font-mono truncate max-w-[240px]">
                                {inventoryFile.name}
                            </span>
                        )}
                    </div>
                    {result && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNewFile}
                            data-testid="header__new-file-btn"
                            className="text-xs h-7"
                        >
                            Upload new file
                        </Button>
                    )}
                </div>
            </header>

            <main className="flex-1">
                {/* Upload screen */}
                {isUploading && (
                    <div className="max-w-7xl mx-auto px-6 py-16 flex justify-center">
                        <div className="w-full max-w-xl flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight">Open Order Demand</h1>
                                <p className="text-muted-foreground">
                                    Upload your master Excel file to replace the manual pivot table refresh
                                </p>
                            </div>

                            {/* Orders upload — required */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">Orders</p>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">required</span>
                                </div>
                                <FileUploadZone
                                    onFileSelected={handleOrderFileSelected}
                                    fileName={orderFile?.name}
                                    accept=".xlsx"
                                    label="Drop your master Excel file here"
                                    hint=".xlsx only · click to browse"
                                    testId="orders-upload"
                                />
                            </div>

                            {/* Inventory upload — optional */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">Inventory</p>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">optional · enables DOS</span>
                                </div>
                                <FileUploadZone
                                    onFileSelected={handleInventoryFileSelected}
                                    fileName={inventoryFile?.name}
                                    accept=".csv"
                                    label="Drop the RJW inventory export here"
                                    hint=".csv only · click to browse"
                                    testId="inventory-upload"
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive" data-testid="upload__error">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                onClick={handleProcess}
                                disabled={!orderFile}
                                size="lg"
                                className="self-end px-8"
                                data-testid="upload__process-btn"
                            >
                                Execute
                            </Button>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6" data-testid="loading-state">
                        <div className="grid grid-cols-3 gap-4">
                            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                        </div>
                        <Skeleton className="h-72 rounded-xl" />
                        <Skeleton className="h-72 rounded-xl" />
                        <Skeleton className="h-72 rounded-xl" />
                        {inventoryFile && <Skeleton className="h-72 rounded-xl" />}
                    </div>
                )}

                {/* Dashboard */}
                {result && !loading && (
                    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
                        {/* Order warnings */}
                        {result.unknownSkus.length > 0 && (
                            <Alert data-testid="upload__unknown-skus">
                                <AlertDescription>
                                    <span className="font-medium">Unrecognized SKUs in orders:</span>{' '}
                                    {result.unknownSkus.join(', ')} — not in the master SKU list and excluded.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Inventory warnings */}
                        {unknownInventorySkus.length > 0 && (
                            <Alert data-testid="inventory__unknown-skus">
                                <AlertDescription>
                                    <span className="font-medium">Unrecognized SKUs in inventory:</span>{' '}
                                    {unknownInventorySkus.join(', ')} — excluded from DOS calculation.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Non-blocking inventory error (orders still show) */}
                        {error && result && (
                            <Alert variant="destructive" data-testid="inventory__error">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <SummaryScorecard result={result} />
                        <OpenOrdersBySkuPanel result={result} />
                        <WeeklyDemandCalendar result={result} />
                        <CustomerBreakdownPanel result={result} />

                        {/* DOS panel — only when inventory data is loaded */}
                        {dosSummaries && dosSummaries.length > 0 && (
                            <DosPanel dosSummaries={dosSummaries} />
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
