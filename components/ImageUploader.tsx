import React, { useRef } from 'react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  previewUrl: string | null;
  uploadedFile: File | null;
  isLoading: boolean;
}

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-2 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-semibold bg-slate-200 text-slate-700 px-2 py-1 rounded">{type}</span>
        </div>
    );
};


export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, previewUrl, uploadedFile, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const renderPreview = () => {
    if (previewUrl) {
      return <img src={previewUrl} alt="Image Preview" className="mx-auto max-h-80 rounded-lg object-contain" />;
    }
    if (uploadedFile) {
        let fileType = 'File';
        if (uploadedFile.type === 'application/pdf') {
            fileType = 'PDF';
        } else if (uploadedFile.type.includes('presentation')) {
            fileType = 'PPTX';
        }
      return (
        <div className="flex flex-col items-center justify-center space-y-4 text-slate-500">
          <FileIcon type={fileType} />
          <p className="font-semibold break-all">{uploadedFile.name}</p>
        </div>
      );
    }
    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-semibold">Cliquez pour uploader un fichier</p>
          <p className="text-sm">Image, PDF, ou PowerPoint</p>
        </div>
    );
  };

  return (
    <div 
      className={`relative border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center cursor-pointer hover:border-lime-500 transition-colors duration-300 ${isLoading ? 'opacity-50' : ''}`}
      onClick={!isLoading ? handleClick : undefined}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        disabled={isLoading}
      />
      {renderPreview()}
    </div>
  );
};