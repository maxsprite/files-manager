import { z } from 'zod';

// Schema for file uploads
export const uploadFileSchema = z.object({
  name: z.string().min(1, 'Filename is required'),
  file: z.string().min(1, 'File content is required'), // Base64 encoded file
  contentType: z.string().optional(),
});

// Schema for file deletion
export const deleteFileSchema = z.number().int().positive('Invalid file ID');

// File response type
export const fileSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  createdAt: z.date()
});

// Types derived from schemas
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type DeleteFileInput = z.infer<typeof deleteFileSchema>;
export type File = z.infer<typeof fileSchema>;