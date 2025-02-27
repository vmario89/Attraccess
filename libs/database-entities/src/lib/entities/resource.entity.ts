import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceIntroduction } from './resourceIntroduction.entity';
import { ResourceUsage } from './resourceUsage.entity';
import { ResourceIntroductionUser } from './resourceIntroductionUser.entity';

@Entity()
export class Resource {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the resource',
    example: 1,
  })
  id!: number;

  @Column()
  @ApiProperty({
    description: 'The name of the resource',
    example: '3D Printer',
  })
  name!: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'A detailed description of the resource',
    example: 'Prusa i3 MK3S+ 3D printer with 0.4mm nozzle',
    required: false,
  })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'The filename of the resource image',
    example: '1234567890_abcdef.jpg',
    required: false,
  })
  imageFilename!: string | null;

  @Column({ type: 'float', default: 0 })
  @ApiProperty({
    description: 'Total hours the resource has been in use',
    example: 123.5,
  })
  totalUsageHours!: number;

  @CreateDateColumn()
  @ApiProperty({
    description: 'When the resource was created',
  })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'When the resource was last updated',
  })
  updatedAt!: Date;

  @OneToMany(
    () => ResourceIntroduction,
    (introduction) => introduction.resource
  )
  introductions!: ResourceIntroduction[];

  @OneToMany(() => ResourceUsage, (usage) => usage.resource)
  usages!: ResourceUsage[];

  @OneToMany(
    () => ResourceIntroductionUser,
    (introducer) => introducer.resource
  )
  introducers!: ResourceIntroductionUser[];
}
