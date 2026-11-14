import { formatCurrency } from '../../utils/formatters';

export interface CostCategorySlice {
    id: string;
    label: string;
    value: number;
    color: string;
}

interface CostDonutChartProps {
    totalCost: number;
    categories: CostCategorySlice[];
}

export const CostDonutChart = ({ totalCost, categories }: CostDonutChartProps) => {
    const size = 132;
    const strokeWidth = 18;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const positiveSum = categories.reduce((acc, c) => acc + Math.max(0, c.value), 0);

    const segments = categories.reduce<Array<CostCategorySlice & { dashLength: number; dashOffset: number; pct: number }>>(
        (acc, cat) => {
            const val = Math.max(0, cat.value);
            const pct = positiveSum > 0 ? (val / positiveSum) * 100 : 0;
            const dashLength = positiveSum > 0 ? (val / positiveSum) * circumference : 0;
            const prevTotalLength = acc.reduce((sum, item) => sum + item.dashLength, 0);
            acc.push({
                ...cat,
                pct,
                dashLength,
                dashOffset: -prevTotalLength
            });
            return acc;
        },
        []
    );

    return (
        <div className="flex flex-col items-center gap-3.5">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-zinc-100 dark:text-zinc-800"
                    />
                    {positiveSum > 0 &&
                        segments.map(seg =>
                            seg.dashLength > 0 ? (
                                <circle
                                    key={seg.id}
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="transparent"
                                    stroke={seg.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={`${seg.dashLength} ${circumference}`}
                                    strokeDashoffset={seg.dashOffset}
                                    strokeLinecap="butt"
                                />
                            ) : null
                        )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Custo total
                    </span>
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {formatCurrency(totalCost)}
                    </span>
                </div>
            </div>

            <div className="w-full space-y-1.5 text-xs">
                {segments.map(seg => (
                    <div key={seg.id} className="flex items-center justify-between gap-3 py-0.5 border-b border-zinc-100/80 dark:border-zinc-800/60 last:border-none">
                        <div className="flex items-center gap-2 min-w-0">
                            <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-zinc-700 dark:text-zinc-200 font-medium">
                                {seg.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 tabular-nums">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                {formatCurrency(seg.value)}
                            </span>
                            <span className="text-[10px] font-semibold text-zinc-400 w-9 text-right">
                                {seg.value > 0 && seg.pct < 1 ? '<1%' : `${seg.pct.toFixed(0)}%`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
