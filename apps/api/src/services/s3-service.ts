import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, BUCKET_NAME } from '../lib/s3.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { getPrisma } from '../lib/prisma.js';

export class S3Service {
  private s3Client: S3Client;
  private prisma: PrismaClient;
  private bucketName: string;

  constructor() {
    this.s3Client = getS3Client();
    this.prisma = getPrisma();
    this.bucketName = BUCKET_NAME;
  }

  /**
   * List all objects in the S3 bucket
   * @returns A list of object keys in the bucket
   */
  async listAllObjects(): Promise<string[]> {
    const keys: string[] = [];
    let continuationToken: string | undefined;

    try {
      do {
        const command = new ListObjectsV2Command({
          Bucket: this.bucketName,
          ContinuationToken: continuationToken,
        });

        const response = await this.s3Client.send(command);
        
        if (response.Contents) {
          for (const object of response.Contents) {
            if (object.Key) {
              keys.push(object.Key);
            }
          }
        }
        
        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      return keys;
    } catch (error) {
      console.error('Error listing objects in S3:', error);
      throw new Error(`Failed to list objects in S3 bucket ${this.bucketName}`);
    }
  }

  /**
   * Delete an object from S3
   * @param key The key of the object to delete
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Error deleting object ${key} from S3:`, error);
      throw new Error(`Failed to delete object ${key} from S3 bucket ${this.bucketName}`);
    }
  }

  /**
   * Extract S3 key from a file URL
   * @param url The URL of the file
   * @returns The S3 key extracted from the URL
   */
  extractKeyFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/');
      const key = pathParts[pathParts.length - 1]; // Get the last part of the path
      
      if (!key) {
        throw new Error(`Could not extract key from URL: ${url}`);
      }
      
      return key;
    } catch (error) {
      console.error(`Error extracting key from URL ${url}:`, error);
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  /**
   * Clean up orphaned files in S3 that don't exist in the database
   * @returns Statistics about the cleanup operation
   */
  async cleanupOrphanedFiles(): Promise<{ deleted: number, total: number }> {
    console.log('Starting S3 cleanup job...');
    
    try {
      // Step 1: Get all files from S3
      const s3Keys = await this.listAllObjects();
      console.log(`Found ${s3Keys.length} files in S3 bucket`);
      
      // Step 2: Get all files from database
      const dbFiles = await this.prisma.file.findMany({
        select: { url: true }
      });
      console.log(`Found ${dbFiles.length} files in database`);
      
      // Step 3: Extract keys from database file URLs
      const dbKeys = dbFiles.map(file => {
        try {
          return this.extractKeyFromUrl(file.url);
        } catch {
          console.warn(`Skipping invalid URL: ${file.url}`);
          return '';
        }
      }).filter(key => key.length > 0);
      
      // Step 4: Find keys in S3 that don't exist in the database
      const keysToDelete = s3Keys.filter(s3Key => !dbKeys.includes(s3Key));
      console.log(`Found ${keysToDelete.length} files to delete from S3`);
      
      // Step 5: Delete orphaned files from S3
      let deletedCount = 0;
      for (const key of keysToDelete) {
        try {
          await this.deleteObject(key);
          deletedCount++;
          console.log(`Deleted orphaned file from S3: ${key}`);
        } catch (error) {
          console.error(`Error deleting file ${key} from S3:`, error);
        }
      }
      
      console.log(`S3 cleanup completed. Deleted ${deletedCount} orphaned files.`);
      return { deleted: deletedCount, total: s3Keys.length };
    } catch (error) {
      console.error('Error in S3 cleanup job:', error);
      throw error;
    }
  }
}