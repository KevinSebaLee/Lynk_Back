import nodemailer from 'nodemailer';

export async function sendCancellationEmail(recipients, eventName) {
  if (!recipients || recipients.length === 0) return;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'eventoslynk@gmail.com',
      pass: 'uvevgrmbfhrfsdoa',
    }
  });

  const mailOptions = {
    from: '"Lynk Eventos" <eventoslynk@gmail.com>',
    subject: `Cancelación del evento: ${eventName}`,
    text: `Lamentamos informarte que el evento "${eventName}" ha sido cancelado.`
  };

  for (const email of recipients) {
    await transporter.sendMail({ ...mailOptions, to: email });
  }
}