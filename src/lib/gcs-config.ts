import { Storage } from "@google-cloud/storage";
import { env } from "~/env";

const storage = new Storage({
  projectId: env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

// Initialize all buckets
export const dogSubmissionsBucket = storage.bucket(env.GOOGLE_CLOUD_BUCKET_NAME);
export const profilePicsBucket = storage.bucket(env.GCS_PROFILE_PICS_BUCKET);
export const postsImagesBucket = storage.bucket(env.GCS_POSTS_IMAGES_BUCKET);
