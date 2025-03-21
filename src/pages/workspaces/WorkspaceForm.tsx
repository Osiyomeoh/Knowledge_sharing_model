// src/components/workspaces/WorkspaceForm.tsx

import React, { useState } from 'react';
import Button from '../../components/common/Button';
import { isEmptyString } from '../../utils/validators';

interface WorkspaceFormProps {
  onSubmit: (name: string, description: string, isPrivate: boolean) => Promise<void>;
  isLoading: boolean;
  initialValues?: {
    name: string;
    description: string;
    isPrivate: boolean;
  };
  submitLabel?: string;
}

const WorkspaceForm: React.FC<WorkspaceFormProps> = ({ 
  onSubmit, 
  isLoading,
  initialValues,
  submitLabel = 'Create Workspace'
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate || false);
  const [errors, setErrors] = useState({
    name: '',
    description: ''
  });

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      description: ''
    };
    
    if (isEmptyString(name)) {
      newErrors.name = 'Workspace name is required';
    } else if (name.length > 50) {
      newErrors.name = 'Workspace name must be less than 50 characters';
    }
    
    if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(name, description, isPrivate);
    } catch (error) {
      console.error('Error in workspace form submission:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Workspace Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter workspace name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={4}
          placeholder="Describe the purpose of this workspace"
          disabled={isLoading}
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/500 characters
        </p>
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPrivate"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
          Make this workspace private (only invited members can access)
        </label>
      </div>
      
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default WorkspaceForm;