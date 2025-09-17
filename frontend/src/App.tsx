import { useState, useEffect } from 'react';
import axios from 'axios';

import AreaLineGraph from './components/AreaLineGraph';
import PlayerCard from './components/PlayerCard';
import PieChart from './components/PieChart';
import type { StatsData } from './interface'
import GraphCarousel from './components/GraphCarousel';
import Leaderboard from './components/Leaderboard';

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

  const calculateGoldAdvantageData = () => {
    if (!statsData || !statsData.goldOverTime) return [];

    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return [];

    return statsData.goldOverTime.map((teamPoint) => {
      const minute = teamPoint.timestamp / 60;
      const playerTeam = currentPlayer.team;
      const blueTeamGold = teamPoint.blueTeamGold;
      const redTeamGold = teamPoint.redTeamGold;
      const advantage = (playerTeam === 'Blue') ? (blueTeamGold - redTeamGold) : (redTeamGold - blueTeamGold);

      return [minute, advantage];
    });
  };

  const getCurrentPlayer = () => statsData?.players.find(p => p.isCurrentPlayer);

  const getEnemyLaner = () => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return null;
    return statsData?.players.find(p =>
      p.team !== currentPlayer.team &&
      p.lane === currentPlayer.lane
    );
  };

  const getTeamPlayers = () => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return [];
    return statsData?.players.filter(p => p.team === currentPlayer.team) || [];
  };

  const goldAdvantageData = calculateGoldAdvantageData();

  const timeAhead = goldAdvantageData.filter(([_, advantage]) => advantage > 0).length;
  const timeBehind = goldAdvantageData.filter(([_, advantage]) => advantage < 0).length;
  const timeEven = goldAdvantageData.filter(([_, advantage]) => advantage === 0).length;

  const pieChartData = [
    {
      name: 'Time Ahead',
      y: timeAhead,
      color: '#3b82f6' // blue-500
    },
    {
      name: 'Time Behind',
      y: timeBehind,
      color: '#ef4444' // red-500
    },
    ...(timeEven > 0 ? [{
      name: 'Time Even',
      y: timeEven,
      color: '#6b7280' // gray-500
    }] : [])
  ];

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

  const currentPlayer = getCurrentPlayer();
  const enemyLaner = getEnemyLaner();
  const teamPlayers = getTeamPlayers();

  if (!currentPlayer) {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Could not find current player data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="min-w-screen mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Recent Game Stats
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Leaderboard players={statsData?.players} winningTeam={statsData?.winningTeam} />
          <div className="lg:col-span-1 space-y-6">
            <AreaLineGraph
              title="Your Gold vs Team Total Gold"
              series={[
                {
                  name: 'Team Total Gold',
                  data: currentPlayer.goldOverTime?.map((timePoint, index) => {
                    const minute = timePoint[0];
                    const totalGold = teamPlayers.reduce((sum, player) => {
                      return sum + (player.goldOverTime?.[index]?.[1] || 0);
                    }, 0);
                    return [minute, totalGold];
                  }) || [],
                  color: '#4287f5',
                  fillOpacity: 0.2,
                  zIndex: 1
                },
                {
                  name: `${currentPlayer.championPlayed} (You)`,
                  data: currentPlayer.goldOverTime || [],
                  color: '#ff6b6b',
                  fillOpacity: 0.4,
                  zIndex: 2,
                  isHighlighted: true
                }
              ]}
              showPercentage={true}
              baseSeriesName="Team Total Gold"
            />

            <AreaLineGraph
              title="Your Gold vs Enemy Laner"
              series={(() => {
                if (!enemyLaner) return [];

                const enemyFinalGold = enemyLaner.goldOverTime?.slice(-1)[0]?.[1] || 0;
                const playerFinalGold = currentPlayer.goldOverTime?.slice(-1)[0]?.[1] || 0;

                const playerHasHigherGold = playerFinalGold > enemyFinalGold;

                return [
                  {
                    name: `${enemyLaner.championPlayed}`,
                    data: enemyLaner.goldOverTime || [],
                    color: '#ff6b6b',
                    fillOpacity: 0.4,
                    zIndex: playerHasHigherGold ? 2 : 1
                  },
                  {
                    name: `${currentPlayer.championPlayed} (You)`,
                    data: currentPlayer.goldOverTime || [],
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

            <GraphCarousel height={400}>
              <AreaLineGraph
                title="Team Gold Advantage Over Time"
                yAxisTitle="Gold Advantage"
                series={[
                  {
                    name: 'Gold Advantage',
                    data: goldAdvantageData,
                    color: '#10b981',
                    fillOpacity: 0.3,
                    zIndex: 1,
                    lineWidth: 3
                  }
                ]}
                showPercentage={false}
              />

              <PieChart
                title="Gold Advantage Time Distribution"
                units={'Minutes'}
                data={pieChartData}
                showPercentage={true}
                showLegend={true}
                showDataLabels={true}
                allowPointSelect={true}
              />
            </GraphCarousel>

            {/* Damage Comparison */}
            <AreaLineGraph
              title="Your Damage vs Team Total Damage"
              yAxisTitle="Damage"
              series={[
                {
                  name: 'Team Total Damage',
                  data: currentPlayer.damageOverTime?.map((timePoint, index) => {
                    const minute = timePoint[0];
                    const totalDamage = teamPlayers.reduce((sum, player) => {
                      return sum + (player.damageOverTime?.[index]?.[1] || 0);
                    }, 0);
                    return [minute, totalDamage];
                  }) || [],
                  color: '#9c27b0',
                  fillOpacity: 0.2,
                  zIndex: 1
                },
                {
                  name: `${currentPlayer.championPlayed} (You)`,
                  data: currentPlayer.damageOverTime || [],
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