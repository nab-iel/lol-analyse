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


def get_item_info(item_id):
    """Convert item ID to item name and image URL"""
    if item_id == 0:
        return None

    return {
        "id": item_id,
        "name": f"Item_{item_id}",  # Placeholder for item name
        "image": f"https://ddragon.leagueoflegends.com/cdn/15.16.1/img/item/{item_id}.png"
    }


def format_items(participant_data):
    """Format items array with names and images, excluding trinket"""
    items = []
    for i in range(6):
        item_id = participant_data.get(f"item{i}", 0)
        item_info = get_item_info(item_id)
        if item_info:
            items.append(item_info)
    return items


def get_trinket(participant_data):
    """Get trinket information"""
    trinket_id = participant_data.get("item6", 0)
    return get_item_info(trinket_id)


def get_player_stats(participant, match_data, timeline_data, puuid):
    """Extract and format a single player's stats"""
    champion_name = participant["championName"]
    participant_id = participant["participantId"]

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

    team_id = participant["teamId"]
    team = "Blue" if team_id == 100 else "Red"

    return {
        "gameName": participant.get("riotIdGameName"),
        "tagLine": participant.get("riotIdTagline"),
        "championPlayed": champion_name,
        "championPfp": f"https://ddragon.leagueoflegends.com/cdn/15.16.1/img/champion/{champion_name}.png",
        "win": participant["win"],
        "kills": participant["kills"],
        "deaths": participant["deaths"],
        "assists": participant["assists"],
        "lane": participant.get("lane"),
        "role": participant.get("role"),
        "teamId": team_id,
        "team": team,
        "items": format_items(participant),
        "trinket": get_trinket(participant),
        "isCurrentPlayer": participant["puuid"] == puuid,
        "goldOverTime": gold_over_time,
        "damageOverTime": damage_over_time
    }


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

    participants = match_data["info"]["participants"]
    player_stats_list = []

    for participant in participants:
        player_stats = get_player_stats(participant, match_data, timeline_data, puuid)
        player_stats_list.append(player_stats)

    gold_over_time = []

    for frame in timeline_data["info"]["frames"]:
        timestamp = frame["timestamp"] // 1000
        blue_gold = 0
        red_gold = 0

        for participant_id, participant_frame in frame["participantFrames"].items():
            if int(participant_id) <= 5:
                blue_gold += participant_frame["totalGold"]
            else:
                red_gold += participant_frame["totalGold"]

        gold_over_time.append({
            "timestamp": timestamp,
            "blueTeamGold": blue_gold,
            "redTeamGold": red_gold
        })

    winning_team = "Blue" if any(p["win"] and p["teamId"] == 100 for p in participants) else "Red"

    return {
        "gameMode": match_data["info"].get("gameMode"),
        "matchId": classic_match_id,
        "players": player_stats_list,
        "goldOverTime": gold_over_time,
        "winningTeam": winning_team
    }


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
