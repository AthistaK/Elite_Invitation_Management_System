import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

let publicKey = process.env.VAPID_PUBLIC_KEY || '';
let privateKey = process.env.VAPID_PRIVATE_KEY || '';

if (!publicKey || !privateKey) {
  // Generate VAPID keys automatically for local development
  const vapidKeys = webpush.generateVAPIDKeys();
  publicKey = vapidKeys.publicKey;
  privateKey = vapidKeys.privateKey;
  console.log('----------------------------------------------------');
  console.log(' VAPID Keys Auto-Generated for Web Push Notifications');
  console.log(' Public Key:', publicKey);
  console.log(' (In production, save VAPID_PUBLIC_KEY & VAPID_PRIVATE_KEY in .env)');
  console.log('----------------------------------------------------');
}

const subject = process.env.VAPID_SUBJECT || 'mailto:admin@eims.college.edu';

try {
  webpush.setVapidDetails(subject, publicKey, privateKey);
} catch (err) {
  console.error('Failed to configure web-push VAPID details:', err);
}

export const VAPID_PUBLIC_KEY = publicKey;
export const VAPID_PRIVATE_KEY = privateKey;
