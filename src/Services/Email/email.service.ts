import fs from 'fs';
import nodemailer, { Transporter } from 'nodemailer';

export class EmailService {
  private readonly EMAIL_USER: string | undefined;
  private readonly EMAIL_PASS: string | undefined;
  private transporter: Transporter;

  constructor() {
    this.EMAIL_USER = process.env.EMAIL_USER;
    this.EMAIL_PASS = process.env.EMAIL_PASS;

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.EMAIL_USER,
        pass: this.EMAIL_PASS,
      },
    });
  }

  public loadTemplate(
    filePath: string,
    replacements: { [key: string]: string } = {}
  ): string {
    let template = fs.readFileSync(filePath, 'utf-8');

    if (Object.keys(replacements).length > 0) {
      for (const key in replacements) {
        template = template.replace(
          new RegExp(`{{${key}}}`, 'g'),
          replacements[key]
        );
      }
    }

    return template;
  }

  public async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string
  ): Promise<any> {
    const mailOptions = {
      from: this.EMAIL_USER,
      to,
      subject,
      text,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new Error('Failed to send email');
    }
  }
}
