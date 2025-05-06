import { ApiProperty } from '@nestjs/swagger';
import { FileUpload } from '../../common/types/file-upload.types';

export class UploadPluginDto {
  @ApiProperty({
    description: 'Overwrite existing plugin',
    required: false,
    type: 'boolean',
  })
  overwrite?: boolean;

  @ApiProperty({
    description: 'Plugin zip file',
    required: true,
    type: 'string',
    format: 'binary',
  })
  pluginZip?: FileUpload;
}
