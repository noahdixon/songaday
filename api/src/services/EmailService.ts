import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

const message: string = `
<p>Your new Songaday song recommendation is here. Check it out below:</p>

<p>{{recommendation}}</p>

<p>To disable these notifications, log in to your account <a href="https://songaday-c55568279e83.herokuapp.com/">here</a>, navigate to Delivery Settings, and disable "Deliver Recommendations Via Email".</p>

<p>Happy Listening!<br/>
-Songaday</p>
`;

// Function to send email
export const sendRecommendationEmail = async (to: string, recTitle: string, recArtist: string, recUrl: string) => {
    try {
        const info = await transporter.sendMail({
            from: `"Songaday" <${process.env.GMAIL_EMAIL}>`,
            to: to,
            subject: `New Song Recommendation - ${recTitle} by ${recArtist}`,
            html: message.replace("{{recommendation}}", recUrl),
        });
  
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};