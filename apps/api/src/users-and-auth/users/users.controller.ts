import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  Body,
  Inject,
  forwardRef,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../../types/request';
import { AuthService } from '../auth/auth.service';
import { Auth } from '../strategies/systemPermissions.guard';
import { EmailService } from '../../email/email.service';
import { GetUsersQueryDto } from './dtos/getUsersQuery.dto';
import { VerifyEmailDto } from './dtos/verifyEmail.dto';
import { User } from '@attraccess/database-entities';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/createUser.dto';
import { PaginatedUsersResponseDto } from './dtos/paginatedUsersResponse.dto';
import { UserNotFoundException } from '../../exceptions/user.notFound.exception';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly emailService: EmailService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  async createUser(@Body() body: CreateUserDto): Promise<User> {
    const user = await this.usersService.createOne(body.username, body.email);

    try {
      await this.authService.addAuthenticationDetails(user.id, {
        type: body.strategy,
        details: {
          password: body.password,
        },
      });
    } catch (e) {
      await this.usersService.deleteOne(user.id);
      throw e;
    }

    const verificationToken =
      await this.authService.generateEmailVerificationToken(user);
    await this.emailService.sendVerificationEmail(user, verificationToken);

    return user;
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify a user email address' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email verified successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or email.',
  })
  async verifyEmail(@Body() body: VerifyEmailDto) {
    await this.authService.verifyEmail(body.email, body.token);
    return { message: 'Email verified successfully' };
  }

  @Auth()
  @Get('me')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'The current user.',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'User is not authenticated.',
  })
  async getMe(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Auth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user with the specified ID.',
    type: User,
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to access this resource.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    type: UserNotFoundException,
  })
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest
  ): Promise<User> {
    const authenticatedUser = request.user;

    if (authenticatedUser?.id !== id) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get a paginated list of users' })
  @ApiResponse({
    status: 200,
    description: 'List of users.',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to manage users.',
  })
  async getUsers(
    @Query() query: GetUsersQueryDto
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }
}
