import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

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

export class PluginMainBackend {
  @ApiProperty({
    description: 'The directory of the plugins backend files',
    example: 'backend',
  })
  directory: string;

  @ApiProperty({
    description: 'The entry point of the plugin, relative to the backend directory',
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
    example: {
      directory: 'backend',
      entryPoint: 'src/plugin.js',
    },
  })
  backend?: PluginMainBackend;
}

export class PluginFabAccessVersion {
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
    type: PluginFabAccessVersion,
  })
  fabaccessVersion: PluginFabAccessVersion;
}

export class LoadedPluginManifest extends PluginManifest {
  @ApiProperty({
    description: 'The directory of the plugin',
    example: 'plugin-name',
  })
  pluginDirectory: string;

  @ApiProperty({
    description: 'The id of the plugin',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}

const mainSchema = z.object({
  directory: z.string(),
  entryPoint: z.string(),
});

export const PluginManifestSchema = z.object({
  name: z.string(),
  main: z.object({
    frontend: mainSchema,
    backend: mainSchema,
  }),
  version: z.string(),
  fabaccessVersion: z
    .object({
      min: z.string().optional(),
      max: z.string().optional(),
      exact: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.min && data.max) {
          return data.min <= data.max;
        }

        return true;
      },
      { message: 'min must be less than or equal to max' }
    )
    .refine(
      (data) => {
        if (!data.min && !data.max && !data.exact) {
          return false;
        }

        return true;
      },
      { message: 'min, max or exact must be provided' }
    ),
});
