import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ParseResult } from '@/types/orders'

type Props = { result: ParseResult }

function formatWeek(iso: string) {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${m}/${d}/${String(y).slice(2)}`
}

export function WeeklyDemandCalendar({ result }: Props) {
    const { skuSummaries, allWeeks } = result

    return (
        <Card data-testid="panel__weekly-calendar">
            <CardHeader className="border-b pb-4 flex-row items-center justify-between">
                <p className="text-sm font-semibold tracking-tight">Weekly Demand Calendar</p>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {allWeeks.length} weeks
                </span>
            </CardHeader>
            <CardContent className="px-0 pt-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="pl-6 sticky left-0 bg-muted/40 z-10 text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[148px]">
                                SKU
                            </TableHead>
                            {allWeeks.map((w) => (
                                <TableHead key={w} className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[80px]">
                                    {formatWeek(w)}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {skuSummaries.map((s) => (
                            <TableRow key={s.sku} data-testid={`weekly__row-${s.sku}`}>
                                <TableCell className="pl-6 sticky left-0 bg-card font-mono text-xs text-muted-foreground z-10 border-r border-border/50">
                                    {s.sku}
                                </TableCell>
                                {allWeeks.map((w) => {
                                    const qty = s.weeklyBreakdown[w]
                                    return (
                                        <TableCell key={w} className="text-right tabular-nums text-sm">
                                            {qty ? qty.toLocaleString() : <span className="text-border">—</span>}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
