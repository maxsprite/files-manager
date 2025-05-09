import { CloudUploadIcon } from "lucide-react";

export default function Header() {
  return (<>
    <header className="flex items-center justify-between p-4">
      <h1 className="text-2xl font-bold flex items-center space-x-3">
        <CloudUploadIcon className="w-8 h-8" />
        <span>Files Manager</span>
      </h1>
    </header>
  </>);
}