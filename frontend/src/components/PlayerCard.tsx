import type { SummonerInfo  } from "../interface";

type PlayerCardProps = {
    summonerInfo: SummonerInfo;
};

const PlayerCard = ({ summonerInfo }: PlayerCardProps) => {
    const kda = summonerInfo.deaths > 0 
        ? ((summonerInfo.kills + summonerInfo.assists) / summonerInfo.deaths).toFixed(2)
        : 'Perfect';

    return (
        <div className={`
            rounded-xl p-5 text-white shadow-2xl border-2 transition-all duration-300
            ${summonerInfo.win 
                ? 'bg-gradient-to-br from-emerald-900 to-emerald-700 border-emerald-400' 
                : 'bg-gradient-to-br from-red-900 to-red-700 border-red-400'
            }
        `}>
            <div className="flex items-center gap-5 mb-5">
                <div className="relative">
                    <img 
                        src={summonerInfo.championPfp} 
                        alt={summonerInfo.championPlayed}
                        className="w-20 h-20 rounded-full border-3 border-white shadow-lg"
                    />
                </div>
                
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">
                        {summonerInfo.gameName}#{summonerInfo.tagLine}
                    </h2>
                    <p className="text-lg opacity-90 mb-2">{summonerInfo.championPlayed}</p>
                    <div className={`
                        inline-block px-3 py-1 rounded-full text-sm font-bold
                        ${summonerInfo.win 
                            ? 'bg-emerald-400 text-black' 
                            : 'bg-red-500 text-white'
                        }
                    `}>
                        {summonerInfo.win ? 'VICTORY' : 'DEFEAT'}
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mb-5 flex-wrap gap-5">
                <div className="text-center">
                    <div className="text-2xl font-bold mb-1">
                        <span className="text-emerald-400">{summonerInfo.kills}</span>
                        <span className="text-gray-300 mx-2">/</span>
                        <span className="text-red-400">{summonerInfo.deaths}</span>
                        <span className="text-gray-300 mx-2">/</span>
                        <span className="text-yellow-400">{summonerInfo.assists}</span>
                    </div>
                    <div className="text-sm opacity-80">KDA: {kda}</div>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;