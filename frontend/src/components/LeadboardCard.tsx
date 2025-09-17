import type { itemData } from "../interface";

type LeaderboardCardProps = {
    playerName: string;
    championPlayed: string;
    championPfp: string;
    items?: itemData[];
    trinket?: itemData;
    kills?: number;
    deaths?: number;
    assists?: number;
    isCurrentPlayer?: boolean;
    teamColor?: 'blue' | 'red';
}

const LeaderboardCard = ({
    playerName,
    championPlayed,
    championPfp,
    items,
    trinket,
    kills,
    deaths,
    assists,
    isCurrentPlayer,
    teamColor = 'blue'
}: LeaderboardCardProps) => {
    const createItemGrid = () => {
        const grid = Array(6).fill(null);
        if (items) {
            items.slice(0, 6).forEach((item, index) => {
                grid[index] = item;
            });
        }

        return grid;
    };

    const itemGrid = createItemGrid();

    return (
        <div className={`flex items-center justify-between p-2 rounded-xl shadow-lg border-2 hover:shadow-xl transition-all duration-300 ${
            isCurrentPlayer 
                ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-400 ring-2 ring-yellow-300/50 shadow-yellow-200/50' 
                : 'bg-white border-gray-200'
        }`}>
            <div className="relative min-w-[34px] md:w-[34px] md:h-[34px] w-[30px] h-[30px]">
                <div className={`overflow-hidden rounded-full border-2 shadow-md ${isCurrentPlayer
                        ? 'border-yellow-400'
                        : teamColor === 'blue'
                            ? 'border-blue-400'
                            : 'border-red-400'
                    }`}>
                    <img src={championPfp} alt={championPlayed} className="object-cover w-full h-full" />
                </div>
                {isCurrentPlayer && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-xs font-bold">★</span>
                    </div>
                )}
            </div>
            <div className={`font-semibold lg:font-bold w-[130px] text-start ml-[6px] overflow-hidden overflow-ellipsis whitespace-nowrap flex flex-col ${isCurrentPlayer ? 'text-yellow-800' : 'text-gray-800'
                }`}>
                <span>{playerName}</span>
                {isCurrentPlayer && <span className="text-xs text-yellow-600 font-medium">(You)</span>}
            </div>
            <div className="hidden md:flex items-center justify-center">
                <div className="grid flex-shrink-0 grid-cols-4 grid-rows-2 gap-1">
                    <div className="relative w-[24px] h-[24px]">
                        <div className="overflow-hidden rounded border-2 border-white/50 bg-black/20 shadow-sm">
                            {itemGrid[0] ? (
                                <img src={itemGrid[0].image} alt={itemGrid[0].name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-300/50 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative w-[24px] h-[24px]">
                        <div className="overflow-hidden rounded border-2 border-white/50 bg-black/20 shadow-sm">
                            {itemGrid[1] ? (
                                <img src={itemGrid[1].image} alt={itemGrid[1].name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-300/50 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative w-[24px] h-[24px]">
                        <div className="overflow-hidden rounded border-2 border-white/50 bg-black/20 shadow-sm">
                            {itemGrid[2] ? (
                                <img src={itemGrid[2].image} alt={itemGrid[2].name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-300/50 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative w-[24px] h-[24px]">
                        <div className="overflow-hidden rounded border-2 border-yellow-400 bg-black/20 shadow-sm">
                            {trinket ? (
                                <img src={trinket.image} alt={trinket.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-yellow-200/30 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full opacity-50"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative w-[24px] h-[24px]">
                        <div className="overflow-hidden rounded border-2 border-white/50 bg-black/20 shadow-sm">
                            {itemGrid[3] ? (
                                <img src={itemGrid[3].image} alt={itemGrid[3].name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-300/50 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative w-[24px] h-[24px]">
                        <div className="overflow-hidden rounded border-2 border-white/50 bg-black/20 shadow-sm">
                            {itemGrid[4] ? (
                                <img src={itemGrid[4].image} alt={itemGrid[4].name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-300/50 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative w-[24px] h-[24px]">
                        <div className="overflow-hidden rounded border-2 border-white/50 bg-black/20 shadow-sm">
                            {itemGrid[5] ? (
                                <img src={itemGrid[5].image} alt={itemGrid[5].name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-300/50 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="min-w-[60px] md:min-w-[120px] flex justify-center">
                <div className="min-w-[60px] md:min-w-[120px] md:flex justify-center hidden">
                    <div className="grid grid-cols-11 items-center justify-center gap-4 font-semibold text-center">
                        <span className="col-span-3 text-center text-emerald-600 font-bold">{kills}</span>
                        <span className="text-gray-400 opacity-70 font-extralight">/</span>
                        <span className="text-red-500 col-span-3 font-bold">{deaths}</span>
                        <span className="text-gray-400 opacity-70 font-extralight">/</span>
                        <span className="col-span-3 text-center text-yellow-600 font-bold">{assists}</span>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default LeaderboardCard;