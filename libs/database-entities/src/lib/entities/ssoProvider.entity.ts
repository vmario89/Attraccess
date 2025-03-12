import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SSOProviderOIDCConfiguration } from './ssoProvider.oidc';

export enum SSOProviderType {
  OIDC = 'OIDC',
}

@Entity()
export class SSOProvider {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the provider',
    example: 1,
  })
  id!: number;

  @Column()
  @ApiProperty({
    description: 'The internal name of the provider',
    example: 'Keycloak',
  })
  name!: string;

  @Column({
    type: 'simple-enum',
    enum: SSOProviderType,
  })
  @ApiProperty({
    description: 'The type of the provider',
    example: 'OIDC',
  })
  type!: SSOProviderType;

  @CreateDateColumn()
  @ApiProperty({
    description: 'When the user was created',
  })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'When the user was last updated',
  })
  updatedAt!: Date;

  @OneToOne(
    () => SSOProviderOIDCConfiguration,
    (oidcConfiguration) => oidcConfiguration.ssoProvider
  )
  oidcConfiguration!: SSOProviderOIDCConfiguration;
}
