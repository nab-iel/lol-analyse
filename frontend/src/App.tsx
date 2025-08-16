import { useState, useEffect } from 'react';
import axios from 'axios';

import GoldGraph from './components/GoldGraph';
import PlayerCard from './components/PlayerCard';
import type { StatsData } from './interface'

function App() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const gameName = "dmsdklb";
  const tagLine = "vivi";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`/api/stats/${gameName}/${tagLine}`);
        setStatsData(response.data);
      } catch (err) {
        let message;
        if (err instanceof Error) message = err.message;
        else message = String(err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [gameName, tagLine]);

  if (isLoading) {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        <div className="text-black text-xl">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        <div className="text-black text-xl">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="min-w-screen mx-auto px-4">
        <h1 className="text-4xl font-bold text-black text-center mb-8">
          Recent Game Stats
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <PlayerCard summonerInfo={statsData.summonerInfo} />
          </div>

          <div className="xl:col-span-2">
            <GoldGraph
              title="Your Gold vs Team Total Gold"
              series={[
                {
                  name: 'Team Total Gold',
                  data: statsData.team_gold_data?.[0]?.gold_over_time?.map((_, index) => {
                    const minute = statsData.team_gold_data[0].gold_over_time[index][0];
                    const totalGold = statsData.team_gold_data.reduce((sum, player) => {
                      return sum + (player.gold_over_time[index]?.[1] || 0);
                    }, 0);
                    return [minute, totalGold];
                  }) || [],
                  color: '#4287f5',
                  fillOpacity: 0.2,
                  zIndex: 1
                },
                {
                  name: `${statsData.team_gold_data?.find(p => p.isCurrentPlayer)?.championName} (You)`,
                  data: statsData.team_gold_data?.find(p => p.isCurrentPlayer)?.gold_over_time || [],
                  color: '#ff6b6b',
                  fillOpacity: 0.4,
                  zIndex: 2,
                  isHighlighted: true
                }
              ]}
              showPercentage={true}
              baseSeriesName="Team Total Gold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;