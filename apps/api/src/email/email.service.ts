// apps/api/src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config'; // Added
import { User } from '@attraccess/database-entities';
import mjml2html from 'mjml';
import { join } from 'path'; // resolve might not be needed anymore
import { readdir, readFile, stat } from 'fs/promises';
import * as Handlebars from 'handlebars';
import { EmailConfiguration as EmailConfigMapType } from './email.config'; // Added for typing

@Injectable()
export class EmailService {
  private static readonly VERIFY_EMAIL_MJML = `
<mjml>
  <mj-head>
    <mj-title>Verify your email address</mj-title>
    <mj-font
      name="Roboto"
      href="https://fonts.googleapis.com/css?family=Roboto"
    />
    <mj-attributes>
      <mj-all font-family="Roboto, Arial" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-image width="200px" src="{{logoUrl}}" alt="Logo" />

        <mj-text font-size="24px" color="#333333" align="center">
          Welcome to Attraccess!
        </mj-text>

        <mj-text font-size="16px" color="#555555"> Hi {{username}}, </mj-text>

        <mj-text font-size="16px" color="#555555">
          Thanks for signing up! Please verify your email address to complete
          your registration.
        </mj-text>

        <mj-button background-color="#4CAF50" href="{{verificationUrl}}">
          Verify Email Address
        </mj-button>

        <mj-text font-size="14px" color="#888888">
          If you didn\'t create an account, you can safely ignore this email.
        </mj-text>

        <mj-divider border-color="#eeeeee" />

        <mj-text font-size="12px" color="#888888" align="center">
          &copy; {{year}} Attraccess. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

  private static readonly RESET_PASSWORD_MJML = `
<mjml>
  <mj-head>
    <mj-title>Reset your password</mj-title>
    <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
    <mj-attributes>
      <mj-all font-family="Roboto, Arial" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-image width="200px" src="{{logoUrl}}" alt="Logo" />

        <mj-text font-size="24px" color="#333333" align="center"> Password Reset Request </mj-text>

        <mj-text font-size="16px" color="#555555"> Hi {{username}}, </mj-text>

        <mj-text font-size="16px" color="#555555">
          We received a request to reset your password. Click the button below to create a new password.
        </mj-text>

        <mj-button background-color="#4CAF50" href="{{resetUrl}}"> Reset Password </mj-button>

        <mj-text font-size="14px" color="#888888">
          If you didn\'t request a password reset, you can safely ignore this email.
        </mj-text>

        <mj-divider border-color="#eeeeee" />

        <mj-text font-size="12px" color="#888888" align="center">
          &copy; {{year}} Attraccess. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

  private templates: null | Record<string, HandlebarsTemplateDelegate> = null;
  private readonly logger = new Logger(EmailService.name);
  private frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService // Injected
  ) {
    this.logger.debug('Initializing EmailService');

    const emailConf = this.configService.get<EmailConfigMapType>('email');
    let templateDirFromConfig: string | undefined;

    if (
      emailConf &&
      emailConf.mailerOptions &&
      emailConf.mailerOptions.template &&
      emailConf.mailerOptions.template.dir
    ) {
      templateDirFromConfig = emailConf.mailerOptions.template.dir;
    }

    if (!templateDirFromConfig) {
      this.logger.error(
        'Email template path not configured correctly via ConfigService(email.mailerOptions.template.dir). Cannot load templates.'
      );
      process.exit(1);
    } else {
      this.loadTemplates(templateDirFromConfig);
    }

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

  private async loadTemplates(templatesPath: string) {
    this.logger.debug(`Loading email templates. Filesystem path: ${templatesPath}`);
    this.templates = {}; // Initialize templates object

    // Attempt to load from filesystem (for custom templates)
    try {
      const templatesPathExists = await stat(templatesPath)
        .then((stats) => stats.isDirectory())
        .catch(() => false);

      if (templatesPathExists) {
        const files = await readdir(templatesPath);
        this.logger.debug(`Found ${files.length} files in custom templates directory: ${templatesPath}`);
        for (const file of files) {
          if (file.endsWith('.mjml')) {
            const templateName = file.replace('.mjml', '');
            this.logger.debug(`Loading custom template: ${templateName} from filesystem`);
            const templateContent = await readFile(join(templatesPath, file), 'utf-8');
            this.templates[templateName] = Handlebars.compile(mjml2html(templateContent).html);
            this.logger.debug(`Compiled custom template: ${templateName}`);
          }
        }
      } else {
        this.logger.warn(`Custom email templates path does not exist or is not a directory: ${templatesPath}. Skipping filesystem load.`);
      }
    } catch (error) {
      this.logger.error(`Failed to load email templates from ${templatesPath}:`, error.stack);
      // Not setting templates to null here, as static ones might still load
    }

    // Load static/default templates (will overwrite if names conflict, which is intended)
    try {
      this.logger.debug('Loading static template: verify-email');
      this.templates['verify-email'] = Handlebars.compile(mjml2html(EmailService.VERIFY_EMAIL_MJML).html);
      this.logger.debug('Compiled static template: verify-email');

      this.logger.debug('Loading static template: reset-password');
      this.templates['reset-password'] = Handlebars.compile(mjml2html(EmailService.RESET_PASSWORD_MJML).html);
      this.logger.debug('Compiled static template: reset-password');
    } catch (error) {
      this.logger.error('Failed to load static email templates:', error.stack);
      // If static templates fail, this is a more critical issue.
      // Depending on policy, could throw error or ensure templates object reflects this failure.
      // For now, if this.templates was {}, it remains so, or partially filled.
    }
    
    const loadedCount = Object.keys(this.templates || {}).length;
    if (loadedCount === 0 && !this.templates) { // Check if templates is null (critical failure) or just empty
        this.logger.error('No email templates loaded (neither custom nor static). Email functionality will be impaired.');
        this.templates = null; // Explicitly set to null to indicate critical failure if nothing loaded
    } else {
        this.logger.debug(`Loaded ${loadedCount} email templates in total (custom and static).`);
    }
  }

  private async getTemplate(name: string): Promise<HandlebarsTemplateDelegate | null> {
    this.logger.debug(`Getting template: ${name}`);
    if (!this.templates) {
      this.logger.warn('Templates object is null, possibly due to loading error. Cannot get template.');
      const emailConf = this.configService.get<EmailConfigMapType>('email');
      let templateDirFromConfig: string | undefined;
      if (
        emailConf &&
        emailConf.mailerOptions &&
        emailConf.mailerOptions.template &&
        emailConf.mailerOptions.template.dir
      ) {
        templateDirFromConfig = emailConf.mailerOptions.template.dir;
      }
      if (templateDirFromConfig) {
        this.logger.debug('Attempting to reload templates in getTemplate.');
        await this.loadTemplates(templateDirFromConfig);
      } else {
        this.logger.error('Cannot reload templates: path not configured.');
        return null;
      }
    }

    if (!this.templates) {
      this.logger.error('Templates are still null after attempting reload. Cannot provide template.');
      return null;
    }

    const template = this.templates[name];
    if (!template) {
      this.logger.warn(`Template not found: ${name}`);
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
