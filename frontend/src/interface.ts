export type SummonerInfo = {
    gameName: string;
    tagLine: string;
    championPlayed: string;
    championPfp: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
};

export type PlayerGoldData = {
    championName: string;
    gold_over_time: [number, number][];
    isCurrentPlayer: boolean;
};

export type StatsData = {
    summonerInfo: SummonerInfo;
    team_gold_data: PlayerGoldData[];
};
