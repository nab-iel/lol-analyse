import { useState, useEffect } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

type GoldGraphProps = {
    gameName: string,
    tagLine: string
}

const GoldGraph = ({ gameName, tagLine }: GoldGraphProps) => {
    const [statsData, setStatsData] = useState(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`/api/stats/${gameName}/${tagLine}`);
                setStatsData(response.data);
            } catch (err) {
                let message;
                if (err instanceof Error) message = err.message
	            else message = String(error)
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [gameName, tagLine]);

    if (isLoading) {
        return <div>Loading stats...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const { summonerInfo, team_gold_data } = statsData;

    const currentPlayerData = team_gold_data?.find((player: any) => player.isCurrentPlayer);
    
    const teamTotalGoldOverTime = team_gold_data?.[0]?.gold_over_time?.map((_: any, index: number) => {
        const minute = team_gold_data[0].gold_over_time[index][0];
        const totalGold = team_gold_data.reduce((sum: number, player: any) => {
            return sum + (player.gold_over_time[index]?.[1] || 0);
        }, 0);
        return [minute, totalGold];
    }) || [];

    const goldOverTimeOptions = {
        chart: {
            type: 'areaspline'
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
            formatter: function(this: Highcharts.Point) {
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
        <div>
            <h1>{summonerInfo.gameName}#{summonerInfo.tagLine}'s Last Game</h1>
            <p>Champion: {summonerInfo.championPlayed}</p>
            <p>Result: {summonerInfo.win ? 'Victory' : 'Defeat'}</p>
            <div style={{ width: '800px', height: '500px', margin: '20px auto' }}>
                <HighchartsReact highcharts={Highcharts} options={goldOverTimeOptions} />
            </div>
        </div>
    );
};

export default GoldGraph;