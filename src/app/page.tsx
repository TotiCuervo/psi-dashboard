'use client'

import { useState } from 'react'
import { FileUploadZone } from '@/components/FileUploadZone'
import { SummaryScorecard } from '@/components/panels/SummaryScorecard'
import { OpenOrdersBySkuPanel } from '@/components/panels/OpenOrdersBySkuPanel'
import { WeeklyDemandCalendar } from '@/components/panels/WeeklyDemandCalendar'
import { CustomerBreakdownPanel } from '@/components/panels/CustomerBreakdownPanel'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ParseResult } from '@/types/orders'

export default function DashboardPage() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<ParseResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    function handleFileSelected(f: File) {
        setFile(f)
        setResult(null)
        setError(null)
    }

    async function handleProcess() {
        if (!file) return
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const form = new FormData()
            form.append('file', file)
            const res = await fetch('/api/parse', { method: 'POST', body: form })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? 'An unexpected error occurred.')
            } else {
                setResult(data as ParseResult)
            }
        } catch {
            setError('Failed to process the file. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">

                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">PSI Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Upload your master Excel file to view open order demand
                    </p>
                </div>

                {/* Upload section */}
                <div className="flex flex-col gap-4 max-w-xl">
                    <FileUploadZone
                        onFileSelected={handleFileSelected}
                        confirmed={!!result}
                        fileName={file?.name}
                    />

                    {error && (
                        <Alert variant="destructive" data-testid="upload__error">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onClick={handleProcess}
                        disabled={!file || loading}
                        className="w-full"
                        data-testid="upload__process-btn"
                    >
                        {loading ? 'Processing…' : 'Process File'}
                    </Button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex flex-col gap-6" data-testid="loading-state">
                        <div className="grid grid-cols-3 gap-4">
                            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                        </div>
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                )}

                {/* Unknown SKU warning */}
                {result && result.unknownSkus.length > 0 && (
                    <Alert data-testid="upload__unknown-skus">
                        <AlertDescription>
                            <span className="font-medium">Unrecognized SKUs found:</span>{' '}
                            {result.unknownSkus.join(', ')} — not in the master SKU list and excluded from calculations.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Dashboard panels */}
                {result && !loading && (
                    <div className="flex flex-col gap-6">
                        <SummaryScorecard result={result} />
                        <OpenOrdersBySkuPanel result={result} />
                        <WeeklyDemandCalendar result={result} />
                        <CustomerBreakdownPanel result={result} />
                    </div>
                )}
            </div>
        </main>
    )
}
