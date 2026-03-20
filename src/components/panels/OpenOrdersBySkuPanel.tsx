import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MASTER_SKUS } from '@/lib/skus'
import type { ParseResult } from '@/types/orders'

type Props = { result: ParseResult }

function formatDate(iso: string) {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${m}/${d}/${y}`
}

export function OpenOrdersBySkuPanel({ result }: Props) {
    return (
        <Card data-testid="panel__open-orders">
            <CardHeader className="border-b pb-4 flex-row items-center justify-between">
                <p className="text-sm font-semibold tracking-tight">Open Orders by SKU</p>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {result.skuSummaries.length} SKUs
                </span>
            </CardHeader>
            <CardContent className="px-0 pt-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="pl-6 hidden sm:table-cell text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</TableHead>
                            <TableHead className="pl-6 sm:pl-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</TableHead>
                            <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Units</TableHead>
                            <TableHead className="pr-6 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Ship Week</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.skuSummaries.map((s) => (
                            <TableRow key={s.sku} data-testid={`open-orders__row-${s.sku}`}>
                                <TableCell className="pl-6 hidden sm:table-cell font-mono text-xs text-muted-foreground">{s.sku}</TableCell>
                                <TableCell className="pl-6 sm:pl-4 text-sm font-medium">
                                    {MASTER_SKUS[s.sku] ?? <span className="text-destructive text-xs">Unrecognized</span>}
                                </TableCell>
                                <TableCell className="text-right tabular-nums font-semibold">{s.totalQuantity.toLocaleString()}</TableCell>
                                <TableCell className="pr-6 text-right tabular-nums text-muted-foreground text-sm">
                                    {formatDate(s.nearestWeek)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
