"use client";

import { useEffect, useState } from "react";
import { File } from "shared";
import { client } from "@/utils/trpc";
import { Button, Card, CardContent, CardFooter, CardHeader } from "ui";

export default function FilesGrid({
  filesTrigger
}: {
  filesTrigger: number;
}) {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchFiles();
  }, [filesTrigger]);

  const fetchFiles = async () => {
    const response = await client.files.getFiles.query();
    if (response) {
      const files = response.map(file => ({
        ...file,
        createdAt: new Date(file.createdAt)
      }));
      setFiles(files);
    }
  }

  const handleDelete = async (fileId: number) => {
    try {
      await client.files.deleteFile.mutate(fileId);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  return (<>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <Card key={file.id}>
          <CardHeader>
            <h2 className="text-lg font-bold">{file.name}</h2>
            <p className="text-sm text-gray-500">
              {file.createdAt.toLocaleDateString(undefined, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })} 
              {` `}
              {file.createdAt.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </p>
          </CardHeader>
          <CardContent>
            <a 
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer hover:underline hover:text-blue-500"
            >
              Link to file
            </a>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={() => handleDelete(file.id)}>Delete</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </>);
}