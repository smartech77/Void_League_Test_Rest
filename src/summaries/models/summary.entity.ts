import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: '' })
  puuid: string;

  @Column({ nullable: true, default: '' })
  name: string;

  @Column({ nullable: true, default: '' })
  image: string;

  @Column({ nullable: true, default: 0 })
  level: number;

  @Column({ nullable: true, default: '' })
  league_rank: string;

  @Column({ nullable: true, default: 0 })
  league_point: number;

  @Column({ nullable: true, default: 0 })
  wins: number;

  @Column({ nullable: true, default: 0 })
  loses: number;

  @Column({ nullable: true, default: 0 })
  kills: number;

  @Column({ nullable: true, default: 0 })
  dies: number;

  @Column({ nullable: true, default: 0 })
  assists: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  avgCsPerMinute: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  avgVisionScore: number;
}
