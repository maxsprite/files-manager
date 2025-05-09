import { S3Client } from "@aws-sdk/client-s3";

let s3Client: S3Client;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

export const BUCKET_NAME = process.env.S3_BUCKET || "files";
