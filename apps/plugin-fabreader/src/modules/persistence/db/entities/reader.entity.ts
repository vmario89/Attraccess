import { Column, Entity } from 'typeorm';

import { PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Reader {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  apiTokenHash: string;

  @Column({
    type: 'simple-array',
    default: '',
  })
  hasAccessToResourceIds: number[];

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastConnection: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  firstConnection: Date;
}
