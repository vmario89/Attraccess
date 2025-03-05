import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Repository,
  ILike,
  FindOneOptions as TypeormFindOneOptions,
} from 'typeorm';
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
import { UserNotFoundException } from '../../exceptions/user.notFound.exception';

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

class UserEmailAlreadyInUseException extends BadRequestException {
  constructor() {
    super('UserEmailAlreadyInUseException');
  }
}

class UserUsernameAlreadyInUseException extends BadRequestException {
  constructor() {
    super('UserUsernameAlreadyInUseException');
  }
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findOne(options: FindOneOptions): Promise<User | null> {
    const validatedOptions = FindOneOptionsSchema.parse(options);

    // Build a where condition that uses case-insensitive comparison for username
    const whereCondition: TypeormFindOneOptions<User>['where'] = {};

    if (validatedOptions.id !== undefined) {
      whereCondition.id = validatedOptions.id;
    }

    if (validatedOptions.username !== undefined) {
      whereCondition.username = ILike(validatedOptions.username);
    }

    if (validatedOptions.email !== undefined) {
      whereCondition.email = validatedOptions.email;
    }

    const user = await this.userRepository.findOne({
      where: whereCondition,
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

    // Check if this is the first user in the system
    const totalUsers = await this.userRepository.count();
    if (totalUsers === 0) {
      // This is the first user, grant all system permissions
      user.systemPermissions = {
        canManageResources: true,
        canManageUsers: true,
        canManagePermissions: true,
      };
    }

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
        throw new UserEmailAlreadyInUseException();
      }
    }

    // If username is being updated, check for case-insensitive uniqueness
    if (updates.username) {
      const existingUsername = await this.findOne({
        username: updates.username,
      });
      if (existingUsername && existingUsername.id !== id) {
        throw new UserUsernameAlreadyInUseException();
      }
    }

    await this.userRepository.update(id, updates);
    const updatedUser = await this.findOne({ id });
    if (!updatedUser) {
      throw new UserNotFoundException(id);
    }
    return updatedUser;
  }

  async findAll(
    options: PaginationOptions & { search?: string }
  ): Promise<PaginatedResponseDto<User>> {
    const paginationOptions = PaginationOptionsSchema.parse(options);
    const { search } = options;
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      where: {
        username: search ? ILike(`%${search}%`) : undefined,
        email: search ? ILike(`%${search}%`) : undefined,
      },
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
