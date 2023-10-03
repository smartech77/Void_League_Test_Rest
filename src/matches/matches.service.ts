import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './models/match.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    public matchRepository: Repository<Match>,
  ) {}

  async findAll(): Promise<Match[]> {
    return await this.matchRepository.find();
  }

  async count(puuid: string, queueid: number): Promise<number> {
    return await this.matchRepository.count({
      where: { puuid: puuid, queueid: queueid },
    });
  }

  async findAverageCsPerMinute(
    puuid: string,
    queueid: number,
  ): Promise<number> {
    const result = await this.matchRepository
      .createQueryBuilder('match')
      .select('AVG(match.csPerMinute)', 'average')
      .where('match.puuid = :puuid', { puuid })
      .andWhere('match.queueid = :queueid', { queueid })
      .getRawOne();
    return result.average;
  }

  async findAverageVisionScore(
    puuid: string,
    queueid: number,
  ): Promise<number> {
    const result = await this.matchRepository
      .createQueryBuilder('match')
      .select('AVG(match.visionScore)', 'average')
      .where('match.puuid = :puuid', { puuid })
      .andWhere('match.queueid = :queueid', { queueid })
      .getRawOne();
    return result.average;
  }

  async getKillsCount(puuid: string, queueid: number): Promise<number> {
    const result = await this.matchRepository
      .createQueryBuilder('match')
      .select('SUM(match.kills)', 'totalKills')
      .where('match.puuid = :puuid', { puuid })
      .andWhere('match.queueid = :queueid', { queueid })
      .getRawOne();
    return result.totalKills;
  }

  async getDeathsCount(puuid: string, queueid: number): Promise<number> {
    const result = await this.matchRepository
      .createQueryBuilder('match')
      .select('SUM(match.deaths)', 'totalDeaths')
      .where('match.puuid = :puuid', { puuid })
      .andWhere('match.queueid = :queueid', { queueid })
      .getRawOne();
    return result.totalDeaths;
  }

  async getAssistsCount(puuid: string, queueid: number): Promise<number> {
    const result = await this.matchRepository
      .createQueryBuilder('match')
      .select('SUM(match.assist)', 'totalAssists')
      .where('match.puuid = :puuid', { puuid })
      .andWhere('match.queueid = :queueid', { queueid })
      .getRawOne();
    return result.totalAssists;
  }

  async findRecent(
    page: number,
    size: number,
    queueid: number,
  ): Promise<Match[]> {
    const skip = page * size;
    const take = size;
    return await this.matchRepository.find({
      skip,
      take,
      where: { queueid: queueid },
    });
  }

  async findOne(id: number): Promise<Match> {
    return await this.matchRepository.findOne({ where: { id } });
  }

  async create(user: Partial<Match>): Promise<Match> {
    const newuser = this.matchRepository.create(user);
    return await this.matchRepository.save(newuser);
  }

  async update(id: number, user: Partial<Match>): Promise<Match> {
    await this.matchRepository.update(id, user);
    return await this.matchRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.matchRepository.delete(id);
  }
}
