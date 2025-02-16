import { loadEnv } from '@attraccess/env';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const emailEnv = loadEnv((z) => ({
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email(),
  SMTP_SECURE: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  SMTP_IGNORE_TLS: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  SMTP_REQUIRE_TLS: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  SMTP_TLS_REJECT_UNAUTHORIZED: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
}));

let smtpAuthOptions = null;
if (emailEnv.SMTP_USER) {
  smtpAuthOptions = {
    auth: {
      user: emailEnv.SMTP_USER,
      pass: emailEnv.SMTP_PASS,
    },
    secure: emailEnv.SMTP_SECURE,
    ignoreTLS: emailEnv.SMTP_IGNORE_TLS,
    requireTLS: emailEnv.SMTP_REQUIRE_TLS,
    tls: {
      rejectUnauthorized: emailEnv.SMTP_TLS_REJECT_UNAUTHORIZED,
    },
  };
}

const config = {
  transport: {
    host: emailEnv.SMTP_HOST,
    port: emailEnv.SMTP_PORT,
    ...smtpAuthOptions,
  },
  defaults: {
    from: emailEnv.SMTP_FROM,
  },
  template: {
    dir: join(__dirname, 'templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};

export const mailerConfig: MailerOptions = config;
