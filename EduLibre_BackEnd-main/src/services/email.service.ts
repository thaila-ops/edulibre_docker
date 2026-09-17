import nodemailer from 'nodemailer';

type WelcomeEmailInput = {
  name: string;
  email: string;
};

export default class EmailService {
  public static async sendWelcomeEmail({
    name,
    email,
  }: WelcomeEmailInput) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM;

    if (!host || !port || !user || !pass || !from) {
      throw new Error('As credenciais de e-mail não foram configuradas.');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Bem-vinda ao EduLibre!',
      text: `Olá, ${name}! Seu cadastro foi realizado com sucesso. Seja bem-vinda ao EduLibre.`,
      html: `
        <h1>Olá, ${name}!</h1>
        <p>Seu cadastro foi realizado com sucesso.</p>
        <p>Seja bem-vinda ao <strong>EduLibre</strong>!</p>
        <p>Agora você já pode encontrar, agendar e publicar aulas.</p>
      `,
    });
  }
}