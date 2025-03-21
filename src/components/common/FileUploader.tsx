// src/components/common/FileUploader.tsx

import React, { useState, useRef } from 'react';
import { isValidFileSize } from '../../utils/validators';
import { formatFileSize } from '../../utils/formatters';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
  error?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  accept = '*/*',
  maxSizeMB = 10,
  label = 'Upload File',
  className = '',
  error
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFileError('');
    
    if (!isValidFileSize(file.size, maxSizeBytes)) {
      setFileError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 mx-auto text-gray-400"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
        <p className="mt-2">{label}</p>
        <p className="text-sm text-gray-500 mt-1">
          {selectedFile ? selectedFile.name : `Drop your file here, or click to browse`}
        </p>
        {selectedFile && (
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(selectedFile.size)}
          </p>
        )}
      </div>
      {(fileError || error) && (
        <p className="text-red-500 text-sm mt-1">{fileError || error}</p>
      )}
    </div>
  );
};

export default FileUploader;