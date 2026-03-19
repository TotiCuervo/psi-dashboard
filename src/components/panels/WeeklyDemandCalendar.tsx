import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Weekly Demand Calendar
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6 sticky left-0 bg-card z-10 text-xs uppercase tracking-wide text-muted-foreground min-w-[140px]">
                                SKU
                            </TableHead>
                            {allWeeks.map((w) => (
                                <TableHead key={w} className="text-right text-xs uppercase tracking-wide text-muted-foreground min-w-[80px]">
                                    {formatWeek(w)}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {skuSummaries.map((s, i) => (
                            <TableRow key={s.sku} className={i % 2 === 1 ? 'bg-muted/40' : ''} data-testid={`weekly__row-${s.sku}`}>
                                <TableCell className="pl-6 sticky left-0 bg-inherit font-mono text-xs z-10">
                                    {s.sku}
                                </TableCell>
                                {allWeeks.map((w) => {
                                    const qty = s.weeklyBreakdown[w]
                                    return (
                                        <TableCell key={w} className="text-right tabular-nums text-sm">
                                            {qty ? qty.toLocaleString() : ''}
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
