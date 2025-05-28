import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import emailConfiguration, { EmailConfiguration as EmailConfigMapType } from './email.config';

@Module({
  imports: [
    ConfigModule.forFeature(emailConfiguration),
    MailerModule.forRootAsync({
      // imports: [ConfigModule], // Not needed if ConfigModule.forFeature is used or ConfigModule is global
      useFactory: async (configService: ConfigService< { email: EmailConfigMapType } >) => {
        const emailConf = configService.get('email', { infer: true });
        if (!emailConf) {
          throw new Error('Email configuration not found');
        }
        return emailConf.mailerOptions;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
