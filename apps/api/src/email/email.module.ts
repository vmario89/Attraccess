import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { mailerConfig } from './email.config';

@Module({
  imports: [MailerModule.forRoot(mailerConfig)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
