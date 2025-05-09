import { router, procedure, TRPCError } from '../trpc.js';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { BUCKET_NAME } from '../lib/s3.js';
import { uploadFileSchema, deleteFileSchema } from 'shared';

export const filesRouter = router({
  // Get all files
  getFiles: procedure
    .query(async ({ ctx }) => {
      try {
        const files = await ctx.prisma.file.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return files;
      } catch (error) {
        console.error('Error fetching files:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch files',
        });
      }
    }),

  // Upload a file
  uploadFile: procedure
    .input(uploadFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Starting file upload:", input.name);

        const fileId = randomUUID();
        const key = `${fileId}-${input.name}`;
        
        console.log("Decoding base64 data...");
        // Base64 decoding and uploading to S3
        const fileBuffer = Buffer.from(input.file, 'base64');

        console.log("File buffer created, size:", fileBuffer.length);
        
        const putCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: fileBuffer,
          ContentType: input.contentType || 'application/octet-stream',
        });
        
        console.log("Attempting to upload to S3, bucket:", BUCKET_NAME);
        try {
          // Uploading the file to S3
          await ctx.s3.send(putCommand);
          console.log("S3 upload successful");
        } catch (s3Error) {
          console.error("S3 upload error:", s3Error);
          throw s3Error;
        }

        const getCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });

        // Generating a signed URL for the uploaded file
        const url = await getSignedUrl(ctx.s3, getCommand, { expiresIn: 3600 * 24 * 7 });
        
        // Creating a new file record in the database
        const file = await ctx.prisma.file.create({
          data: {
            name: input.name,
            url: url,
          },
        });
        
        // Sending a message to Kafka
        try {
          await ctx.kafka.send({
            topic: 'file_events',
            messages: [
              { 
                key: 'file_uploaded', 
                value: JSON.stringify({
                  fileId: file.id,
                  filename: file.name,
                  uploadedAt: file.createdAt
                })
              },
            ],
          });
        } catch (kafkaError) {
          console.error("Kafka error:", kafkaError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send Kafka message',
          });
        }
        
        console.log(`Kafka message sent: file_uploaded for file ID ${file.id}`);
        
        return file;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload file',
        });
      }
    }),

  // Delete a file
  deleteFile: procedure
    .input(deleteFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Getting the file from the database
        const file = await ctx.prisma.file.findUnique({
          where: { id: input },
        });
        
        if (!file) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'File not found',
          });
        }
        
        // Extracting the key from the file URL
        // Example URL: https://your-bucket-name.s3.amazonaws.com/your-file-key
        const url = new URL(file.url);
        const key = url.pathname.split('/').pop();
        
        if (!key) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Invalid file URL',
          });
        }
        
        // Deleting the file from S3
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });
        
        await ctx.s3.send(deleteCommand);
        
        // Deleting the file and its metadata from the database
        await ctx.prisma.file.delete({
          where: { id: input },
        });
        
        return { success: true, id: input };
      } catch (error) {
        console.error('Error deleting file:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file',
        });
      }
    }),
});