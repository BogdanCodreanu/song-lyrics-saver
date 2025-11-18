import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/clerk-helpers';
import { getPresignedUploadUrl, generateS3Key } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    // Verify user is admin
    await requireAdmin();

    const body = await request.json();
    const { filename, contentType, fieldType } = body;

    if (!filename || !contentType || !fieldType) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, contentType, fieldType' },
        { status: 400 }
      );
    }

    if (!['audio', 'video', 'image', 'metadata-image'].includes(fieldType)) {
      return NextResponse.json(
        { error: 'Invalid fieldType. Must be: audio, video, image, or metadata-image' },
        { status: 400 }
      );
    }

    // Validate content type for metadata-image
    if (fieldType === 'metadata-image' && !contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'metadata-image must have an image content type' },
        { status: 400 }
      );
    }

    // Generate S3 key
    const s3Key = generateS3Key(fieldType as 'audio' | 'video' | 'image' | 'metadata-image', filename);

    // Get presigned URL
    const presignedUrl = await getPresignedUploadUrl(s3Key, contentType);

    return NextResponse.json({
      presignedUrl,
      s3Key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
