import { Module } from '@nestjs/common';
import { SummaryService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { Summary } from './models/summary.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesController } from 'src/matches/matches.controller';
import { MatchesModule } from 'src/matches/matches.module';

@Module({
  imports: [TypeOrmModule.forFeature([Summary]), MatchesModule],
  providers: [SummaryService],
  controllers: [SummariesController],
})
export class SummariesModule {}
