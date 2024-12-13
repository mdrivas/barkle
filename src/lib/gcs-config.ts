import { Storage } from "@google-cloud/storage";
import { env } from "~/env";

if (!process.env.GOOGLE_CLOUD_PROJECT_ID)
  throw new Error("Missing GOOGLE_CLOUD_PROJECT_ID");
if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY)
  throw new Error("Missing GOOGLE_CLOUD_PRIVATE_KEY");
if (!process.env.GOOGLE_CLOUD_BUCKET_NAME)
  throw new Error("Missing GOOGLE_CLOUD_BUCKET_NAME");

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
