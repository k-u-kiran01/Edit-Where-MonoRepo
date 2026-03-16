import Mailjet from "node-mailjet";
MAILJET_API_KEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
MAILJET_API_KEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;

export const validEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export const sendOTP = (email,otp) => {
    Mailjet.apiConnect(MAILJET_API_KEY_PUBLIC, MAILJET_API_KEY_PRIVATE)
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "kudynamoyt@gmai.com",
                        "Name": "Edit Where"
                    },
                    "To": [
                        {
                            "Email": email,
                        }],
                    "Subject": "Your OTP for Edit Where",
                    "TextPart": `Your OTP for Edit Where is: ${otp}. It is valid for 5 minutes`,
                    "HTMLPart": `<h3>Hello ${email},</h3><p>Your OTP for Edit Where is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
                    "CustomID": "OTPEmail"
                }
            ]
        })
        .then((result) => {
            console.log(result.body);
        })
        .catch((err) => {
            console.error(err.statusCode);
        });
}
