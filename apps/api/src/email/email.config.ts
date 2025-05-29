import { registerAs } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import { z } from 'zod';

const EmailEnvSchema = z.object({
  SMTP_SERVICE: z.enum(['SMTP', 'Outlook365']).optional(),
  EMAIL_TEMPLATES_PATH: z.string().default(path.resolve(process.cwd(), 'apps/api/src/assets/email-templates')),
});

const SMTP_ENV_SCHEMA = z.object({
  SMTP_HOST: z.string().min(1, { message: 'SMTP_HOST is required' }),
  SMTP_PORT: z.coerce.number().positive({ message: 'SMTP_PORT must be a positive number' }),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().min(1, { message: 'SMTP_FROM email is required' }),
});

const OUTLOOK_ENV_SCHEMA = z.object({
  SMTP_FROM: z.string().min(1, { message: 'SMTP_FROM email is required' }),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const handlebarsAdapter = new HandlebarsAdapter();

export interface EmailConfiguration {
  mailerOptions: MailerOptions;
  template: {
    dir: string;
    adapter: HandlebarsAdapter;
    options: {
      strict: boolean;
    };
  };
}

const emailConfigFactory = (): EmailConfiguration => {
  const baseEnv = EmailEnvSchema.parse(process.env);

  const defaults = {
    template: {
      dir: baseEnv.EMAIL_TEMPLATES_PATH,
      adapter: handlebarsAdapter,
      options: {
        strict: true,
      },
    },
  } as Partial<MailerOptions>;

  if (baseEnv.SMTP_SERVICE === 'SMTP') {
    const smtpEnv = SMTP_ENV_SCHEMA.parse(process.env);

    return {
      ...defaults,
      mailerOptions: {
        defaults: {
          from: smtpEnv.SMTP_FROM,
        },
        transport: {
          host: smtpEnv.SMTP_HOST,
          port: smtpEnv.SMTP_PORT,
          secure: smtpEnv.SMTP_SECURE,
          auth: {
            user: smtpEnv.SMTP_USER,
            pass: smtpEnv.SMTP_PASS,
          },
        },
      },
    } as EmailConfiguration;
  }

  if (baseEnv.SMTP_SERVICE === 'Outlook365') {
    const outlookEnv = OUTLOOK_ENV_SCHEMA.parse(process.env);

    return {
      ...defaults,
      mailerOptions: {
        defaults: {
          from: outlookEnv.SMTP_FROM,
        },
        transport: {
          service: 'Outlook365',
          auth: {
            user: outlookEnv.SMTP_USER,
            pass: outlookEnv.SMTP_PASS,
          },
        },
      },
    } as EmailConfiguration;
  }
};

export default registerAs('email', emailConfigFactory);
