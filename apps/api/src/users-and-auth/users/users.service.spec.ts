import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@attraccess/database-entities';
import { Repository, UpdateResult } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should validate options using Zod', async () => {
      await expect(service.findOne({})).rejects.toThrow(
        'At least one search criteria must be provided'
      );
    });

    it('should find a user by id', async () => {
      const user = { id: 1, username: 'test' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne({ id: 1 });
      expect(result).toEqual(user);
    });

    it('should find a user by username', async () => {
      const user = { id: 1, username: 'test' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne({ username: 'test' });
      expect(result).toEqual(user);
    });

    it('should find a user by email', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne({ email: 'test@example.com' });
      expect(result).toEqual(user);
    });

    it('should validate email format', async () => {
      await expect(
        service.findOne({ email: 'invalid-email' })
      ).rejects.toThrow();
    });
  });

  describe('createOne', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
      } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

      const result = await service.createOne('test', 'test@example.com');
      expect(result).toEqual(newUser);
    });

    it('should throw if email already exists', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ id: 1 } as User);

      await expect(
        service.createOne('test', 'existing@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if username already exists', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: 1 } as User); // username check

      await expect(
        service.createOne('existing', 'test@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const user = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
      } as User;
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.updateUser(1, { username: 'updated' });
      expect(result).toEqual(user);
    });

    it('should check email uniqueness on update', async () => {
      const existingUsers = [{ id: 2, email: 'existing@example.com' } as User];
      jest.spyOn(userRepository, 'find').mockResolvedValue(existingUsers);

      await expect(
        service.updateUser(1, { email: 'existing@example.com' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow updating to same email', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      const existingUsers = [user];
      jest.spyOn(userRepository, 'find').mockResolvedValue(existingUsers);
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.updateUser(1, { email: 'test@example.com' });
      expect(result).toEqual(user);
    });

    it('should throw if user not found', async () => {
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateUser(1, { username: 'test' })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: 1 }, { id: 2 }] as User[];
      jest.spyOn(userRepository, 'findAndCount').mockResolvedValue([users, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual(users);
      expect(result.total).toBe(2);
    });

    it('should validate pagination options', async () => {
      await expect(service.findAll({ page: 0, limit: 10 })).rejects.toThrow();
      await expect(service.findAll({ page: 1, limit: 0 })).rejects.toThrow();
    });
  });
});
