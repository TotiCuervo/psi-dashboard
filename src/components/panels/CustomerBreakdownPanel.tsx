import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ParseResult } from '@/types/orders'

type Props = { result: ParseResult }

export function CustomerBreakdownPanel({ result }: Props) {
    const customerTotals = new Map<string, number>()
    for (const s of result.skuSummaries) {
        for (const [customer, qty] of Object.entries(s.customerBreakdown)) {
            customerTotals.set(customer, (customerTotals.get(customer) ?? 0) + qty)
        }
    }

    const rows = Array.from(customerTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([customer, qty]) => ({
            customer,
            qty,
            pct: result.totalQuantity > 0 ? (qty / result.totalQuantity) * 100 : 0,
        }))

    const maxQty = rows[0]?.qty ?? 1

    return (
        <Card data-testid="panel__customers">
            <CardHeader className="border-b pb-4 flex-row items-center justify-between">
                <p className="text-sm font-semibold tracking-tight">Customer Breakdown</p>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {rows.length} customers
                </span>
            </CardHeader>
            <CardContent className="px-0 pt-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="pl-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                            <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Share</TableHead>
                            <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Open Units</TableHead>
                            <TableHead className="pr-6 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-16">%</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.customer} data-testid="customer__row">
                                <TableCell className="pl-6 text-sm font-medium w-48">{r.customer}</TableCell>
                                <TableCell className="w-48 pr-4">
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-foreground/30"
                                            style={{ width: `${(r.qty / maxQty) * 100}%` }}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right tabular-nums font-semibold">{r.qty.toLocaleString()}</TableCell>
                                <TableCell className="pr-6 text-right tabular-nums text-muted-foreground text-sm">
                                    {r.pct.toFixed(1)}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
