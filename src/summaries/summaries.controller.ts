import { Controller, Get, Body, Param } from '@nestjs/common';
import { Summary } from './models/summary.entity';
import { SummaryService } from './summaries.service';
import { MatchesService } from '../matches/matches.service';
import { MatchesController } from '../matches/matches.controller';
import axios from 'axios';

@Controller('api')
export class SummariesController {
  constructor(
    private readonly summariesService: SummaryService,
    private readonly matchesService: MatchesService,
  ) {}

  @Get('/summary/:region/:summoner/queue=:queueid')
  async getSummary(
    @Param('region') region: string,
    @Param('summoner') summoner: string,
    @Param('queueid') queueid: number,
  ): Promise<Summary> {
    const result = await this.getData(region, summoner, queueid);
    const summary = await this.summariesService.findOne(result.puuid);
    if (!summary) {
      this.summariesService.create(result);
    }
    return result;
  }

  @Get('/leaderboard/:region/:summoner')
  async getLeaderBoard(
    @Param('region') region: string,
    @Param('summoner') summoner: string,
  ): Promise<any> {
    const puuid = await this.getPuuid(region, summoner);
    console.log(puuid);
    return {
      leaguePoints: { top: await this.summariesService.leaguePointRank(puuid) },
      winRate: { top: await this.summariesService.winRateRank(puuid) },
    };
  }

  async getPuuid(region: string, summoner: string): Promise<string> {
    const apiKey = process.env.X_RIOT_TOKEN;
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}`;
    const headers = { 'X-Riot-Token': apiKey };
    const response = await axios.get(url, { headers });
    const summonerData = response.data;
    return summonerData.puuid;
  }

  async getData(
    region: string,
    summoner: string,
    queueid: number,
  ): Promise<Summary> {
    const apiKey = process.env.X_RIOT_TOKEN;
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}`;
    const headers = { 'X-Riot-Token': apiKey };
    const response = await axios.get(url, { headers });
    const summonerData = response.data;
    const result = new Summary();
    result.puuid = summonerData.puuid;
    result.name = summonerData.name;
    result.image = `https://ddragon.leagueoflegends.com/cdn/11.14.1/img/profileicon/${summonerData.profileIconId}.png`;
    result.level = summonerData.summonerLevel;

    const extra_result = await this.getExtraData(region, summonerData.id);
    result.wins = extra_result.wins;
    result.loses = extra_result.loses;
    result.league_rank = extra_result.league_rank;

    console.log(summonerData.id);
    result.avgCsPerMinute = await this.matchesService.findAverageCsPerMinute(
      summonerData.puuid,
      queueid,
    );
    console.log(summonerData.id, result.avgCsPerMinute);
    result.avgVisionScore = await this.matchesService.findAverageVisionScore(
      summonerData.puuid,
      queueid,
    );

    result.kills = await this.matchesService.getKillsCount(
      summonerData.puuid,
      queueid,
    );

    result.dies = await this.matchesService.getDeathsCount(
      summonerData.puuid,
      queueid,
    );

    result.assists = await this.matchesService.getAssistsCount(
      summonerData.puuid,
      queueid,
    );

    result.league_point = extra_result.league_point;

    return result;
  }

  async getExtraData(region: string, summonerid: string): Promise<Summary> {
    const apiKey = process.env.X_RIOT_TOKEN;
    const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerid}`;
    const headers = { 'X-Riot-Token': apiKey };
    const response = await axios.get(url, { headers });
    const result = new Summary();
    if (response.data.length > 0) {
      const summonerData = response.data[0];
      result.wins = summonerData.wins ? summonerData.wins : 0;
      result.loses = summonerData.losses ? summonerData.losses : 0;
      result.league_rank = summonerData.rank;
      result.league_point = summonerData.leaguePoints;
    }
    return result;
  }
}
