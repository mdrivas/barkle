import { Storage } from "@google-cloud/storage";
import { env } from "~/env";

// Only initialize in server environment
const storage = new Storage({
  projectId: env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

export const dogSubmissionsBucket = storage.bucket(
  env.GOOGLE_CLOUD_BUCKET_NAME,
);
export const profilePicsBucket = storage.bucket("profile_pics_barkle");
