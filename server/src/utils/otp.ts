import crypto from "crypto";

/**
 * Generates a secure OTP
 * @param {number} length
 * @returns {string}
 */
export const generateNumericOTP = (length = 6) => {
    const randomBytes = crypto.randomBytes(length);

    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += (randomBytes[i] % 10).toString();
    }
    return otp;
};
