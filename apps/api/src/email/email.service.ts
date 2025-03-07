import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@attraccess/database-entities';
import mjml2html from 'mjml';
import { join, resolve } from 'path';
import { readdir, readFile, stat } from 'fs/promises';
import * as Handlebars from 'handlebars';
import { loadEnv } from '@attraccess/env';

interface EnvConfig {
  FRONTEND_URL: string;
}

@Injectable()
export class EmailService {
  private templates: null | Record<string, HandlebarsTemplateDelegate> = null;
  private config: EnvConfig;

  constructor(private readonly mailerService: MailerService) {
    // Load and compile templates
    this.loadTemplates();
    this.config = loadEnv((z) => ({
      FRONTEND_URL: z.string().url(),
    })) as EnvConfig;
  }

  private async loadTemplates() {
    const possiblePaths = [
      process.env.EMAIL_TEMPLATES_PATH,
      resolve(join('assets', 'email-templates')),
      resolve(join('src', 'assets', 'email-templates')),
      resolve(join('apps', 'api', 'src', 'assets', 'email-templates')),
    ];

    let templatesPath = null;
    for (const path of possiblePaths) {
      if (!path) {
        continue;
      }

      const templatesPathExists = await stat(path)
        .then((stats) => stats.isDirectory())
        .catch(() => false);

      if (templatesPathExists) {
        templatesPath = path;
        break;
      }
    }

    if (!templatesPath) {
      throw new Error('Email templates path not found');
    }

    const files = await readdir(templatesPath);
    this.templates = {};

    for (const file of files) {
      if (file.endsWith('.mjml')) {
        const templateName = file.replace('.mjml', '');
        const templateContent = await readFile(
          join(templatesPath, file),
          'utf-8'
        );

        this.templates[templateName] = Handlebars.compile(
          mjml2html(templateContent).html
        );
      }
    }
  }

  private async getTemplate(name: string) {
    if (!this.templates) {
      await this.loadTemplates();
    }

    return this.templates[name];
  }

  async sendVerificationEmail(user: User, verificationToken: string) {
    const verificationUrl = `${this.config.FRONTEND_URL}/verify-email?email=${user.email}&token=${verificationToken}`;

    const template = await this.getTemplate('verify-email');
    const html = template({
      username: user.username,
      verificationUrl,
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify your email address',
      html,
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const template = await this.getTemplate('reset-password');
    const html = template({
      username: user.username,
      resetUrl,
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      html,
    });
  }
}
