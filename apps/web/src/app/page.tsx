"use client";

import Header from "@/components/header";
import { Card, CardContent, CardHeader } from "ui";
import UploadFiles from "@/components/upload-files";
import FilesGrid from "@/components/files-grid";
import { FilesTrgigger } from "@/contexts/files-trigger";
import { useState } from "react";

export default function Home() {
  const [filesTrigger, setFilesTrigger] = useState(0);

  return (
    <>
      <FilesTrgigger.Provider value={filesTrigger}>
        <div className="w-full min-h-screen bg-gradient-to-bl from-blue-50 to-violet-50">
          <Header />

          <Card className="bg-white max-w-6xl mx-auto mt-10 shadow-lg rounded-lg p-12">
            <CardHeader>
              <h2 className="text-2xl font-bold mx-auto">
                Upload what you want below
              </h2>
            </CardHeader>
            <CardContent className="mt-8 flex flex-col items-center justify-center">
              <UploadFiles
                filesTrigger={filesTrigger}
                setFilesTrigger={setFilesTrigger}
              />
            </CardContent>
          </Card>

          <div className="py-12 container mx-auto">
            <FilesGrid filesTrigger={filesTrigger} />
          </div>
        </div>
      </FilesTrgigger.Provider>
    </>
  );
}
