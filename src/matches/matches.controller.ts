import { Controller, Get, Body, Param, Query } from '@nestjs/common';
import { Match } from './models/match.entity';
import { MatchesService } from './matches.service';
import axios from 'axios';

@Controller('api/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get(':region/:summoner')
  async recentMatches(
    @Param('region') region: string,
    @Param('summoner') summoner: string,
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('queue') queueid: number,
  ): Promise<Match[]> {
    // const { region, summoner, page, size, queueid } = payload;
    const puuid = await this.getPuuid(region, summoner);
    if ((await this.matchesService.count(puuid, queueid)) === 0) {
      await this.saveAllMatches(puuid, queueid);
    }
    const puuid = await this.getPuuid(region, summoner);
    return this.matchesService.findRecent(page, size, queueid);
  }

  async saveAllMatches(puuid: string, queueid: number) {
    const apiKey = process.env.X_RIOT_TOKEN;

    for (let i = 0; ; i++) {
      const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${
        i * 30
      }&count=${30}&queue=${queueid}`;
      const headers = { 'X-Riot-Token': apiKey };
      const response = await axios.get(url, { headers });

      const matchIds = response.data;
      if (matchIds.length == 0) break;
      console.log(matchIds.length);
      for (const matchId of matchIds) {
        await this.saveOneMatch(matchId, puuid);
      }
    }
  }

  async saveOneMatch(matchid: string, puuid: string) {
    const apiKey = process.env.X_RIOT_TOKEN;
    const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchid}`;
    const headers = { 'X-Riot-Token': apiKey };
    let delay = 1000;
    const response = await axios.get(url, { headers }).catch((error) => {
      if (error.response && error.response.status === 429) {
        // if rate limit exceeded, wait for increasing amount of time
        delay *= 2;
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          delay += parseInt(retryAfter) * 1000;
        }
        console.log(
          `Rate limit exceeded, waiting for ${delay / 1000} seconds...`,
        );
        return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
          axios.get(url, { headers }),
        );
      } else {
        throw error;
      }
    });
    const matchData = response.data;
    const match = new Match();

    for (let participant of matchData.info.participants) {
      if (participant.puuid === puuid) {
        match.puuid = participant.puuid;
        match.kills = participant.kills;
        match.deaths = participant.deaths;
        match.assist = participant.assists;
        match.level = participant.champLevel;
        match.champion = participant.championName;
        match.KDA =
          participant.challenges && participant.challenges.kda
            ? participant.challenges.kda
            : 0;
        match.csPerMinute = participant.csPerMinute;
        match.name = participant.summonerName;
        match.visionScore = participant.visionScore;
        match.spell1Cast = participant.spell1Casts;
        match.spell2Cast = participant.spell2Casts;
        match.spell3Cast = participant.spell3Casts;
        match.spell4Cast = participant.spell4Casts;
        match.csPerMinute = participant.totalMinionsKilled / 15;
        match.win = participant.win;
        match.queueid = matchData.info.queueId;
        break;
      }
    }
    this.matchesService.create(match);
  }

  async getPuuid(region: string, summoner: string): Promise<string> {
    const apiKey = process.env.X_RIOT_TOKEN;
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}`;
    const headers = { 'X-Riot-Token': apiKey };
    const response = await axios.get(url, { headers });
    const summonerData = response.data;
    const puuid = summonerData.puuid;
    return puuid;
  }

  async findAverageCsPerMinute(
    puuid: string,
    queueid: number,
  ): Promise<number> {
    return this.matchesService.findAverageCsPerMinute(puuid, queueid);
  }

  async findAverageVisionScore(
    puuid: string,
    queueid: number,
  ): Promise<number> {
    return this.matchesService.findAverageVisionScore(puuid, queueid);
  }
}
