import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity()
export class RevokedToken {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the revoked token',
    example: 1,
  })
  id!: number;

  @Column()
  @ApiProperty({
    description: 'The ID of the user who owned the token',
    example: 1,
  })
  userId!: number;

  @Column()
  @ApiProperty({
    description: 'The JWT token that was revoked',
  })
  token!: string;

  @Column()
  @ApiProperty({
    description: 'The unique identifier of the token',
  })
  tokenId!: string;

  @Column({ type: 'datetime' })
  @ApiProperty({
    description: 'When the token expires',
  })
  expiresAt!: Date;

  @CreateDateColumn()
  @ApiProperty({
    description: 'When the token was revoked',
  })
  revokedAt!: Date;

  @ManyToOne(() => User, (user) => user.revokedTokens)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
