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
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../../types/request';
import { AuthService } from '../auth/auth.service';
import { Auth, SystemPermission } from '../strategies/systemPermissions.guard';
import { CreateLocalUserDto } from './dtos/createLocalUser.dto';
import { EmailService } from '../../email/email.service';
import { GetUsersQueryDto } from './dtos/getUsersQuery.dto';
import { VerifyEmailDto } from './dtos/verifyEmail.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private emailService: EmailService
  ) {}

  @Post()
  async createUser(@Body() body: CreateLocalUserDto) {
    const user = await this.usersService.createOne(body.username, body.email);
    await this.authService.addAuthenticationDetails(user.id, {
      type: body.strategy,
      details: {
        password: body.password,
      },
    });

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
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll({
      page: query.page,
      limit: query.limit,
    });
  }
}
