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

interface WelcomeMailData {
  email: string;
  username: string;
  clientName?: string;
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

/**
 * Sends a welcome email to newly created standard users
 * @param data - Object containing email, username, and optional client name
 * @returns Promise<Object>
 */
export const sendWelcomeMail = async ({ email, username, clientName }: WelcomeMailData) => {
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
                        Name: username,
                    },
                ],
                Subject: "Welcome to Planor - Your Account Has Been Created",
                TextPart: `Welcome ${username}! Your account has been successfully created on Planor.${clientName ? ` You have been assigned to ${clientName}.` : ''} You can now log in to access your dashboard.`,
                HTMLPart: `<p>Hi <strong>${username}</strong>,</p>
                           <p>Welcome to <strong>Planor</strong>! Your account has been successfully created.</p>
                           ${clientName ? `<p>You have been assigned to <strong>${clientName}</strong>.</p>` : ''}
                           <p>You can now log in to access your dashboard and start managing your properties and maintenance plans.</p>
                           <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                           <br/>
                           <p>Thank you,<br/>The <strong>Planor</strong> Team</p>`,
            },
        ],
    });
    return await request;
}; 