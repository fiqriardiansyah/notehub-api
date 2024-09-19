import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService {
    transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>

    constructor() {
        this.transporter = this._mailTransport();
    }

    _mailTransport() {
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            secure: false,
            auth: {
                user: "2153db8285ef94",
                pass: "064557c2b2ba31"
            }
        });
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
