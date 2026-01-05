import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: "ByteShop IT <byte.shop.th@gmail.com>",
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export default sendEmail;
