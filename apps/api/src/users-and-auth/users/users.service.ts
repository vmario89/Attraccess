import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '@attraccess/database-entities';
import { InjectRepository } from '@nestjs/typeorm';
import {
  makePaginatedResponse,
  PaginatedResponseDto,
} from '../../types/response';
import {
  PaginationOptions,
  PaginationOptionsSchema,
} from '../../types/request';
import { z } from 'zod';

const FindOneOptionsSchema = z
  .object({
    id: z.number(),
    username: z.string().min(1),
    email: z.string().email(),
  })
  .partial()
  .refine(
    ({ id, username, email }) =>
      id !== undefined || username !== undefined || email !== undefined,
    { message: 'At least one search criteria must be provided' }
  );

type FindOneOptions = z.infer<typeof FindOneOptionsSchema>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findOne(options: FindOneOptions): Promise<User | null> {
    const validatedOptions = FindOneOptionsSchema.parse(options);

    const user = await this.userRepository.findOne({
      where: {
        id: validatedOptions.id,
        username: validatedOptions.username,
        email: validatedOptions.email,
      },
    });

    return user || null;
  }

  async createOne(username: string, email: string): Promise<User> {
    // Check for existing email
    const existingEmail = await this.findOne({ email });
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    // Check for existing username
    const existingUsername = await this.findOne({ username });
    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    const user = new User();
    user.username = username;
    user.email = email;
    return this.userRepository.save(user);
  }

  async deleteOne(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    // If email is being updated, check for uniqueness
    if (updates.email) {
      const existingEmails = await this.userRepository.find({
        where: { email: updates.email },
      });

      if (existingEmails.some((user) => user.id !== id)) {
        throw new BadRequestException('Email already exists');
      }
    }

    await this.userRepository.update(id, updates);
    const updatedUser = await this.findOne({ id });
    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }
    return updatedUser;
  }

  async findAll(
    options: PaginationOptions
  ): Promise<PaginatedResponseDto<User>> {
    const paginationOptions = PaginationOptionsSchema.parse(options);
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
    });

    return makePaginatedResponse(
      {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      users,
      total
    );
  }
}
