import { ApiProperty } from '@nestjs/swagger';

export class PluginMainFrontend {
  @ApiProperty({
    description: 'The directory of the plugins frontend files',
    example: 'frontend',
  })
  directory: string;

  @ApiProperty({
    description: 'The entry point of the plugin, relative to the frontend directory',
    example: 'index.mjs',
  })
  entryPoint: string;
}

export class PluginMain {
  @ApiProperty({
    description: 'The frontend files of the plugin',
    example: {
      directory: 'frontend',
      entryPoint: 'index.mjs',
    },
  })
  frontend?: PluginMainFrontend;

  @ApiProperty({
    description: 'The backend file of the plugin',
    example: 'backend/src/plugin.js',
  })
  backend?: string;
}

export class PluginAttraccessVersion {
  @ApiProperty({
    description: 'The minimum version of the plugin',
    example: '1.0.0',
  })
  min?: string;

  @ApiProperty({
    description: 'The maximum version of the plugin',
    example: '1.0.0',
  })
  max?: string;

  @ApiProperty({
    description: 'The exact version of the plugin',
    example: '1.0.0',
  })
  exact?: string;
}

export class PluginManifest {
  @ApiProperty({
    description: 'The name of the plugin',
    example: 'plugin-name',
  })
  name: string;

  @ApiProperty({
    type: PluginMain,
  })
  main: PluginMain;

  @ApiProperty({
    description: 'The version of the plugin',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    type: PluginAttraccessVersion,
  })
  attraccessVersion: PluginAttraccessVersion;
}
