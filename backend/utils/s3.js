// S3 is optional — only used when AWS credentials are configured.
// Lessons can use direct video URLs (YouTube/Vimeo/MP4) without any AWS setup.

const hasAWS = !!(
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET_NAME
);

let s3Client = null;

const getS3 = async () => {
  if (!hasAWS) throw new Error('AWS S3 is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME in your .env file.');
  if (!s3Client) {
    const { S3Client } = await import('@aws-sdk/client-s3');
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

// Returns a pre-signed POST URL so the browser uploads directly to S3
export const getPresignedUploadUrl = async (key, contentType) => {
  const s3 = await getS3();
  const { createPresignedPost } = await import('@aws-sdk/s3-presigned-post');
  const { url, fields } = await createPresignedPost(s3, {
    Bucket:     process.env.S3_BUCKET_NAME,
    Key:        key,
    Conditions: [
      ['content-length-range', 0, 500 * 1024 * 1024],
      ['eq', '$Content-Type', contentType],
    ],
    Fields:  { 'Content-Type': contentType },
    Expires: 600,
  });
  return { url, fields };
};

// Returns a CloudFront or S3 URL for a video key
export const getCloudFrontSignedUrl = (videoKey) => {
  if (!videoKey) return '';
  if (process.env.CLOUDFRONT_DOMAIN) {
    return `${process.env.CLOUDFRONT_DOMAIN}/${videoKey}`;
  }
  // Fallback to direct S3 URL (only works if bucket is public)
  return process.env.S3_BUCKET_NAME
    ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${videoKey}`
    : '';
};

// Delete an object from S3
export const deleteS3Object = async (key) => {
  if (!key || !hasAWS) return;
  const s3 = await getS3();
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key:    key,
  }));
};
