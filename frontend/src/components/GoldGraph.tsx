import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { PlayerGoldData } from '../interface';

type GoldGraphProps = {
    teamGoldData: PlayerGoldData[];
};

const GoldGraph = ({ teamGoldData }: GoldGraphProps) => {
    const currentPlayerData = teamGoldData?.find((player) => player.isCurrentPlayer);

    const teamTotalGoldOverTime = teamGoldData?.[0]?.gold_over_time?.map((_, index) => {
        const minute = teamGoldData[0].gold_over_time[index][0];
        const totalGold = teamGoldData.reduce((sum, player) => {
            return sum + (player.gold_over_time[index]?.[1] || 0);
        }, 0);
        return [minute, totalGold];
    }) || [];

    const goldOverTimeOptions = {
        chart: {
            type: 'areaspline',
            width: null, // Let it fill container
            height: 400
        },
        title: {
            text: 'Your Gold vs Team Total Gold'
        },
        xAxis: {
            title: {
                text: 'Minute'
            }
        },
        yAxis: {
            title: {
                text: 'Gold'
            }
        },
        tooltip: {
            shared: true,
            crosshairs: true,
            formatter: function (this: Highcharts.Point) {
                const teamTotal = this.points?.find((p: Highcharts.Point) => p.series.name.includes('Team Total'))?.y || 0;
                const playerGold = this.points?.find((p: Highcharts.Point) => p.series.name.includes('You'))?.y || 0;
                const percentage = teamTotal > 0 ? ((playerGold / teamTotal) * 100).toFixed(1) : 0;

                return `<b>Minute ${this.x}</b><br/>` +
                    this.points?.map((point: Highcharts.Point) =>
                        `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toLocaleString()}g</b>`
                    ).join('<br/>') +
                    `<br/><b>Your share: ${percentage}%</b>`;
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
                        height: 300
                    }
                }
            }]
        },
        series: [
            {
                name: 'Team Total Gold',
                data: teamTotalGoldOverTime,
                color: '#4287f5',
                fillOpacity: 0.2,
                zIndex: 1
            },
            {
                name: `${currentPlayerData?.championName} (You)`,
                data: currentPlayerData?.gold_over_time || [],
                color: '#ff6b6b',
                fillOpacity: 0.4,
                zIndex: 2,
                lineWidth: 3
            }
        ]
    };

    return (
        <div className="p-6 rounded-lg shadow-lg h-full w-full bg-white rounded-lg p-4" style={{ height: '450px' }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={goldOverTimeOptions}
                containerProps={{ style: { width: '100%', height: '100%' } }}
            />
        </div>
    );
};

export default GoldGraph;