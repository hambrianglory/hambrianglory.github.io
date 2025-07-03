'use client';

import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { Upload, User as UserIcon } from 'lucide-react';

interface SimpleProfilePictureProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function SimpleProfilePicture({ user, onUpdate, size = 'medium' }: SimpleProfilePictureProps) {
  const [uploading, setUploading] = useState(false);
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

    // Upload file
    uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file: File) => {
    if (user.id === 'temp') {
      alert('Please save the member first before uploading a profile picture');
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
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (user.id !== 'temp') {
      fileInputRef.current?.click();
    }
  };

  const getImageUrl = () => {
    if (!user.profilePicture || user.id === 'temp') return null;
    return `/api/profile-picture/view?userId=${user.id}&pictureId=${user.profilePicture.id}&type=thumbnail`;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer hover:border-blue-500`}>
        {imageUrl ? (
          // Show existing profile picture
          <img
            src={imageUrl}
            alt={user.name}
            className="w-full h-full object-cover"
            onClick={handleClick}
            onError={(e) => {
              // Fallback to default avatar on error
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          // Show default avatar
          <div 
            className="w-full h-full bg-gray-200 flex items-center justify-center"
            onClick={handleClick}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : (
              <UserIcon size={iconSizes[size]} className="text-gray-400" />
            )}
          </div>
        )}

        {/* Upload overlay */}
        {!uploading && user.id !== 'temp' && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
            onClick={handleClick}
          >
            <Upload size={iconSizes[size]} className="text-white" />
          </div>
        )}
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Info text */}
      {size === 'large' && user.id !== 'temp' && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {user.profilePicture ? 'Click to change photo' : 'Click to add photo'}
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, WebP up to 5MB
          </p>
        </div>
      )}

      {user.id === 'temp' && (
        <p className="text-xs text-gray-500 text-center">
          Save member first to add photo
        </p>
      )}
    </div>
  );
}
