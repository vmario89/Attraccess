import { BadRequestException } from '@nestjs/common';

export class FileUploadValidationError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'FileUploadValidationError';
  }
}
