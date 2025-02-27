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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../../types/request';
import { AuthService } from '../auth/auth.service';
import { Auth, SystemPermission } from '../strategies/systemPermissions.guard';
import { EmailService } from '../../email/email.service';
import { GetUsersQueryDto } from './dtos/getUsersQuery.dto';
import { VerifyEmailDto } from './dtos/verifyEmail.dto';
import { User } from '@attraccess/database-entities';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../types/response';
import { CreateUserDto } from './dtos/createUser.dto';

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
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
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
  async verifyEmail(@Body() body: VerifyEmailDto) {
    await this.authService.verifyEmail(body.email, body.token);
    return { message: 'Email verified successfully' };
  }

  @Auth()
  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'The current user.',
    type: User,
  })
  async getMe(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Auth()
  @Get(':id')
  async getUserById(
    @Param('id') idString: string,
    @Req() request: AuthenticatedRequest
  ) {
    const id = parseInt(idString);
    const authenticatedUser = request.user;

    if (authenticatedUser?.id !== id) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new ForbiddenException();
    }

    return user;
  }

  @Get()
  @Auth(SystemPermission.canManageUsers)
  @ApiResponse({
    status: 200,
    description: 'List of users.',
    type: PaginatedResponseDto,
  })
  async getUsers(
    @Query() query: GetUsersQueryDto
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.findAll({
      page: query.page,
      limit: query.limit,
    });
  }
}
