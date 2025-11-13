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

    if (!['audio', 'video', 'image'].includes(fieldType)) {
      return NextResponse.json(
        { error: 'Invalid fieldType. Must be: audio, video, or image' },
        { status: 400 }
      );
    }

    // Generate S3 key
    const s3Key = generateS3Key(fieldType as 'audio' | 'video' | 'image', filename);

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

