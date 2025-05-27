// apps/api/src/email/email.config.ts (recreated)
import { loadEnv } from '@attraccess/env';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

const env = loadEnv((z) => ({
  SMTP_SERVICE: z.string().optional(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_NAME: z.string().default('Attraccess'),
  SMTP_FROM_EMAIL: z.string().email().default('noreply@attraccess.org'),
  EMAIL_TEMPLATES_PATH: z.string().default(path.resolve(process.cwd(), 'apps/api/src/assets/email-templates')),
}));

export const mailerConfig: MailerOptions = {
  transport: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    ...(env.SMTP_SERVICE && { service: env.SMTP_SERVICE }),
  },
  defaults: {
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
  },
  template: {
    dir: env.EMAIL_TEMPLATES_PATH,
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
