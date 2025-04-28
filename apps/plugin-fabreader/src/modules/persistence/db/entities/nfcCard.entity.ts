import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

import { PrimaryGeneratedColumn } from 'typeorm';

class NTag424Keys {
  @Column({
    type: 'text',
    nullable: false,
  })
  '0': string; // master key

  @Column({
    type: 'text',
    nullable: false,
  })
  '1': string; // app auth key

  @Column({
    type: 'text',
    nullable: false,
  })
  '2': string; // app read key

  @Column({
    type: 'text',
    nullable: false,
  })
  '3': string; // app write key

  @Column({
    type: 'text',
    nullable: false,
  })
  '4': string; // app read write key
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

  @Column({
    type: 'text',
    nullable: false,
  })
  verificationToken: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  antiDuplicationToken: string;

  @Column(() => NTag424Keys, { prefix: '' })
  keys: NTag424Keys;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
