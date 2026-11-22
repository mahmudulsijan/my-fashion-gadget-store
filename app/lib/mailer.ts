import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER এবং EMAIL_PASS .env.local ফাইলে সেট করা নেই");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendLoginOtpEmail(to: string, code: string) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Login Verification" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${code} হলো আপনার লগইন ভেরিফিকেশন কোড`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #111827;">লগইন ভেরিফিকেশন কোড</h2>
        <p style="color: #4b5563; font-size: 14px;">
          আপনার অ্যাকাউন্টে লগইন করার জন্য নিচের ৬ ডিজিটের কোডটি ব্যবহার করুন:
        </p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 14px; margin: 18px 0; background: #f3f4f6; border-radius: 8px; color: #111827;">
          ${code}
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          এই কোডটি <strong>৫ মিনিট</strong> পর্যন্ত কার্যকর থাকবে। আপনি অনুরোধ না করে থাকলে এই ইমেইলটি উপেক্ষা করুন।
        </p>
      </div>
    `,
  });
}