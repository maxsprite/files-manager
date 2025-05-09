import { S3Service } from "../services/s3-service.js";

// Schedule for running tasks in cron format
// By default, run S3 cleanup every day at 3:00 AM
export const CLEANUP_S3_SCHEDULE =
  process.env.CLEANUP_S3_SCHEDULE || "0 3 * * *";

/**
 * Job for cleaning up unused files from S3.
 * Finds files in S3 that don't have a corresponding record in the database and deletes them.
 */
export async function cleanupS3OrphanedFilesJob(): Promise<{
  deleted: number;
  total: number;
}> {
  console.log("[JOB] Starting S3 orphaned files cleanup job...");

  try {
    const s3Service = new S3Service();
    const result = await s3Service.cleanupOrphanedFiles();

    console.log(
      `[JOB] S3 cleanup job completed. Deleted ${result.deleted} of ${result.total} files.`,
    );
    return result;
  } catch (error) {
    console.error("[JOB] Error in S3 cleanup job:", error);
    throw error;
  }
}
