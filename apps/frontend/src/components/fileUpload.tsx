import React, { useCallback, useEffect, useState } from 'react';
import { useToastMessage } from './toastProvider';
import { ImageIcon, X } from 'lucide-react';

interface FileUploadProps {
  id: string;
  label: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({
  id,
  label,
  onChange,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { error } = useToastMessage();

  useEffect(() => {
    // Clean up the object URL when component unmounts or when a new file is selected
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
        error({
          title: 'Invalid file type',
          description: `Please upload a valid image file (${ALLOWED_MIME_TYPES.join(
            ', '
          )})`,
        });
        return false;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        error({
          title: 'File too large',
          description: `File size must be less than ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
        });
        return false;
      }

      return true;
    },
    [error]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file && !validateFile(file)) {
        e.target.value = '';
        setSelectedFile(null);
        setPreviewUrl(null);
        onChange(null);
        return;
      }

      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setSelectedFile(null);
        setPreviewUrl(null);
      }

      onChange(file);
    },
    [onChange, validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file && !validateFile(file)) {
        setSelectedFile(null);
        setPreviewUrl(null);
        onChange(null);
        return;
      }

      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        onChange(file);
      }
    },
    [onChange, validateFile]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onChange(null);
  }, [onChange]);

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <div
        className={`relative ${
          isDragActive
            ? 'border-blue-500'
            : 'border-gray-300 dark:border-gray-700'
        } border-2 border-dashed rounded-lg p-4 transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={id}
          accept={ALLOWED_MIME_TYPES.join(',')}
          onChange={handleFileChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {!selectedFile && (
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Drag and drop an image here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Accepted formats: JPEG, PNG, WebP (max{' '}
              {MAX_FILE_SIZE / 1024 / 1024}
              MB)
            </p>
          </div>
        )}

        {selectedFile && previewUrl && (
          <div className="relative">
            <button
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900 rounded-full text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative w-full aspect-video">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
