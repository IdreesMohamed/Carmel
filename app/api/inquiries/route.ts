import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const client = uri ? new MongoClient(uri) : null

export async function POST(request: Request) {
  if (!client) return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 })
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 160) : ''
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
      return NextResponse.json({ error: 'Name, valid email, and message are required' }, { status: 400 })
    }
    await client.connect()
    await client.db('carmel_printings').collection('inquiries').insertOne({ name, email, message, createdAt: new Date(), status: 'new' })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to save inquiry' }, { status: 500 })
  }
}
