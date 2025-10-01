import { useState } from 'react';
import FileUploader from '../FileUploader';

export default function FileUploaderExample() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="p-8 max-w-2xl">
      <FileUploader
        files={files}
        onFilesChange={setFiles}
        multiple={true}
      />
    </div>
  );
}
