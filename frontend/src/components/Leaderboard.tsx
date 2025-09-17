import type { SummonerInfo } from '../interface'
import LeaderboardCard from './LeadboardCard';

type LeaderboardProps = {
    players?: SummonerInfo[];
    winningTeam?: string;
}

const Leaderboard = ({ players, winningTeam }: LeaderboardProps) => {
    const blueTeam = players?.filter(p => p.team == 'Blue') || [];
    const redTeam = players?.filter(p => p.team == 'Red') || [];

    return (
        <div className='flex flex-col gap-2 pb-12 px-8 border-b border-r border-l border-black-0 border-opacity-10 rounded-2xl bg-black-800/70 lg:bg-black-800/50'>
            <div className="flex flex-col gap-[5px]">
                <div className='flex items-center gap-[6px] min-h-[48px]'>
                    <span className={`font-bold ${winningTeam === 'Blue' ? 'text-blue-500' : 'text-red-500'}`}>{winningTeam === 'Blue' ? 'Victory' : 'Defeat'}</span>
                    <span className="font-bold">(Blue Side)</span>
                </div>
                {blueTeam.map((player) => {
                    return (
                        <LeaderboardCard
                            key={player.championPlayed}
                            playerName={player.gameName}
                            championPlayed={player.championPlayed}
                            championPfp={player.championPfp}
                            items={player.items}
                            trinket={player.trinket}
                            kills={player.kills}
                            deaths={player.deaths}
                            assists={player.assists}
                            isCurrentPlayer={player.isCurrentPlayer}
                        />
                    )
                })}
            </div>
            <div className="flex flex-col gap-[4px]">
                <div className='flex items-center gap-[6px] min-h-[48px]'>
                    <span className={`font-bold ${winningTeam === 'Red' ? 'text-blue-500' : 'text-red-500'}`}>{winningTeam === 'Red' ? 'Victory' : 'Defeat'}</span>
                    <span className="font-bold">(Red Side)</span>
                </div>
                {redTeam.map((player) => {
                    return (
                        <LeaderboardCard
                            key={player.championPlayed}
                            playerName={player.gameName}
                            championPlayed={player.championPlayed}
                            championPfp={player.championPfp}
                            items={player.items}
                            trinket={player.trinket}
                            kills={player.kills}
                            deaths={player.deaths}
                            assists={player.assists}
                            isCurrentPlayer={player.isCurrentPlayer}
                        />
                    )
                })}
            </div>
        </div>
    );
}

export default Leaderboard;