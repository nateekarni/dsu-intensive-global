import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 })
    }

    const verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    const secretKey = process.env.TURNSTILE_SECRET_KEY

    if (!secretKey) {
      console.error('Missing TURNSTILE_SECRET_KEY environment variable.')
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration' },
        { status: 500 },
      )
    }

    const res = await fetch(verifyEndpoint, {
      method: 'POST',
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })

    const data = await res.json()

    if (data.success) {
      // Token is valid
      return NextResponse.json({ success: true })
    } else {
      console.error('Turnstile verification failed:', data)
      return NextResponse.json({ success: false, error: 'Invalid captcha' }, { status: 400 })
    }
  } catch (error) {
    console.error('Turnstile error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
