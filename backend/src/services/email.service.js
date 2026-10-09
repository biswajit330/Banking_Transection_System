const nodemailer = require('nodemailer');

const hasOAuthCredentials = Boolean(
    process.env.EMAIL_USER &&
    process.env.CLIENT_ID &&
    process.env.CLIENT_SECRET &&
    process.env.REFRESH_TOKEN
);

let transporter = null;
const simulatedEmailInbox = [];

if (hasOAuthCredentials) {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
            },
        });

        transporter.verify((error) => {
            if (error) {
                console.warn('Email server configuration warning:', error.message);
            } else {
                console.log('Email server is ready to send messages');
            }
        });
    } catch (e) {
        console.warn('Could not initialize email transporter:', e.message);
    }
} else {
    console.log('Email service initialized in simulated mode (no OAuth credentials configured)');
}

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    const emailRecord = {
        id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        to,
        subject,
        text,
        html,
        sentAt: new Date().toISOString()
    };

    simulatedEmailInbox.unshift(emailRecord);
    if (simulatedEmailInbox.length > 50) simulatedEmailInbox.pop();

    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html,
            });
            console.log('Message sent: %s', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error.message);
        }
    } else {
        console.log(`[Simulated Email] To: ${to} | Subject: ${subject}`);
    }

    return emailRecord;
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    return await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful!';
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    return await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    return await sendEmail(userEmail, subject, text, html);
}

function getRecentSimulatedEmails() {
    return [...simulatedEmailInbox];
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail,
    getRecentSimulatedEmails
};
