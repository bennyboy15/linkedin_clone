import { mailtrapClient, sender } from "../lib/mailtrap.js";
import {createWelcomeEmailTemplate} from "../emails/emailTemplates.js"

export async function sendWelcomeEmail(email, name, profileUrl) {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from:sender,
            to: recipient,
            subject: "Welcome to UnlinkedIn",
            html: createWelcomeEmailTemplate(name, profileUrl),
            category: "welcome"
        });

        console.log("Welcome email sent successfully", response);
    } catch (error) {
        throw error;
    }
};


export async function sendCommentNotificationEmail (recipientEmail, recipientName, commenterName, postUrl, commentContent) {
	const recipient = [{ email: recipientEmail }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "New Comment on Your Post",
			html: createCommentNotificationEmailTemplate(recipientName, commenterName, postUrl, commentContent),
			category: "comment_notification",
		});
		console.log("Comment Notification Email sent successfully", response);
	} catch (error) {
		throw error;
	}
};

export async function sendConnectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl) {
	const recipient = [{ email: senderEmail }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: `${recipientName} accepted your connection request`,
			html: createConnectionAcceptedEmailTemplate(senderName, recipientName, profileUrl),
			category: "connection_accepted",
		});
	} catch (error) {}
};