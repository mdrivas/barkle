import { Storage } from '@google-cloud/storage';

// Validate environment variables
const requiredEnvVars = {
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_CLIENT_EMAIL: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  GOOGLE_CLOUD_PRIVATE_KEY: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  GOOGLE_CLOUD_BUCKET_NAME: process.env.GOOGLE_CLOUD_BUCKET_NAME,
  GCS_PROFILE_PICS_BUCKET: process.env.GCS_PROFILE_PICS_BUCKET,
} as const;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only initialize storage in server environment
const storage = !isBrowser ? new Storage({
  projectId: requiredEnvVars.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: requiredEnvVars.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: requiredEnvVars.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
}) : null;

// Export buckets with null fallback for client
export const dogSubmissionsBucket = !isBrowser ? storage?.bucket(requiredEnvVars.GOOGLE_CLOUD_BUCKET_NAME!) : null;
export const profilePicsBucket = !isBrowser ? storage?.bucket(requiredEnvVars.GCS_PROFILE_PICS_BUCKET!) : null;

