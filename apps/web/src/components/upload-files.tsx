"use client";

import { FileUploaderArea } from "ui";
import { client } from "@/utils/trpc";

export default function UploadFiles({
  filesTrigger,
  setFilesTrigger
}: {
  filesTrigger: number;
  setFilesTrigger: (value: number) => void;
}) {
  const handleFileChange = async (files: File[]) => {
    console.log("Files changed:", files);

    // Temporary solution: upload files one by one
    for (const file of files) {
      const base64 = await fileToBase64(file);
      
      // Upload the file to the server
      await client.files.uploadFile.mutate({
        name: file.name,
        file: base64.split(',')[1], // Delete prefix "data:image/jpeg;base64,"
        contentType: file.type
      });
    }

    setFilesTrigger(filesTrigger + 1);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (<>
    <FileUploaderArea multiple={true} onChange={handleFileChange} />
  </>);
}
