import { Card, CardContent } from '@/components/ui/card'
import type { ParseResult } from '@/types/orders'

type Props = { result: ParseResult }

export function SummaryScorecard({ result }: Props) {
    const stats = [
        {
            label: 'Total Open Units',
            value: result.totalQuantity.toLocaleString(),
            description: 'across all SKUs',
            primary: true,
            testId: 'scorecard__total-units',
        },
        {
            label: 'SKUs on Order',
            value: result.totalSkus.toString(),
            description: 'active products',
            primary: false,
            testId: 'scorecard__total-skus',
        },
        {
            label: 'Weeks of Demand',
            value: result.weeksCount.toString(),
            description: 'ship weeks ahead',
            primary: false,
            testId: 'scorecard__weeks',
        },
    ]

    return (
        <div className="grid grid-cols-3 gap-4" data-testid="scorecard">
            {stats.map((stat) => (
                <Card
                    key={stat.label}
                    className={stat.primary ? 'border-foreground/20' : undefined}
                >
                    <CardContent className="px-6 py-5 flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {stat.label}
                        </p>
                        <p
                            className={stat.primary
                                ? 'text-4xl font-bold tabular-nums tracking-tight'
                                : 'text-3xl font-semibold tabular-nums tracking-tight'
                            }
                            data-testid={stat.testId}
                        >
                            {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
