'use client';

import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { Camera, Upload, X, User as UserIcon } from 'lucide-react';

interface ProfilePictureProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function ProfilePicture({ user, onUpdate, readOnly = false, size = 'medium' }: ProfilePictureProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 16,
    medium: 24,
    large: 32
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file: File) => {
    if (user.id === 'temp') {
      alert('Please save the member first before uploading a profile picture');
      setPreview(null);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Update user with new profile picture
      const updatedUser: User = {
        ...user,
        profilePicture: result.profilePicture
      };
      
      onUpdate(updatedUser);
      setPreview(null); // Clear preview since we now have the real image
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture: ' + (error as Error).message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePicture = async () => {
    if (!confirm('Are you sure you want to delete the profile picture?')) {
      return;
    }

    try {
      const response = await fetch(`/api/profile-picture?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
      }

      // Update user without profile picture
      const updatedUser: User = {
        ...user,
        profilePicture: undefined
      };
      
      onUpdate(updatedUser);
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete profile picture: ' + (error as Error).message);
    }
  };

  const getImageUrl = (type: 'full' | 'thumbnail' = 'thumbnail'): string | null => {
    if (!user.profilePicture || user.id === 'temp') return null;
    return `/api/profile-picture/view?userId=${user.id}&pictureId=${user.profilePicture.id}&type=${type}`;
  };

  const handleClick = () => {
    if (!readOnly) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-300 ${!readOnly ? 'cursor-pointer hover:border-blue-500' : ''}`}>
        {preview ? (
          // Show preview while uploading
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : user.profilePicture ? (
          // Show existing profile picture
          <img
            src={getImageUrl('thumbnail') || '/default-avatar.svg'}
            alt={user.name}
            className="w-full h-full object-cover"
            onClick={handleClick}
          />
        ) : (
          // Show default avatar
          <div 
            className="w-full h-full bg-gray-200 flex items-center justify-center"
            onClick={handleClick}
          >
            <UserIcon size={iconSizes[size]} className="text-gray-400" />
          </div>
        )}

        {/* Upload overlay */}
        {!readOnly && !uploading && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
            onClick={handleClick}
          >
            {user.profilePicture ? (
              <Camera size={iconSizes[size]} className="text-white" />
            ) : (
              <Upload size={iconSizes[size]} className="text-white" />
            )}
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}

        {/* Delete button */}
        {!readOnly && user.profilePicture && !uploading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteProfilePicture();
            }}
            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* File input */}
      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {/* Upload button for small size */}
      {!readOnly && size === 'small' && !user.profilePicture && (
        <button
          onClick={handleClick}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Add Photo
        </button>
      )}

      {/* Info text */}
      {!readOnly && size === 'large' && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {user.profilePicture ? 'Click to change photo' : 'Click to add photo'}
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, WebP up to 5MB
          </p>
        </div>
      )}
    </div>
  );
}
