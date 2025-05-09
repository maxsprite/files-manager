"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

const fileUploaderAreaVariants = cva(
  "relative flex flex-col items-center justify-center w-full aspect-square p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400",
        accepted: "border-green-300 bg-green-50 hover:border-green-400",
        rejected: "border-red-300 bg-red-50 hover:border-red-400",
      },
      size: {
        default: "max-w-[300px]",
        sm: "max-w-[200px]",
        lg: "max-w-[400px]",
      },
      isLoading: {
        true: "opacity-70 cursor-wait",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface FileUploaderAreaProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onError">,
    VariantProps<typeof fileUploaderAreaVariants> {
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  isLoading?: boolean;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export const FileUploaderArea = React.forwardRef<
  HTMLDivElement,
  FileUploaderAreaProps
>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      onChange,
      onError,
      accept,
      multiple = false,
      maxSize,
      icon,
      description,
      children,
      ...props
    },
    ref,
  ) => {
    const [isDragActive, setIsDragActive] = React.useState(false);
    const [dragVariant, setDragVariant] = React.useState<
      "accepted" | "rejected" | undefined
    >(undefined);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleClick = () => {
      if (isLoading) return;
      inputRef.current?.click();
    };

    const validateFiles = (files: File[]): File[] => {
      // Filter files by accepted file types
      if (accept) {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        files = files.filter((file) => {
          const fileType = file.type || "";
          const fileExtension = `.${file.name.split(".").pop()}`;

          return acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
              // Extension match
              return fileExtension.toLowerCase() === type.toLowerCase();
            } else if (type.includes("*")) {
              // Wildcard match (e.g., "image/*")
              return fileType.match(new RegExp(type.replace("*", ".*")));
            } else {
              // Exact match
              return fileType === type;
            }
          });
        });

        if (files.length === 0) {
          onError?.("Files have unsupported format");
          return [];
        }
      }

      // Check file size limit
      if (maxSize) {
        files = files.filter((file) => file.size <= maxSize);
        if (files.length === 0) {
          onError?.(
            `File size exceeds maximum allowed (${formatSize(maxSize)})`,
          );
          return [];
        }
      }

      return multiple ? files : files[0] ? [files[0]] : [];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return;

      const fileList = Array.from(e.target.files);
      const validFiles = validateFiles(fileList);

      if (validFiles.length > 0) {
        onChange?.(validFiles);
      }

      // Clear the input value so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLoading) return;

      setIsDragActive(true);

      // Check if the dragged items are files
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const areAllFiles = Array.from(e.dataTransfer.items).every(
          (item) => item.kind === "file",
        );

        // Check file types if accept is provided
        if (areAllFiles && accept) {
          const filesMatch = Array.from(e.dataTransfer.items).some((item) => {
            const fileType = item.type || "";
            return accept.split(",").some((type) => {
              type = type.trim();
              if (type.includes("*")) {
                return fileType.match(new RegExp(type.replace("*", ".*")));
              }
              return type === fileType;
            });
          });

          setDragVariant(filesMatch ? "accepted" : "rejected");
        } else {
          setDragVariant(areAllFiles ? "accepted" : "rejected");
        }
      }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragActive(false);
      setDragVariant(undefined);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragActive(false);
      setDragVariant(undefined);

      if (isLoading) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileList = Array.from(e.dataTransfer.files);
        const validFiles = validateFiles(fileList);

        if (validFiles.length > 0) {
          onChange?.(validFiles);
        }
      }
    };

    // Helper function to format file size
    const formatSize = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
      <div
        className={cn(
          fileUploaderAreaVariants({
            variant: isDragActive ? dragVariant : variant,
            size,
            isLoading,
          }),
          className,
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={isLoading}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
            <div className="h-8 w-8 rounded-full border-2 border-current border-t-transparent animate-spin" />
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-2">
          {icon || (
            <div className="mb-4 text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={48}
                height={48}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-files-icon lucide-files"
              >
                <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
                <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
                <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
              </svg>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <span className="text-lg font-semibold text-blue-600">
              {isDragActive
                ? dragVariant === "accepted"
                  ? "Great! Release to upload"
                  : "This file format is not supported"
                : "Drag files here"}
            </span>

            {description || (
              <span className="text-sm text-slate-500">
                {multiple
                  ? "or select files from your computer"
                  : "or select a file from your computer"}
                {accept && (
                  <span className="block mt-1 text-xs">
                    Supported formats:{" "}
                    {accept.replace(/\./g, "").replace(/,/g, ", ")}
                  </span>
                )}
                {maxSize && (
                  <span className="block mt-1 text-xs">
                    Maximum size: {formatSize(maxSize)}
                  </span>
                )}
              </span>
            )}
          </div>

          {children}
        </div>
      </div>
    );
  },
);

FileUploaderArea.displayName = "FileUploaderArea";

export { fileUploaderAreaVariants };
