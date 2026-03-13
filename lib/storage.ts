import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET = process.env.R2_BUCKET || "anchor";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!; // e.g. https://cdn.anchrapp.io or https://pub-xxx.r2.dev

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a buffer to R2 and return the public URL.
 */
export async function uploadFile(
  key: string,
  body: Buffer | ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body instanceof ArrayBuffer ? new Uint8Array(body) : body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Generate a presigned URL for client-side direct upload.
 * Returns the upload URL and the final public URL.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 600, // 10 minutes
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn },
  );

  return {
    uploadUrl,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
  };
}

/**
 * Delete a file from R2.
 */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
  );
}
