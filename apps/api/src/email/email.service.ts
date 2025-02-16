import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../database/entities';
import mjml2html from 'mjml';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly templates: Record<string, HandlebarsTemplateDelegate> = {};

  constructor(private readonly mailerService: MailerService) {
    // Load and compile templates
    this.loadTemplates();
  }

  private loadTemplates() {
    const templatesPath = join(__dirname, 'assets', 'email-templates');
    const verifyEmailTemplate = readFileSync(
      join(templatesPath, 'verify-email.mjml'),
      'utf-8'
    );

    this.templates['verify-email'] = Handlebars.compile(
      mjml2html(verifyEmailTemplate).html
    );
  }

  async sendVerificationEmail(user: User, verificationToken: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const html = this.templates['verify-email']({
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

    const html = this.templates['reset-password']({
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
