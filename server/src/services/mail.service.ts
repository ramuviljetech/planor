import Mailjet from "node-mailjet";

const MAILJET_API_KEY = process.env.MAILJET_API_KEY || '';
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY || '';
const MAILJET_SENDER_EMAIL = process.env.MAILJET_SENDER_EMAIL || "no-reply";

// Lazy initialization of mailjet client
let mailjet: any = null;

const getMailjetClient = () => {
  if (!mailjet) {
    if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
      throw new Error('Mailjet API_KEY and SECRET_KEY are required');
    }
    mailjet = Mailjet.apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY);
  }
  return mailjet;
};

// Check if Mailjet is configured
export const isMailjetConfigured = () => {
  return !!(MAILJET_API_KEY && MAILJET_SECRET_KEY);
};

interface OtpMailData {
  otp: string;
  email: string;
  name?: string;
}

/**
 * Sends a login OTP mail to the recipient
 * @param data - Object containing OTP, email, and optional name
 * @returns Promise<Object>
 */
export const sendMail = async ({ otp, email, name = "" }: OtpMailData) => {
    const mailjetClient = getMailjetClient();
    const request = mailjetClient.post("send", { version: "v3.1" }).request({
        Messages: [
            {
                From: {
                    Email: MAILJET_SENDER_EMAIL,
                    Name: "Planor",
                },
                To: [
                    {
                        Email: email,
                        Name: name || email,
                    },
                ],
                Subject: "Your OTP Code",
                TextPart: `Your OTP code is ${otp}. It expires in 5 minutes.`,
                HTMLPart: `<p>Hi,</p>
                           <p>Your One-Time Password (OTP) is:</p>
                           <h2 style="color: #2e6c80;">${otp}</h2>
                           <p>Please use this code to complete your Request. It is valid for <strong>5 minutes</strong>.</p>
                           <p>If you did not request this, you can safely ignore this email.</p>
                           <br/>
                           <p>Thank you,<br/>The <strong>Planor</strong> Team</p>`,
            },
        ],
    });
    return await request;
}; 