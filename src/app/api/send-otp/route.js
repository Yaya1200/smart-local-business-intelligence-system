import nodemailer from "nodemailer";

const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = Number(process.env.MAIL_PORT || 587);
const MAIL_USERNAME = process.env.MAIL_USERNAME;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const MAIL_FROM = process.env.MAIL_FROM || MAIL_USERNAME;

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_PORT === 465,
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendOtpEmail = async ({ email, code }) => {
  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USERNAME || !MAIL_PASSWORD) {
    throw new Error(
      "SMTP environment values are missing. Set MAIL_HOST, MAIL_PORT, MAIL_USERNAME, and MAIL_PASSWORD."
    );
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: "Your verification code",
    text: `Your signup verification code is ${code}. Use this code to complete your account signup.`,
    html: `<div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0f172a; line-height:1.6;">
      <h2 style="color:#5b21b6;">Your verification code</h2>
      <p>Use the code below to complete your account signup:</p>
      <div style="margin:24px 0; padding:18px 20px; border-radius:18px; background:#f5f3ff; display:inline-block; font-size:1.6rem; font-weight:700; letter-spacing:0.08em;">${code}</div>
      <p style="margin-top:24px; color:#475569;">If you did not request this code, you can safely ignore this message.</p>
    </div>`,
  });
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return new Response(JSON.stringify({ error: "Missing email or code." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await sendOtpEmail({ email, code });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Failed to send OTP email." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
