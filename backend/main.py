import os
import httpx
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
        match_data = match_history_res.json()

        if not match_data:
            raise HTTPException(404, "No matches found for this summoner.")

        most_recent_match_id = match_data[0]

        if not most_recent_match_id:
            raise HTTPException(status_code=404, detail="Most recent match ID not found.")

        match_url = f"{RIOT_BASE_URL}/lol/match/v5/matches/{most_recent_match_id}"

        match_res = await client.get(
            match_url,
            headers=headers
        )

        match_data = match_res.json()
        timeline_url = f"{RIOT_BASE_URL}/lol/match/v5/matches/{most_recent_match_id}/timeline"

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

    team_gold_data = []

    for member in team_members:
        participant_id = member["participantId"]
        gold_over_time = []

        for frame in timeline_data["info"]["frames"]:
            minute = frame["timestamp"] // 60000  # Convert ms to minutes
            if str(participant_id) in frame["participantFrames"]:
                total_gold = frame["participantFrames"][str(participant_id)]["totalGold"]
                gold_over_time.append([minute, total_gold])

        team_gold_data.append({
            "championName": member["championName"],
            "gold_over_time": gold_over_time,
            "isCurrentPlayer": member["puuid"] == puuid
        })

    return {
        "summonerInfo": {
            "gameName": gameName,
            "tagLine": tagLine,
            "championPlayed": current_participant["championName"],
            "win": current_participant["win"]
        },
        "team_gold_data": team_gold_data
    }

