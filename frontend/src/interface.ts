export type SummonerInfo = {
    gameName?: string;
    tagLine?: string;
    championPlayed: string;
    championPfp: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    lane: string;
    role: string;
    enemyLaner?: string;
};

export type PlayerGoldData = {
    championName: string;
    gold_over_time: [number, number][];
    damage_over_time: [number, number][];
    isCurrentPlayer?: boolean;
    isEnemyLaner?: boolean;
};

export type StatsData = {
    playerInfo: SummonerInfo;
    enemyLanerInfo: SummonerInfo;
    team_gold_data: PlayerGoldData[];
    enemy_team_gold_data: PlayerGoldData[];
};

export type SeriesData = {
    name: string;
    data: [number, number][];
    color?: string;
    fillOpacity?: number;
    zIndex?: number;
    lineWidth?: number;
    isHighlighted?: boolean;
};