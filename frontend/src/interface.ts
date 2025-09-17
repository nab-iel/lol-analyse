export type StatsData = {
    gameMode: string;
    matchId: string;
    players: SummonerInfo[];
    goldOverTime: goldData[];
    winningTeam: string;
};

export type goldData = {
    timestamp: number;
    blueTeamGold: number;
    redTeamGold: number;
}

export type SummonerInfo = {
    gameName: string;
    tagLine?: string;
    championPlayed: string;
    championPfp: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    lane: string;
    role: string;
    teamId: number;
    team: string;
    isCurrentPlayer?: boolean;
    enemyLaner?: string;
    items: itemData[];
    trinket: itemData;
    goldOverTime: [number, number][];
    damageOverTime: [number, number][];
};

export type itemData = {
    id: string;
    name: string;
    image: string;
}

export type PlayerGoldData = {
    championName: string;
    gold_over_time: [number, number][];
    damage_over_time: [number, number][];
    isCurrentPlayer?: boolean;
    isEnemyLaner?: boolean;
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