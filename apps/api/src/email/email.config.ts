import { loadEnv } from '@attraccess/env';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

const basicEmailEnv = loadEnv((z) => ({
  SMTP_SERVICE: z.enum(['SMTP', 'Outlook365']),
  SMTP_FROM: z.string().email(),
}));

const getSMTPTransportOptions = () => {
  const smtpEnv = loadEnv((z) => ({
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z
      .string()
      .transform((v) => v === 'true')
      .default('false'),
    SMTP_TLS_CIPHERS: z.string().optional(),
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
  if (smtpEnv.SMTP_USER) {
    smtpAuthOptions = {
      auth: {
        user: smtpEnv.SMTP_USER,
        pass: smtpEnv.SMTP_PASS,
      },
      secure: smtpEnv.SMTP_SECURE,
      ignoreTLS: smtpEnv.SMTP_IGNORE_TLS,
      requireTLS: smtpEnv.SMTP_REQUIRE_TLS,
      tls: {
        rejectUnauthorized: smtpEnv.SMTP_TLS_REJECT_UNAUTHORIZED,
        ciphers: smtpEnv.SMTP_TLS_CIPHERS,
      },
    };
  }

  return {
    host: smtpEnv.SMTP_HOST,
    port: smtpEnv.SMTP_PORT,
    ...smtpAuthOptions,
  };
};

const getOutlook365TransportOptions = () => {
  const env = loadEnv((z) => ({
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
  }));

  return {
    service: 'Outlook365',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  };
};

let transport = {};
switch (basicEmailEnv.SMTP_SERVICE) {
  case 'SMTP':
    transport = getSMTPTransportOptions();
    break;
  case 'Outlook365':
    transport = getOutlook365TransportOptions();
    break;
}

const config = {
  transport,
  defaults: {
    from: basicEmailEnv.SMTP_FROM,
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
