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
        <h1 className="text-4xl font-bold text-center mb-8">
          Recent Game Stats
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <PlayerCard summonerInfo={statsData.playerInfo} />
            <PlayerCard summonerInfo={statsData.enemyLanerInfo} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Team Gold Comparison */}
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

            <GoldGraph
              title="Your Gold vs Enemy Laner"
              series={(() => {
                const enemyLaner = statsData.enemy_team_gold_data?.find(p => p.isEnemyLaner);
                const currentPlayer = statsData.team_gold_data?.find(p => p.isCurrentPlayer);

                const enemyFinalGold = enemyLaner?.gold_over_time?.slice(-1)[0]?.[1] || 0;
                const playerFinalGold = currentPlayer?.gold_over_time?.slice(-1)[0]?.[1] || 0;

                const playerHasHigherGold = playerFinalGold > enemyFinalGold;

                return [
                  {
                    name: `${enemyLaner?.championName}`,
                    data: enemyLaner?.gold_over_time || [],
                    color: '#ff6b6b',
                    fillOpacity: 0.4,
                    zIndex: playerHasHigherGold ? 2 : 1
                  },
                  {
                    name: `${currentPlayer?.championName} (You)`,
                    data: currentPlayer?.gold_over_time || [],
                    color: '#4287f5',
                    fillOpacity: 0.2,
                    zIndex: playerHasHigherGold ? 1 : 2,
                    isHighlighted: true
                  }
                ];
              })()}
              showPercentage={true}
              baseSeriesName="Enemy Laner Gold"
            />

            {/* Damage Comparison */}
            <GoldGraph
              title="Your Damage vs Team Total Damage"
              yAxisTitle="Damage"
              series={[
                {
                  name: 'Team Total Damage',
                  data: statsData.team_gold_data?.[0]?.damage_over_time?.map((_, index) => {
                    const minute = statsData.team_gold_data[0].damage_over_time[index][0];
                    const totalDamage = statsData.team_gold_data.reduce((sum, player) => {
                      return sum + (player.damage_over_time[index]?.[1] || 0);
                    }, 0);
                    return [minute, totalDamage];
                  }) || [],
                  color: '#9c27b0',
                  fillOpacity: 0.2,
                  zIndex: 1
                },
                {
                  name: `${statsData.team_gold_data?.find(p => p.isCurrentPlayer)?.championName} (You)`,
                  data: statsData.team_gold_data?.find(p => p.isCurrentPlayer)?.damage_over_time || [],
                  color: '#e91e63',
                  fillOpacity: 0.4,
                  zIndex: 2,
                  isHighlighted: true
                }
              ]}
              showPercentage={true}
              baseSeriesName="Team Total Damage"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;