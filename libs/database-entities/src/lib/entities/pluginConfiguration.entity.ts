import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LOAD_PLUGIN_STATUS {
  SUCCESS = 'success',
  VERSION_MISMATCH = 'version_mismatch',
  MANIFEST_ERROR = 'manifest_error',
  MODULE_LOAD_ERROR = 'module_load_error',
}

@Entity()
export class PluginConfiguration extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the plugin configuration',
    example: 1,
  })
  id!: number;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'The name of the plugin',
    example: 'My Plugin',
  })
  name!: string;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'The path to the plugin',
    example: 'plugins/my-plugin',
  })
  fsPath!: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({
    description: 'Whether the plugin is enabled',
    example: false,
  })
  enabled!: boolean;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({
    description: 'Whether the plugin was loaded successfully last time',
    example: false,
  })
  lastLoadWasSuccessfull!: boolean;

  @Column({ type: 'text', nullable: true, default: 'NO LOAD ATTEMPTED YET' })
  @ApiProperty({
    description: 'The error message from the last load attempt',
    example: 'Module load failed',
  })
  lastLoadErrorMessage!: string | null;
}
