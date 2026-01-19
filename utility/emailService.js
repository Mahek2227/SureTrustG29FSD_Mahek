// utility/emailService.js
import Mailjet from "node-mailjet";

// Connect to Mailjet using API key and secret from .env
const mailjet = Mailjet.apiConnect(
  process.env.MJ_API_KEY,
  process.env.MJ_SECRET_KEY
);

// Function to send OTP email
export const sendOTPEmail = async (to, otp) => {
  try {
    const request = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL,
              Name: process.env.MJ_SENDER_NAME,
            },
            To: [{ Email: to }],
            Subject: "OTP Verification",
            HTMLPart: `<h2>Your OTP code is: <b>${otp}</b></h2>`,
          },
        ],
      });

    // This log shows Mailjet response
    console.log("Mailjet response:", request.body);

    console.log("OTP sent successfully to", to);
  } catch (err) {
    console.error("Mailjet Error:", err);
    throw err;
  }
};
