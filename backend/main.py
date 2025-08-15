import requests
import os
from fastapi import FastAPI, Depends, HTTPException, Header
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
def get_most_recent_game_stats(gameName: str, tagLine: str):
    if not RIOT_API_KEY:
        raise HTTPException(500, "Server missing API key")
    headers = {"X-Riot-Token": RIOT_API_KEY}
    account_url = f"{RIOT_BASE_URL}/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}"

    try:
        res = requests.get(account_url, headers=headers)
        res.raise_for_status()

        summoner_data = res.json()
        puuid = summoner_data.get("puuid")

        if not puuid:
            raise HTTPException(status_code=404, detail="PUUID not found for the given summoner.")
    except requests.exceptions.HTTPError as err:
        if err.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Summoner not found.")
        elif err.response.status_code == 403:
            raise HTTPException(status_code=403, detail="Invalid API Key. Please check your Riot API key.")
        else:
            raise HTTPException(status_code=err.response.status_code, detail=f"An error occurred: {err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    match_history_url = f"{RIOT_BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids?count=1"

    try:
        match_history_res = requests.get(match_history_url, headers=headers)
        match_history_res.raise_for_status()
        match_ids = match_history_res.json()

        if not match_ids:
            raise HTTPException(status_code=404, detail="No matches found for this summoner.")

        most_recent_match_id = match_ids[0]

        if not most_recent_match_id:
            raise HTTPException(status_code=404, detail="Most recent match ID not found.")
    except requests.exceptions.HTTPError as err:
        raise HTTPException(status_code=err.response.status_code,
                        detail=f"An error occurred while fetching match IDs: {err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during match ID retrieval: {str(e)}")

    match_url = f"{RIOT_BASE_URL}/lol/match/v5/matches/{most_recent_match_id}"

    try:
        match_res = requests.get(match_url, headers=headers)
        match_res.raise_for_status()
        match_data = match_res.json()

        player_stats = None
        for participant in match_data.get("info", {}).get("participants", []):
            if participant.get("puuid") == puuid:
                player_stats = participant
                break

        if not player_stats:
            raise HTTPException(status_code=404, detail="Player's stats not found in the match data.")

        analytics = {
            "gameName": player_stats.get("riotIdGameName"),
            "tagLine": player_stats.get("riotIdTagline"),
            "championPlayed": player_stats.get("championName"),
            "kills": player_stats.get("kills"),
            "deaths": player_stats.get("deaths"),
            "assists": player_stats.get("assists"),
            "win": player_stats.get("win"),
            "totalMinionsKilled": player_stats.get("totalMinionsKilled"),
            "goldEarned": player_stats.get("goldEarned"),
            "matchId": most_recent_match_id
        }
    except requests.exceptions.HTTPError as err:
        raise HTTPException(status_code=err.respones.status_code,
                            detail=f"An error occurred wihle fetching match ID: {err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    timeline_url = f"{RIOT_BASE_URL}/lol/match/v5/matches/{most_recent_match_id}/timeline"
    try:
        timeline_response = requests.get(timeline_url, headers=headers)
        timeline_response.raise_for_status()
        timeline_data = timeline_response.json()
    except requests.exceptions.HTTPError as err:
        raise HTTPException(status_code=err.response.status_code,
                            detail=f"An error occurred while fetching timeline data: {err}")

    gold_over_time_data = []
    frames = timeline_data.get("info", {}).get("frames", [])

    for frame in frames:
        minute = frame.get("timestamp") // 60000  # Convert milliseconds to minutes
        participant_frames = frame.get("participantFrames", {})

        for participant_id, participant_data in participant_frames.items():
            if participant_data.get("participantId") == player_stats.get("participantId"):
                gold_over_time_data.append(participant_data.get("totalGold"))
                break

    analytics = {
        "summonerInfo": {
            "gameName": player_stats.get("riotIdGameName"),
            "tagLine": player_stats.get("riotIdTagline"),
            "championPlayed": player_stats.get("championName"),
            "win": player_stats.get("win")
        },
        "gold_over_time_data": gold_over_time_data,
        "matchId": most_recent_match_id
    }

    return analytics

