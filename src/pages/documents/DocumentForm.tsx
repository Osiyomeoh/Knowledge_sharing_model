// src/components/documents/DocumentForm.tsx

import React, { useState } from 'react';
import Button from '../../components/common/Button';
import FileUploader from '../../components/common/FileUploader';
import { Visibility } from '../../types/contracts';
import { isEmptyString } from '../../utils/validators';

interface DocumentFormProps {
  onSubmit: (
    name: string,
    file: File,
    documentType: string,
    visibility: Visibility,
    downloadable: boolean,
    tags: string[],
    editorNotes: string
  ) => Promise<void>;
  isLoading: boolean;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<Visibility>(Visibility.Private);
  const [downloadable, setDownloadable] = useState<boolean>(true);
  const [tagsInput, setTagsInput] = useState('');
  const [editorNotes, setEditorNotes] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    file: '',
    tags: '',
  });

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    
    // Auto-detect document type from file extension
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    console.log(`File extension: ${fileExtension}`);
  };

  const getDocumentType = (file: File): string => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Map common file extensions to document types
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const spreadsheetExtensions = ['xls', 'xlsx', 'csv'];
    const presentationExtensions = ['ppt', 'pptx'];
    
    if (imageExtensions.includes(fileExtension)) {
      return 'image';
    } else if (documentExtensions.includes(fileExtension)) {
      return fileExtension;
    } else if (spreadsheetExtensions.includes(fileExtension)) {
      return fileExtension;
    } else if (presentationExtensions.includes(fileExtension)) {
      return fileExtension;
    } else {
      return 'other';
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      file: '',
      tags: '',
    };
    
    if (isEmptyString(name)) {
      newErrors.name = 'Document name is required';
    }
    
    if (!file) {
      newErrors.file = 'Please upload a file';
    }
    
    // Validate tags (optional validation)
    const tagsArray = parseTags(tagsInput);
    if (tagsArray.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const parseTags = (tagsString: string): string[] => {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !file) {
      return;
    }
    
    try {
      const tags = parseTags(tagsInput);
      const documentType = getDocumentType(file);
      
      await onSubmit(
        name,
        file,
        documentType,
        visibility,
        downloadable,
        tags,
        editorNotes
      );
      
      // Reset form after successful submission
      setName('');
      setFile(null);
      setVisibility(Visibility.Private);
      setDownloadable(true);
      setTagsInput('');
      setEditorNotes('');
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Document Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter document name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload File *
        </label>
        <FileUploader
          onFileSelected={handleFileSelected}
          label={file ? `Selected: ${file.name}` : "Choose a file to upload"}
          error={errors.file}
          maxSizeMB={50}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(Number(e.target.value) as Visibility)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          >
            <option value={Visibility.Private}>Private (Only you and shared users)</option>
            <option value={Visibility.Restricted}>Restricted (You, shared users, and trusted users)</option>
            <option value={Visibility.Public}>Public (Anyone)</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="downloadable"
            checked={downloadable}
            onChange={(e) => setDownloadable(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="downloadable" className="ml-2 block text-sm text-gray-700">
            Allow downloading of this document
          </label>
        </div>
      </div>
      
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma separated)
        </label>
        <input
          type="text"
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.tags ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. report, finance, 2023"
          disabled={isLoading}
        />
        {errors.tags ? (
          <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Enter up to 10 tags separated by commas
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="editorNotes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id="editorNotes"
          value={editorNotes}
          onChange={(e) => setEditorNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="Add any notes about this document"
          disabled={isLoading}
        ></textarea>
      </div>
      
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          Upload Document
        </Button>
      </div>
    </form>
  );
};

export default DocumentForm;