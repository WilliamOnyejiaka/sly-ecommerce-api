import { config } from "dotenv";

config();

export default function env(key: string) {
    return {
        'port': process.env.PORT!,
        'secretKey': process.env.SECRET_KEY!,
        'envType': process.env.ENV_TYPE ?? "prod",
        'databaseURL': process.env.DATABASE_URL!,
        'tokenSecret': process.env.TOKEN_SECRET!,
        'redisURL': process.env.REDIS_URL!,
        'clientID': process.env.CLIENT_ID!,
        'clientSecret': process.env.CLIENT_SECRET!,
        'callbackUrl': process.env.CALLBACK_URL!,
        'frontendRedirect': process.env.FRONTEND_REDIRECT!,
        'storedSalt': process.env.STORED_SALT!,
        'smtpPassword': process.env.SMTP_PASSWORD!,
        'apiKey': process.env.API_KEY!,
        'defaultAdminPassword': process.env.DEFAULT_ADMIN_PASSWORD!,
        'defaultAdminEmail': process.env.DEFAULT_ADMIN_EMAIL!,
        'cloudinaryCloudName': process.env.CLOUDINARY_CLOUD_NAME!,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY!,
        'cloudinaryApiSecret': process.env.CLOUDINARY_API_SECRET!,
        'twilioAccountSID': process.env.TWILIO_ACCOUNT_SID!,
        'twilioAuthToken': process.env.TWILIO_AUTH_TOKEN!,
        'twilioPhoneNumber': process.env.TWILIO_PHONE_NUMBER!
    }[key];
}