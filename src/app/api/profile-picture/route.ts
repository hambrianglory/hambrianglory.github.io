import { NextRequest, NextResponse } from 'next/server';
import { ProfilePictureService } from '@/lib/profilePicture';
import { DataService } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('profilePicture') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = DataService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate image
    const validation = await ProfilePictureService.validateImageFile(buffer, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    // Delete existing profile picture if any
    if (user.profilePicture) {
      ProfilePictureService.deleteProfilePicture(user.profilePicture.id, userId);
    }

    // Save new profile picture
    const pictureInfo = await ProfilePictureService.saveProfilePicture(
      buffer,
      file.name,
      file.type,
      userId
    );

    // Update user with profile picture info
    const updatedUser = DataService.updateUser(userId, {
      profilePicture: {
        id: pictureInfo.id,
        originalName: pictureInfo.originalName,
        mimeType: pictureInfo.mimeType,
        size: pictureInfo.size,
        uploadedAt: pictureInfo.uploadedAt
      }
    });

    return NextResponse.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: {
        id: pictureInfo.id,
        originalName: pictureInfo.originalName,
        mimeType: pictureInfo.mimeType,
        size: pictureInfo.size,
        uploadedAt: pictureInfo.uploadedAt
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { message: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = DataService.getUserById(userId);
    if (!user || !user.profilePicture) {
      return NextResponse.json(
        { message: 'No profile picture found' },
        { status: 404 }
      );
    }

    // Delete profile picture files
    const deleted = ProfilePictureService.deleteProfilePicture(user.profilePicture.id, userId);
    
    if (deleted) {
      // Remove profile picture from user data
      DataService.updateUser(userId, {
        profilePicture: undefined
      });

      return NextResponse.json({
        message: 'Profile picture deleted successfully'
      });
    } else {
      return NextResponse.json(
        { message: 'Failed to delete profile picture' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Profile picture deletion error:', error);
    return NextResponse.json(
      { message: 'Failed to delete profile picture' },
      { status: 500 }
    );
  }
}
