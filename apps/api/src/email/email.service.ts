// apps/api/src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config'; // Added
import { User } from '@attraccess/database-entities';
import mjml2html from 'mjml';

import * as Handlebars from 'handlebars';
import { EmailConfiguration as EmailConfigMapType } from './email.config'; // Added for typing
import { VERIFY_EMAIL_MJML_TEMPLATE } from './templates/verify-email.template';
import { RESET_PASSWORD_MJML_TEMPLATE } from './templates/reset-password.template';

@Injectable()
export class EmailService {




  private templates: null | Record<string, HandlebarsTemplateDelegate> = null;
  private readonly logger = new Logger(EmailService.name);
  private frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService // Injected
  ) {
    this.logger.debug('Initializing EmailService');

    const emailConf = this.configService.get<EmailConfigMapType>('email'); // Keep this for other mailer options

    // We still need to check if basic email configuration (for sending, not templates) is available
    if (!emailConf || !emailConf.mailerOptions) { // Simplified check
      this.logger.error('Core email configuration (e.g., transport) not found. Ensure email module is correctly configured. Email sending may fail.');
      // Depending on how critical this is, could exit. For now, log error and continue,
      // as static templates can load, but sending will fail later if mailerService isn't set up.
      // process.exit(1); // Re-evaluate if this exit is essential
    }

    // Load static templates unconditionally.
    // The templatesPath from config (templateDirFromConfig) is no longer used by loadTemplates for default templates.
    this.loadTemplates(); 
    // Note: The original code had process.exit(1) if templateDirFromConfig was missing.
    // We've removed that specific exit condition as static templates don't need the path.
    // If emailConf itself is missing, that's a more general problem for the mailerService.

    this.frontendUrl =
      this.configService.get<string>('app.frontendUrl') ||
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('VITE_ATTRACCESS_URL');

    if (!this.frontendUrl) {
      this.logger.warn(
        'FRONTEND_URL not found in configuration. Using default fallback: http://localhost:3000. Email links may be incorrect.'
      );
      this.frontendUrl = 'http://localhost:3000'; // Fallback
    }
    this.logger.debug(`EmailService initialized with FRONTEND_URL: ${this.frontendUrl}`);
  }

  private async loadTemplates() {
    this.logger.debug('Loading static email templates.');
    this.templates = {}; // Initialize templates object

    // Load static/default templates
    try {
      this.logger.debug('Loading static template: verify-email');
      this.templates['verify-email'] = Handlebars.compile(mjml2html(VERIFY_EMAIL_MJML_TEMPLATE).html);
      this.logger.debug('Compiled static template: verify-email');

      this.logger.debug('Loading static template: reset-password');
      this.templates['reset-password'] = Handlebars.compile(mjml2html(RESET_PASSWORD_MJML_TEMPLATE).html);
      this.logger.debug('Compiled static template: reset-password');
      
      this.logger.debug(`Loaded ${Object.keys(this.templates).length} static email templates.`);
    } catch (error) {
      this.logger.error('Failed to load static email templates:', error.stack);
      this.templates = null; // Critical failure if static templates cannot be loaded
    }
  }

  private async getTemplate(name: string): Promise<HandlebarsTemplateDelegate | null> {
    this.logger.debug(`Getting template: ${name}`);
    if (!this.templates) {
      this.logger.warn('Templates object is null, possibly due to a loading error during initialization. Attempting to reload static templates.');
      await this.loadTemplates(); // Reload static templates
    }

    if (!this.templates) { // Check again after attempting reload
      this.logger.error('Templates are still null after attempting reload. Cannot provide template.');
      return null;
    }

    const template = this.templates[name];
    if (!template) {
      this.logger.warn(`Template not found: ${name}`);
      // Optionally, could attempt a reload here too if a specific template is missing,
      // but if initial load failed, this is unlikely to help unless the error was transient.
      // For now, assume if this.templates exists, it contains all successfully loaded static templates.
      return null;
    }
    return template;
  }

  async sendVerificationEmail(user: User, verificationToken: string) {
    this.logger.debug(`Sending verification email to user ID: ${user.id}, email: ${user.email}`);
    const verificationUrl = `${this.frontendUrl}/verify-email?email=${encodeURIComponent(
      user.email
    )}&token=${verificationToken}`;
    this.logger.debug(`Verification URL: ${verificationUrl}`);

    const template = await this.getTemplate('verify-email');
    if (!template) {
      this.logger.error('verify-email template not found or failed to load. Cannot send email.');
      throw new Error('Email template not found: verify-email');
    }

    const html = template({
      username: user.username,
      verificationUrl,
      logoUrl: this.configService.get<string>('app.logoUrl', 'https://attraccess.fabinfra.dev/assets/logo_navbar-BhJ4pnsY.png'), // Using a default from a quick search, replace if a better one is configured
      year: new Date().getFullYear(),
    });

    this.logger.debug(`Sending email to: ${user.email}`);
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify your email address',
        html,
      });
      this.logger.debug(`Verification email sent successfully to: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to: ${user.email}`, error.stack);
      throw error;
    }
  }

  async sendPasswordResetEmail(user: User, resetToken: string) {
    this.logger.debug(`Sending password reset email to user ID: ${user.id}, email: ${user.email}`);
    const resetUrl = `${this.frontendUrl}/reset-password?userId=${user.id}&token=${encodeURIComponent(resetToken)}`;
    this.logger.debug(`Reset URL: ${resetUrl}`);

    const template = await this.getTemplate('reset-password');
    if (!template) {
      this.logger.error('reset-password template not found or failed to load. Cannot send email.');
      throw new Error('Email template not found: reset-password');
    }

    const html = template({
      username: user.username,
      resetUrl,
      logoUrl: this.configService.get<string>('app.logoUrl', 'https://attraccess.fabinfra.dev/assets/logo_navbar-BhJ4pnsY.png'),
      year: new Date().getFullYear(),
    });

    this.logger.debug(`Sending reset email to: ${user.email}`);
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reset your password',
        html,
      });
      this.logger.debug(`Password reset email sent successfully to: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to: ${user.email}`, error.stack);
      throw error;
    }
  }
}
