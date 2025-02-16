import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class RevokedToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tokenId: string;

  @CreateDateColumn()
  revokedAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
