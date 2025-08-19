import os
import httpx
import uvicorn
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
if not RIOT_API_KEY:
    raise ValueError("RIOT_API_KEY not found in environment variables.")
RIOT_BASE_URL = "https://europe.api.riotgames.com"

@app.get("/")
def read_root():
    return {"Hello": "Welcome to the LoL Stats API"}

@app.get("/stats/{gameName}/{tagLine}")
async def get_most_recent_game_stats(gameName: str, tagLine: str):
    if not RIOT_API_KEY:
        raise HTTPException(500, "Server missing API key")
    headers = {"X-Riot-Token": RIOT_API_KEY}
    account_url = f"{RIOT_BASE_URL}/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}"

    async with httpx.AsyncClient() as client:
        account_res = await client.get(
            account_url,
            headers=headers
        )
        account_data = account_res.json()
        puuid = account_data.get("puuid")

        if not puuid:
            raise HTTPException(404, "PUUID not found for the given summoner.")

        match_history_url = f"{RIOT_BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids?count=1"
        match_history_res = await client.get(
            match_history_url,
            headers=headers
        )
        match_ids = match_history_res.json()
        if not match_ids:
            raise HTTPException(404, "No matches found for this summoner.")

        classic_match_id = None
        match_data = None
        for match_id in match_ids:
            match_url = f"{RIOT_BASE_URL}/lol/match/v5/matches/{match_id}"
            match_res = await client.get(match_url, headers=headers)
            data = match_res.json()
            if data["info"].get("gameMode") == "CLASSIC":
                classic_match_id = match_id
                match_data = data
                break

        if not classic_match_id or not match_data:
            raise HTTPException(404, "No Classic game found in recent matches.")

        timeline_url = f"{RIOT_BASE_URL}/lol/match/v5/matches/{classic_match_id}/timeline"
        timeline_res = await client.get(
            timeline_url,
            headers=headers
        )
        timeline_data = timeline_res.json()

    current_participant = None
    for participant in match_data["info"]["participants"]:
        if participant["puuid"] == puuid:
            current_participant = participant
            break

    if not current_participant:
        raise HTTPException(404, "Player not found in match")

    team_members = [
        p for p in match_data["info"]["participants"]
        if p["teamId"] == current_participant["teamId"]
    ]

    enemy_team_members = [
        p for p in match_data["info"]["participants"]
        if p["teamId"] != current_participant["teamId"]
    ]

    enemy_laner = None
    lane_to_index = {
        "TOP": 0,
        "JUNGLE": 1,
        "MIDDLE": 2,
        "BOTTOM": 3,
        "UTILITY": 4
    }

    current_participant_lane_index = lane_to_index.get(current_participant.get("lane"))

    if current_participant_lane_index is not None:
        enemy_laner = enemy_team_members[current_participant_lane_index]

    team_gold_data = []
    for member in team_members:
        participant_id = member["participantId"]
        gold_over_time = []
        damage_over_time = []
        for frame in timeline_data["info"]["frames"]:
            minute = frame["timestamp"] // 60000
            pf = frame["participantFrames"].get(str(participant_id))
            if pf:
                total_gold = pf["totalGold"]
                gold_over_time.append([minute, total_gold])
                damage = pf.get("damageStats", {}).get("totalDamageDoneToChampions", 0)
                damage_over_time.append([minute, damage])
        team_gold_data.append({
            "championName": member["championName"],
            "gold_over_time": gold_over_time,
            "damage_over_time": damage_over_time,
            "isCurrentPlayer": member["puuid"] == puuid
        })

    enemy_team_gold_data = []
    for member in enemy_team_members:
        participant_id = member["participantId"]
        gold_over_time = []
        for frame in timeline_data["info"]["frames"]:
            minute = frame["timestamp"] // 60000
            if str(participant_id) in frame["participantFrames"]:
                total_gold = frame["participantFrames"][str(participant_id)]["totalGold"]
                gold_over_time.append([minute, total_gold])
        enemy_team_gold_data.append({
            "championName": member["championName"],
            "gold_over_time": gold_over_time,
            "isEnemyLaner": enemy_laner and member["puuid"] == enemy_laner["puuid"]
        })

    return {
        "summonerInfo": {
            "gameName": gameName,
            "tagLine": tagLine,
            "championPlayed": current_participant["championName"],
            "championPfp": f"https://ddragon.leagueoflegends.com/cdn/15.16.1/img/champion/{current_participant['championName']}.png",
            "win": current_participant["win"],
            "gameMode": match_data["info"].get("gameMode"),
            "kills": current_participant["kills"],
            "deaths": current_participant["deaths"],
            "assists": current_participant["assists"],
            "lane": current_participant.get("lane"),
            "role": current_participant.get("role"),
            "enemyLaner": enemy_laner["championName"] if enemy_laner else None
        },
        "team_gold_data": team_gold_data,
        "enemy_team_gold_data": enemy_team_gold_data
    }

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)