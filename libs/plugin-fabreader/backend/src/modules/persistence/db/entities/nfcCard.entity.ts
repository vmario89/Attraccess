import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

import { PrimaryGeneratedColumn } from 'typeorm';

class NTag424Keys {
  @Column({
    type: 'text',
    nullable: false,
    default: Array(16).fill('0').join(''),
  })
  '0': string; // master key
}

@Entity()
export class NFCCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  uid: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  userId: number;

  @Column(() => NTag424Keys, { prefix: 'key_' })
  keys: NTag424Keys;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
