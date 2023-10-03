import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { MatchesModule } from './matches/matches.module';
import { SummariesModule } from './summaries/summaries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    DatabaseModule,
    MatchesModule,
    SummariesModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
