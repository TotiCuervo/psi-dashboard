import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MASTER_SKUS } from '@/lib/skus'
import { DEFAULT_DOS_THRESHOLDS } from '@/types/inventory'
import type { SkuDos, DosStatus } from '@/types/inventory'

type Props = { dosSummaries: SkuDos[] }

const STATUS_CONFIG: Record<DosStatus, { label: string; className: string }> = {
    green: {
        label: 'Healthy',
        className: 'bg-emerald-100 text-emerald-800 border-transparent hover:bg-emerald-100',
    },
    yellow: {
        label: 'Watch',
        className: 'bg-amber-100 text-amber-800 border-transparent hover:bg-amber-100',
    },
    red: {
        label: 'Low',
        className: 'bg-red-100 text-red-700 border-transparent hover:bg-red-100',
    },
    stockout: {
        label: 'Stockout',
        className: 'bg-red-600 text-white border-transparent hover:bg-red-600',
    },
}

function formatDays(dosDays: number): string {
    if (dosDays >= 999) return '∞'
    return dosDays.toFixed(1)
}

function formatWeeks(dosWeeks: number): string {
    if (dosWeeks >= 999) return '—'
    return `${dosWeeks.toFixed(1)}w`
}

export function DosPanel({ dosSummaries }: Props) {
    const stockoutCount = dosSummaries.filter(d => d.status === 'stockout').length
    const redCount = dosSummaries.filter(d => d.status === 'red').length
    const t = DEFAULT_DOS_THRESHOLDS

    return (
        <Card data-testid="panel__dos">
            <CardHeader className="border-b pb-4 flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold tracking-tight">Days of Supply</p>
                    <p className="text-xs text-muted-foreground">
                        Green ≥ {t.green}d · Yellow ≥ {t.yellow}d · Red ≥ {t.red}d · Below = Stockout
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {stockoutCount > 0 && (
                        <span className="text-xs font-medium text-red-600 tabular-nums">
                            {stockoutCount} stockout{stockoutCount > 1 ? 's' : ''}
                        </span>
                    )}
                    {redCount > 0 && (
                        <span className="text-xs font-medium text-red-500 tabular-nums">
                            {redCount} critical
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {dosSummaries.length} SKUs
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-0 pt-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="pl-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</TableHead>
                            <TableHead className="hidden sm:table-cell text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</TableHead>
                            <TableHead className="hidden sm:table-cell text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Open Orders</TableHead>
                            <TableHead className="hidden sm:table-cell text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Avail. Inv.</TableHead>
                            <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">DOS</TableHead>
                            <TableHead className="pr-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dosSummaries.map((d) => {
                            const cfg = STATUS_CONFIG[d.status]
                            return (
                                <TableRow key={d.sku} data-testid={`dos__row-${d.sku}`}>
                                    <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                        {d.sku}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-sm font-medium">
                                        {MASTER_SKUS[d.sku] ?? d.sku}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-right tabular-nums text-sm">
                                        {d.totalOpenOrders.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-right tabular-nums text-sm">
                                        {d.totalAvailable.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums font-semibold">
                                        <span title={`${formatWeeks(d.dosWeeks)}`}>
                                            {formatDays(d.dosDays)}d
                                        </span>
                                    </TableCell>
                                    <TableCell className="pr-6">
                                        <Badge variant="outline" className={cfg.className}>
                                            {cfg.label}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
