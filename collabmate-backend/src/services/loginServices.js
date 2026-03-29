import Mailjet from "node-mailjet";
const MAILJET_API_KEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
const MAILJET_API_KEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;

export const validEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export const sendOTP = async (email,otp) => {
    try{
        const mailjet = Mailjet.apiConnect(MAILJET_API_KEY_PUBLIC, MAILJET_API_KEY_PRIVATE);

        const result = await mailjet
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "kudynamoyt@gmail.com",
                            "Name": "Edit-Where"
                        },
                        "To": [
                            {
                                "Email": email
                            }
                        ],
                        "Subject": "Your OTP for Edit Where",
                        "TextPart": `Your OTP for Edit Where is: ${otp}. It is valid for 5 minutes`,
                        "HTMLPart": `<h3>Hello ${email},</h3><p>Your OTP for Edit Where is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
                        "CustomID": "OTPEmail"
                    }
                ]
            })
        console.log("Mailjet Success:", result.body.Messages[0].Status)
        return true;
    }catch(error){
        console.error("Mailjet Error:", error.StatusCode, error.message)
        throw new Error("Failed to send email");
    }
}
