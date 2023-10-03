import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: '' })
  puuid: string;

  @Column({ nullable: true, default: '' })
  name: string;

  @Column({ nullable: true, default: '' })
  champion: string;

  @Column({ type: 'float', nullable: true, default: 0 })
  KDA: number;

  @Column({ nullable: true, default: 0 })
  visionScore: number;

  @Column({ type: 'float', default: 0 })
  csPerMinute: number;

  @Column({ nullable: true, default: '' })
  level: string;

  @Column({ nullable: true, default: false })
  win: boolean;

  @Column({ nullable: true, default: 0 })
  kills: number;

  @Column({ nullable: true, default: 0 })
  deaths: number;

  @Column({ nullable: true, default: 0 })
  assist: number;

  @Column({ nullable: true, default: 0 })
  spell1Cast: number;

  @Column({ nullable: true, default: 0 })
  spell2Cast: number;

  @Column({ nullable: true, default: 0 })
  spell3Cast: number;

  @Column({ nullable: true, default: 0 })
  spell4Cast: number;

  @Column({ nullable: true, default: 0 })
  queueid: number;
}
