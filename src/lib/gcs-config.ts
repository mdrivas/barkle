import { Storage } from '@google-cloud/storage';

// Validate environment variables
if (!process.env.GOOGLE_CLOUD_PROJECT_ID) throw new Error('Missing GOOGLE_CLOUD_PROJECT_ID');
if (!process.env.GOOGLE_CLOUD_CLIENT_EMAIL) throw new Error('Missing GOOGLE_CLOUD_CLIENT_EMAIL');
if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY) throw new Error('Missing GOOGLE_CLOUD_PRIVATE_KEY');
if (!process.env.GOOGLE_CLOUD_BUCKET_NAME) throw new Error('Missing GOOGLE_CLOUD_BUCKET_NAME');
if (!process.env.GCS_PROFILE_PICS_BUCKET) throw new Error('Missing GCS_PROFILE_PICS_BUCKET');

// Only initialize in server environment
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

export const dogSubmissionsBucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
export const profilePicsBucket = storage.bucket(process.env.GCS_PROFILE_PICS_BUCKET);

