import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

if (!process.env.GOOGLE_CLOUD_BUCKET_NAME) {
  throw new Error("GOOGLE_CLOUD_BUCKET_NAME is not defined");
}

if (!process.env.GCS_PROFILE_PICS_BUCKET) {
  throw new Error("GCS_PROFILE_PICS_BUCKET is not defined");
}

export const dogSubmissionsBucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
export const profilePicsBucket = storage.bucket(process.env.GCS_PROFILE_PICS_BUCKET);

// Log bucket names in development
if (process.env.NODE_ENV === 'development') {
  console.log('Dog submissions bucket:', process.env.GOOGLE_CLOUD_BUCKET_NAME);
  console.log('Profile pics bucket:', process.env.GCS_PROFILE_PICS_BUCKET);
} 