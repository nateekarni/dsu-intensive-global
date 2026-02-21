import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `profile-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`

    // Assuming the user is authenticated, we would normally extract their ID here
    // const userId = await getUserIdFromSession()

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: `profiles/${filename}`,
        Body: buffer,
        ContentType: file.type,
      }),
    )

    // The public URL of the uploaded image
    const publicUrl = `${process.env.CLOUDFLARE_PUBLIC_URL}/profiles/${filename}`

    // Here we would typically update the user's profile image URL in the DB via Better Auth
    // e.g. await db.update(users).set({ image: publicUrl }).where(eq(users.id, userId))

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Error uploading to R2:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
