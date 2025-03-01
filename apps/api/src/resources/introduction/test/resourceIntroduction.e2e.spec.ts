import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app/app.module';
import { UsersService } from '../../../users-and-auth/users/users.service';
import { AuthService } from '../../../users-and-auth/auth/auth.service';
import { AuthenticationType, User } from '@attraccess/database-entities';
import { ResourcesService } from '../../resources.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SystemPermission } from '../../../users-and-auth/strategies/systemPermissions.guard';

describe('Resource Introduction Flow E2E Tests', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let authService: AuthService;
  let resourcesService: ResourcesService;
  let jwtService: JwtService;

  let tutorUser: User;
  let receiverUser: User;
  let otherUser: User;
  let tutorAuthToken: string;
  let receiverAuthToken: string;
  let otherAuthToken: string;
  let resourceId: number;

  // Helper to create unique emails and usernames
  const uniqueTimestamp = Date.now();
  const createUniqueEmail = (base: string) =>
    `${base}_${uniqueTimestamp}@example.com`;
  const createUniqueUsername = (base: string) => `${base}_${uniqueTimestamp}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Set up the global prefix to match the production app
    app.setGlobalPrefix('api');
    app.enableCors();

    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);
    resourcesService = moduleFixture.get<ResourcesService>(ResourcesService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Create users with unique emails
    tutorUser = await usersService.createOne(
      createUniqueUsername('tutor_user'),
      createUniqueEmail('tutor')
    );
    await authService.addAuthenticationDetails(tutorUser.id, {
      type: AuthenticationType.LOCAL_PASSWORD,
      details: {
        password: 'password123',
      },
    });

    // Give tutor permission to manage resources
    await usersService.updateUser(tutorUser.id, {
      systemPermissions: {
        canManageResources: true,
        canManageUsers: false,
        canManagePermissions: false,
      },
    });

    receiverUser = await usersService.createOne(
      createUniqueUsername('receiver_user'),
      createUniqueEmail('receiver')
    );
    await authService.addAuthenticationDetails(receiverUser.id, {
      type: AuthenticationType.LOCAL_PASSWORD,
      details: {
        password: 'password123',
      },
    });

    otherUser = await usersService.createOne(
      createUniqueUsername('other_user'),
      createUniqueEmail('other')
    );
    await authService.addAuthenticationDetails(otherUser.id, {
      type: AuthenticationType.LOCAL_PASSWORD,
      details: {
        password: 'password123',
      },
    });

    // Mark users as email verified (required for login)
    await usersService.updateUser(tutorUser.id, { isEmailVerified: true });
    await usersService.updateUser(receiverUser.id, { isEmailVerified: true });
    await usersService.updateUser(otherUser.id, { isEmailVerified: true });

    // Generate JWT tokens directly
    tutorAuthToken = await authService.createJWT(tutorUser);
    receiverAuthToken = await authService.createJWT(receiverUser);
    otherAuthToken = await authService.createJWT(otherUser);

    // Create a resource
    const resource = await resourcesService.createResource({
      name: 'Test Resource',
      description: 'A test resource for introduction flow tests',
    });

    resourceId = resource.id;

    // Set the tutor as an introducer
    await request(app.getHttpServer())
      .post(
        `/api/resources/${resourceId}/introductions/introducers/${tutorUser.id}`
      )
      .set('Authorization', `Bearer ${tutorAuthToken}`)
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should maintain correct user context throughout introduction flow', async () => {
    const completeIntroductionResponse = await request(app.getHttpServer())
      .post(`/api/resources/${resourceId}/introductions/complete`)
      .set('Authorization', `Bearer ${tutorAuthToken}`)
      .send({ userIdentifier: receiverUser.username })
      .expect(201);

    expect(completeIntroductionResponse.body.tutorUserId).toBe(tutorUser.id);
    expect(completeIntroductionResponse.body.receiverUserId).toBe(
      receiverUser.id
    );

    const tutorMeResponse = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tutorAuthToken}`)
      .expect(200);

    expect(tutorMeResponse.body.id).toBe(tutorUser.id);
    expect(tutorMeResponse.body.username).toBe(tutorUser.username);

    const receiverMeResponse = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${receiverAuthToken}`)
      .expect(200);

    expect(receiverMeResponse.body.id).toBe(receiverUser.id);
    expect(receiverMeResponse.body.username).toBe(receiverUser.username);

    const otherUserMeResponse = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${otherAuthToken}`)
      .expect(200);

    expect(otherUserMeResponse.body.id).toBe(otherUser.id);
    expect(otherUserMeResponse.body.username).toBe(otherUser.username);
  });

  it('should handle multiple introduction requests in quick succession correctly', async () => {
    const additionalUsers = [];
    const additionalTokens = [];

    for (let i = 0; i < 3; i++) {
      // Create user directly with unique email
      const user = await usersService.createOne(
        createUniqueUsername(`additional_user_${i}`),
        createUniqueEmail(`additional${i}`)
      );

      // Add authentication
      await authService.addAuthenticationDetails(user.id, {
        type: AuthenticationType.LOCAL_PASSWORD,
        details: {
          password: 'password123',
        },
      });

      // Mark as verified
      await usersService.updateUser(user.id, { isEmailVerified: true });

      additionalUsers.push(user);

      // Generate JWT token
      const token = await authService.createJWT(user);
      additionalTokens.push(token);
    }

    const requests = additionalUsers.map((user) => {
      return request(app.getHttpServer())
        .post(`/api/resources/${resourceId}/introductions/complete`)
        .set('Authorization', `Bearer ${tutorAuthToken}`)
        .send({ userIdentifier: user.username });
    });

    const responses = await Promise.all(requests);

    responses.forEach((response, index) => {
      expect(response.status).toBe(201);
      expect(response.body.tutorUserId).toBe(tutorUser.id);
      expect(response.body.receiverUserId).toBe(additionalUsers[index].id);
    });

    for (let i = 0; i < additionalUsers.length; i++) {
      const meResponse = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${additionalTokens[i]}`)
        .expect(200);

      expect(meResponse.body.id).toBe(additionalUsers[i].id);
      expect(meResponse.body.username).toBe(additionalUsers[i].username);
    }

    const tutorMeResponse = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tutorAuthToken}`)
      .expect(200);

    expect(tutorMeResponse.body.id).toBe(tutorUser.id);
    expect(tutorMeResponse.body.username).toBe(tutorUser.username);
  });
});
