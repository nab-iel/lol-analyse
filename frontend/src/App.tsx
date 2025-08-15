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
    <div className="min-h-screen min-w-screen py-8 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Recent Game Stats
        </h1>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <PlayerCard summonerInfo={statsData.summonerInfo} />
          </div>
          <div className="xl:col-span-2">
            <GoldGraph teamGoldData={statsData.team_gold_data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;