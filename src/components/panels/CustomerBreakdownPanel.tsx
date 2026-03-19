import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ParseResult } from '@/types/orders'

type Props = { result: ParseResult }

export function CustomerBreakdownPanel({ result }: Props) {
    // Aggregate customer totals across all SKUs
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

    return (
        <Card data-testid="panel__customers">
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Customer Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6 text-xs uppercase tracking-wide text-muted-foreground">Customer</TableHead>
                            <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">Open Units</TableHead>
                            <TableHead className="pr-6 text-right text-xs uppercase tracking-wide text-muted-foreground">% of Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r, i) => (
                            <TableRow key={r.customer} className={i % 2 === 1 ? 'bg-muted/40' : ''} data-testid={`customer__row`}>
                                <TableCell className="pl-6 text-sm">{r.customer}</TableCell>
                                <TableCell className="text-right tabular-nums font-medium">{r.qty.toLocaleString()}</TableCell>
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
