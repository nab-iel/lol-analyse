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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    const fetchStats = async () => {
        try {
            const response = await axios.get(`/api/stats/${gameName}/${tagLine}`);
            setStatsData(response.data);
        } catch (err: any) {
            setError(err.message);
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

    const { summonerInfo, gold_over_time_data } = statsData;

    const goldOverTimeOptions = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Gold Over Time'
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
        series: [{
            name: 'Gold Earned',
            data: gold_over_time_data
        }]
    };

    return (
        <div>
            <h1>{summonerInfo.gameName}#{summonerInfo.tagLine}'s Last Game</h1>
            <p>Champion: **{summonerInfo.championPlayed}**</p>
            <p>Result: **{summonerInfo.win ? 'Victory' : 'Defeat'}**</p>
            <div style={{ width: '600px', margin: '20px auto' }}>
                <HighchartsReact highcharts={Highcharts} options={goldOverTimeOptions} />
            </div>
        </div>
    );
};

export default GoldGraph;