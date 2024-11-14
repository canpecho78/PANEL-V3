import nodemailer from 'nodemailer'

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

interface SendEmailParams {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendRecoveryEmail(email: string, resetLink: string): Promise<void> {
  const subject = 'Recuperación de Contraseña'
  const text = `Has solicitado restablecer tu contraseña. Por favor, haz clic en este enlace para restablecer tu contraseña: ${resetLink}`
  const html = `
    <h1>Recuperación de Contraseña</h1>
    <p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
    <p>Este enlace expirará en 1 hora por razones de seguridad.</p>
  `

  await sendEmail({ to: email, subject, text, html })
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const subject = 'Bienvenido a nuestra plataforma'
  const text = `Hola ${name}, ¡Bienvenido a nuestra plataforma! Estamos emocionados de tenerte con nosotros.`
  const html = `
    <h1>¡Bienvenido a nuestra plataforma!</h1>
    <p>Hola ${name},</p>
    <p>Estamos emocionados de tenerte con nosotros. Esperamos que disfrutes usando nuestra plataforma.</p>
    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
  `

  await sendEmail({ to: email, subject, text, html })
}

export async function sendPasswordChangedEmail(email: string): Promise<void> {
  const subject = 'Tu contraseña ha sido cambiada'
  const text = `Este es un aviso para informarte que tu contraseña ha sido cambiada recientemente. Si no realizaste este cambio, por favor contáctanos inmediatamente.`
  const html = `
    <h1>Cambio de Contraseña</h1>
    <p>Este es un aviso para informarte que tu contraseña ha sido cambiada recientemente.</p>
    <p>Si realizaste este cambio, puedes ignorar este correo electrónico.</p>
    <p>Si no realizaste este cambio, por favor contáctanos inmediatamente.</p>
  `

  await sendEmail({ to: email, subject, text, html })
}