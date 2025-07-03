import { NextRequest, NextResponse } from 'next/server';
import { ProfilePictureService } from '@/lib/profilePicture';
import { DataService } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pictureId = searchParams.get('pictureId');
    const type = searchParams.get('type') || 'full'; // 'full' or 'thumbnail'

    if (!userId || !pictureId) {
      return NextResponse.json(
        { message: 'User ID and picture ID are required' },
        { status: 400 }
      );
    }

    // Verify user exists and has the profile picture
    const user = DataService.getUserById(userId);
    if (!user || !user.profilePicture || user.profilePicture.id !== pictureId) {
      return NextResponse.json(
        { message: 'Profile picture not found' },
        { status: 404 }
      );
    }

    let imageBuffer: Buffer | null;

    if (type === 'thumbnail') {
      imageBuffer = await ProfilePictureService.getThumbnail(pictureId, userId);
    } else {
      imageBuffer = await ProfilePictureService.getProfilePicture(pictureId, userId);
    }

    if (!imageBuffer) {
      return NextResponse.json(
        { message: 'Image file not found' },
        { status: 404 }
      );
    }

    // Return image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': type === 'thumbnail' ? 'image/jpeg' : user.profilePicture.mimeType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        'Content-Disposition': `inline; filename="${user.name}_${type}.jpg"`
      }
    });

  } catch (error) {
    console.error('Error serving profile picture:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve profile picture' },
      { status: 500 }
    );
  }
}
