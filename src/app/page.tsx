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

    function handleNewFile() {
        setFile(null)
        setResult(null)
        setError(null)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Sticky top bar */}
            <header className="sticky top-0 z-20 bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold tracking-tight">PSI Dashboard</span>
                        {result && file && (
                            <span className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5 font-mono truncate max-w-[240px]">
                                {file.name}
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
                {!result && !loading && (
                    <div className="max-w-7xl mx-auto px-6 py-16 flex justify-center">
                        <div className="w-full max-w-lg flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight">Open Order Demand</h1>
                                <p className="text-muted-foreground">
                                    Upload your master Excel file to replace the manual pivot table refresh
                                </p>
                            </div>

                            <FileUploadZone
                                onFileSelected={handleFileSelected}
                                fileName={file?.name}
                            />

                            {error && (
                                <Alert variant="destructive" data-testid="upload__error">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                onClick={handleProcess}
                                disabled={!file}
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
                    </div>
                )}

                {/* Dashboard */}
                {result && !loading && (
                    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
                        {result.unknownSkus.length > 0 && (
                            <Alert data-testid="upload__unknown-skus">
                                <AlertDescription>
                                    <span className="font-medium">Unrecognized SKUs found:</span>{' '}
                                    {result.unknownSkus.join(', ')} — not in the master SKU list and excluded.
                                </AlertDescription>
                            </Alert>
                        )}
                        <SummaryScorecard result={result} />
                        <OpenOrdersBySkuPanel result={result} />
                        <WeeklyDemandCalendar result={result} />
                        <CustomerBreakdownPanel result={result} />
                    </div>
                )}
            </main>
        </div>
    )
}
