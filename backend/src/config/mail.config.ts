import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailConfig: MailerOptions = {
  transport: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  },
  defaults: {
    from: process.env.MAIL_FROM,
  },
  template: {
    dir: join(__dirname, '..', 'templates', 'email'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
