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
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../../types/request';
import { AuthService } from '../auth/auth.service';
import { Auth } from '../strategies/systemPermissions.guard';
import { EmailService } from '../../email/email.service';
import { GetUsersQueryDto } from './dtos/getUsersQuery.dto';
import { VerifyEmailDto } from './dtos/verifyEmail.dto';
import { AuthenticationDetail, User } from '@attraccess/database-entities';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/createUser.dto';
import { PaginatedUsersResponseDto } from './dtos/paginatedUsersResponse.dto';
import { UserNotFoundException } from '../../exceptions/user.notFound.exception';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

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
    this.logger.debug(
      `Creating new user with username: ${body.username} and email: ${body.email}`
    );

    const user = await this.usersService.createOne(body.username, body.email);
    this.logger.debug(`User created with ID: ${user.id}`);

    let authenticationDetails: AuthenticationDetail | null = null;
    try {
      this.logger.debug(
        `Adding authentication details for user ID: ${user.id}, strategy: ${body.strategy}`
      );
      authenticationDetails = await this.authService.addAuthenticationDetails(
        user.id,
        {
          type: body.strategy,
          details: {
            password: body.password,
          },
        }
      );
      this.logger.debug(
        `Authentication details added with ID: ${authenticationDetails.id}`
      );
    } catch (e) {
      this.logger.error(
        `Error adding authentication details for user ID: ${user.id}`,
        e.stack
      );
      await this.usersService.deleteOne(user.id);
      throw e;
    }

    try {
      this.logger.debug(
        `Generating email verification token for user ID: ${user.id}`
      );
      const verificationToken =
        await this.authService.generateEmailVerificationToken(user);
      this.logger.debug(`Sending verification email to user ID: ${user.id}`);
      await this.emailService.sendVerificationEmail(user, verificationToken);
      this.logger.debug(`Verification email sent to user ID: ${user.id}`);
    } catch (e) {
      this.logger.error(
        `Error sending verification email for user ID: ${user.id}`,
        e.stack
      );
      if (authenticationDetails) {
        await this.authService.removeAuthenticationDetails(
          authenticationDetails.id
        );
      }
      await this.usersService.deleteOne(user.id);
      throw e;
    }

    this.logger.debug(
      `User creation completed successfully for ID: ${user.id}`
    );
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
    this.logger.debug(
      `Verifying email for: ${body.email} with token: ${body.token.substring(
        0,
        5
      )}...`
    );
    await this.authService.verifyEmail(body.email, body.token);
    this.logger.debug(`Email verified successfully for: ${body.email}`);
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
    this.logger.debug(`Getting current user, ID: ${request.user.id}`);
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
    this.logger.debug(
      `Getting user by ID: ${id}, requested by user ID: ${request.user.id}`
    );
    const authenticatedUser = request.user;

    if (authenticatedUser?.id !== id) {
      this.logger.debug(
        `Access denied - User ID ${authenticatedUser.id} attempting to access user ID ${id}`
      );
      throw new ForbiddenException();
    }

    this.logger.debug(`Fetching user from database, ID: ${id}`);
    const user = await this.usersService.findOne({ id });
    if (!user) {
      this.logger.debug(`User not found with ID: ${id}`);
      throw new UserNotFoundException(id);
    }

    this.logger.debug(`User found with ID: ${id}`);
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
    this.logger.debug(
      `Getting users list with page: ${query.page}, limit: ${
        query.limit
      }, search: ${query.search || 'none'}`
    );
    const result = await this.usersService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    this.logger.debug(
      `Found ${result.total} users total, returning ${result.data.length} users`
    );
    return result;
  }
}
