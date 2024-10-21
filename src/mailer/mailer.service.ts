import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService {
    transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>

    constructor() {
        this.transporter = this._mailTransport() as any;
    }

    _mailTransport() {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        } as any)
        return transporter
    }

    async sendInvitationCollab(dto: Mail.Options) {
        const options: Mail.Options = {
            from: dto?.from ?? {
                name: "Notehub",
                address: "www.notehub.com"
            },
            to: dto?.to,
            subject: dto.subject,
            html: dto.html,
        }

        try {
            const send = await this.transporter.sendMail(options);
            return send;
        } catch (e: any) {
            throw new HttpException(e?.message, HttpStatus.BAD_REQUEST)
        }
    }
}
