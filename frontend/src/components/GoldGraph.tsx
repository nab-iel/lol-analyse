import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { SeriesData } from '../interface';

type GoldGraphProps = {
    title?: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
    series: SeriesData[];
    height?: number;
    showPercentage?: boolean;
    baseSeriesName?: string;
};

const GoldGraph = ({
    title = 'Gold Over Time',
    xAxisTitle = 'Minute',
    yAxisTitle = 'Gold',
    series,
    height = 400,
    showPercentage = false,
    baseSeriesName
}: GoldGraphProps) => {

    const goldOverTimeOptions = {
        chart: {
            type: 'areaspline',
            width: null,
            height: height
        },
        title: {
            text: title
        },
        xAxis: {
            title: {
                text: xAxisTitle
            }
        },
        yAxis: {
            title: {
                text: yAxisTitle
            },
            plotLines: yAxisTitle === 'Gold Advantage' ? [{
                value: 0,
                color: '#666',
                dashStyle: 'dash',
                width: 2
            }] : []
        },
        tooltip: {
            shared: true,
            crosshairs: true,
            formatter: function (this: Highcharts.Point) {
                let tooltipContent = `<b>${xAxisTitle} ${this.x}</b><br/>`;

                tooltipContent += this.points?.map((point: Highcharts.Point) =>
                    `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toLocaleString()}${yAxisTitle === 'Gold' ? 'g' : ''}</b>`
                ).join('<br/>') || '';

                if (showPercentage && baseSeriesName) {
                    const baseValue = this.points?.find((p: Highcharts.Point) => p.series.name === baseSeriesName)?.y || 0;
                    const highlightedSeries = this.points?.find((p: Highcharts.Point) =>
                        series.find(s => s.name === p.series.name)?.isHighlighted
                    );

                    if (baseValue > 0 && highlightedSeries) {
                        const percentage = ((highlightedSeries.y! / baseValue) * 100).toFixed(1);
                        tooltipContent += `<br/><b>Share: ${percentage}%</b>`;
                    }
                }

                return tooltipContent;
            }
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.3,
                marker: {
                    enabled: false
                }
            }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    chart: {
                        height: Math.max(300, height * 0.75)
                    }
                }
            }]
        },
        series: series.map(seriesItem => ({
            name: seriesItem.name,
            data: seriesItem.data,
            color: yAxisTitle === 'Gold Advantage' ? undefined : (seriesItem.color || undefined), 
            fillOpacity: seriesItem.fillOpacity || 0.3,
            zIndex: seriesItem.zIndex || 1,
            lineWidth: seriesItem.lineWidth || (seriesItem.isHighlighted ? 3 : 2),
            ...(yAxisTitle === 'Gold Advantage' && {
                zones: [{
                    value: 0,
                    color: '#ef4444', 
                    fillColor: 'rgba(239, 68, 68, 0.3)'
                }, {
                    color: '#3b82f6', 
                    fillColor: 'rgba(59, 130, 246, 0.3)'
                }]
            })
        }))
    };

    return (
        <div className="p-6 rounded-lg shadow-lg h-full w-full bg-white" style={{ height: `${height + 50}px` }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={goldOverTimeOptions}
                containerProps={{ style: { width: '100%', height: '100%' } }}
            />
        </div>
    );
};

export default GoldGraph;