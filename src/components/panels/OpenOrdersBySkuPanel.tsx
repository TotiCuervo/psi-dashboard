import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Open Orders by SKU
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6 text-xs uppercase tracking-wide text-muted-foreground">SKU</TableHead>
                            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Product</TableHead>
                            <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">Total Units</TableHead>
                            <TableHead className="pr-6 text-right text-xs uppercase tracking-wide text-muted-foreground">Nearest Ship Week</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.skuSummaries.map((s, i) => (
                            <TableRow key={s.sku} className={i % 2 === 1 ? 'bg-muted/40' : ''} data-testid={`open-orders__row-${s.sku}`}>
                                <TableCell className="pl-6 font-mono text-xs">{s.sku}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {MASTER_SKUS[s.sku] ?? <span className="text-destructive text-xs">Unrecognized</span>}
                                </TableCell>
                                <TableCell className="text-right tabular-nums font-medium">{s.totalQuantity.toLocaleString()}</TableCell>
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
