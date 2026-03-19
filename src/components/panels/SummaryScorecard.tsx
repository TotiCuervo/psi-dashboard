import { Card, CardContent } from '@/components/ui/card'
import type { ParseResult } from '@/types/orders'

type Props = { result: ParseResult }

export function SummaryScorecard({ result }: Props) {
    const stats = [
        { label: 'Total Open Units', value: result.totalQuantity.toLocaleString(), testId: 'scorecard__total-units' },
        { label: 'SKUs with Open Orders', value: result.totalSkus.toString(), testId: 'scorecard__total-skus' },
        { label: 'Weeks of Demand', value: result.weeksCount.toString(), testId: 'scorecard__weeks' },
    ]

    return (
        <div className="grid grid-cols-3 gap-4" data-testid="scorecard">
            {stats.map((stat) => (
                <Card key={stat.label} className="py-5">
                    <CardContent className="px-5 flex flex-col gap-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {stat.label}
                        </p>
                        <p
                            className="text-3xl font-semibold tabular-nums"
                            data-testid={stat.testId}
                        >
                            {stat.value}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
