import nodemailer from "nodemailer";
import { env } from "@/lib/env";

// Lazily created transport. If SMTP is not configured (dev), emails are
// logged to the console instead of sent, so flows never crash locally.
let transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  if (!env.mail.host) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.port === 465,
      auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
    });
  }
  return transport;
}

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
}

export async function sendMail(message: MailMessage): Promise<void> {
  const t = getTransport();
  if (!t) {
    // Dev fallback — no SMTP configured.
    console.info("[email:dev] would send →", {
      to: message.to,
      subject: message.subject,
    });
    return;
  }
  await t.sendMail({ from: env.mail.from, ...message });
}
