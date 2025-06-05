import { NotFoundException } from '@nestjs/common';

export class ResourceGroupNotFoundException extends NotFoundException {
  constructor(identifier: unknown) {
    super('ResourceGroupNotFound', {
      cause: `Resource group with identifier ${identifier} not found`,
    });
  }
}
