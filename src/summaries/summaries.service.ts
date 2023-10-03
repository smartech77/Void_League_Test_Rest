import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Summary } from './models/summary.entity';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Summary)
    private summaryRepository: Repository<Summary>,
  ) {}

  async findAll(): Promise<Summary[]> {
    return this.summaryRepository.find();
  }

  async findOne(puuid: string): Promise<Summary> {
    return this.summaryRepository.findOne({ where: { puuid: puuid } });
  }

  async create(user: Partial<Summary>): Promise<Summary> {
    const newuser = this.summaryRepository.create(user);
    return this.summaryRepository.save(newuser);
  }

  async leaguePointRank(puuid: string): Promise<number> {
    const my_summary = await this.summaryRepository.findOne({
      where: { puuid: puuid },
    });
    const rank = await this.summaryRepository
      .createQueryBuilder('summary')
      .select('COUNT(*) + 1', 'rank')
      .where('summary.league_point > :myleague_point', {
        myleague_point: my_summary.league_point,
      })
      .getRawOne();
    return rank.rank;
  }

  async winRateRank(puuid: string): Promise<number> {
    const my_summary = await this.summaryRepository.findOne({
      where: { puuid: puuid },
    });
    const rank = await this.summaryRepository
      .createQueryBuilder('summary')
      .select('COUNT(*) + 1', 'rank')
      .where(
        'summary.wins * :mysum > :mywin * (summary.wins + summary.loses)',
        {
          mywin: my_summary.wins,
          mysum: my_summary.wins + my_summary.loses,
        },
      )
      .getRawOne();
    return rank.rank;
  }

  async update(id: number, user: Partial<Summary>): Promise<Summary> {
    await this.summaryRepository.update(id, user);
    return this.summaryRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.summaryRepository.delete(id);
  }
}
