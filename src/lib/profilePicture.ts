import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const ENCRYPTION_KEY = process.env.PROFILE_PICTURE_KEY || 'your-32-character-secret-key-here';
const ALGORITHM = 'aes-256-cbc';
const PROFILE_PICTURES_DIR = path.join(process.cwd(), 'private', 'profile-pictures');
const ENCRYPTED_DIR = path.join(PROFILE_PICTURES_DIR, 'encrypted');
const THUMBNAILS_DIR = path.join(PROFILE_PICTURES_DIR, 'thumbnails');

export interface ProfilePictureInfo {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  encryptedPath: string;
  thumbnailPath: string;
  uploadedAt: Date;
}

export class ProfilePictureService {
  private static encryptionKey = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

  static ensureDirectories(): void {
    [PROFILE_PICTURES_DIR, ENCRYPTED_DIR, THUMBNAILS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  static async saveProfilePicture(
    buffer: Buffer, 
    originalName: string, 
    mimeType: string,
    userId: string
  ): Promise<ProfilePictureInfo> {
    this.ensureDirectories();

    const pictureId = uuidv4();
    const ext = path.extname(originalName) || '.jpg';
    
    // Process image - resize and optimize
    const processedBuffer = await sharp(buffer)
      .resize(500, 500, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Create thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(150, 150, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Encrypt the main image
    const encryptedData = this.encryptBuffer(processedBuffer);
    
    // Save files
    const encryptedFileName = `${userId}_${pictureId}.enc`;
    const thumbnailFileName = `${userId}_${pictureId}_thumb.jpg`;
    
    const encryptedPath = path.join(ENCRYPTED_DIR, encryptedFileName);
    const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFileName);

    // Write encrypted main image
    fs.writeFileSync(encryptedPath, encryptedData);
    
    // Write thumbnail (not encrypted for faster loading)
    fs.writeFileSync(thumbnailPath, thumbnailBuffer);

    return {
      id: pictureId,
      originalName,
      mimeType,
      size: processedBuffer.length,
      encryptedPath,
      thumbnailPath,
      uploadedAt: new Date()
    };
  }

  static async getProfilePicture(pictureId: string, userId: string): Promise<Buffer | null> {
    try {
      const encryptedFileName = `${userId}_${pictureId}.enc`;
      const encryptedPath = path.join(ENCRYPTED_DIR, encryptedFileName);

      if (!fs.existsSync(encryptedPath)) {
        return null;
      }

      const encryptedData = fs.readFileSync(encryptedPath);
      return this.decryptBuffer(encryptedData);
    } catch (error) {
      console.error('Error getting profile picture:', error);
      return null;
    }
  }

  static async getThumbnail(pictureId: string, userId: string): Promise<Buffer | null> {
    try {
      const thumbnailFileName = `${userId}_${pictureId}_thumb.jpg`;
      const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFileName);

      if (!fs.existsSync(thumbnailPath)) {
        return null;
      }

      return fs.readFileSync(thumbnailPath);
    } catch (error) {
      console.error('Error getting thumbnail:', error);
      return null;
    }
  }

  static deleteProfilePicture(pictureId: string, userId: string): boolean {
    try {
      const encryptedFileName = `${userId}_${pictureId}.enc`;
      const thumbnailFileName = `${userId}_${pictureId}_thumb.jpg`;
      
      const encryptedPath = path.join(ENCRYPTED_DIR, encryptedFileName);
      const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFileName);

      if (fs.existsSync(encryptedPath)) {
        fs.unlinkSync(encryptedPath);
      }

      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }

      return true;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return false;
    }
  }

  private static encryptBuffer(buffer: Buffer): Buffer {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    // Prepend IV to encrypted data
    return Buffer.concat([iv, encrypted]);
  }

  private static decryptBuffer(encryptedBuffer: Buffer): Buffer {
    const iv = encryptedBuffer.slice(0, 16);
    const encrypted = encryptedBuffer.slice(16);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
    
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  }

  static async validateImageFile(buffer: Buffer, mimeType: string): Promise<{ valid: boolean; error?: string }> {
    // Check mime type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' };
    }

    // Check file size (5MB limit)
    if (buffer.length > 5 * 1024 * 1024) {
      return { valid: false, error: 'File too large. Maximum size is 5MB.' };
    }

    // Validate image with Sharp
    try {
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || !metadata.height) {
        return { valid: false, error: 'Invalid image file.' };
      }

      // Check dimensions (minimum 100x100, maximum 4000x4000)
      if (metadata.width < 100 || metadata.height < 100) {
        return { valid: false, error: 'Image too small. Minimum size is 100x100 pixels.' };
      }

      if (metadata.width > 4000 || metadata.height > 4000) {
        return { valid: false, error: 'Image too large. Maximum size is 4000x4000 pixels.' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid or corrupted image file.' };
    }
  }
}
