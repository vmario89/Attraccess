import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AuthenticationDetail } from './authenticationDetail.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

class SystemPermissions {
  @Column({ default: false })
  canManageUsers: boolean;

  @Column({ default: false })
  canManageMachineDefinitions: boolean;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @ApiProperty()
  username: string;

  @Column({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ default: false })
  @ApiProperty()
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationToken: string;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationTokenExpiresAt: Date;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => AuthenticationDetail, (authDetail) => authDetail.user)
  @Exclude()
  authenticationDetails: AuthenticationDetail[];

  @Column(() => SystemPermissions)
  @ApiProperty()
  systemPermissions: SystemPermissions;
}
