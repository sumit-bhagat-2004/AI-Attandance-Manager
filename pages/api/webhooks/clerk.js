import { Webhook } from 'svix';
import { NextResponse } from 'next/server';

// Webhook secret from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    // Get the headers
    const headerPayload = req.headers;
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(webhookSecret);

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred', {
        status: 400
      });
    }

    // Handle the webhook
    const { type, data } = evt;
    console.log(`Webhook received: ${type}`);

    // Block non-AOT email addresses
    if (type === 'user.created' || type === 'user.updated') {
      const user = data;
      const email = user.email_addresses?.[0]?.email_address;
      
      if (email && !email.endsWith('@aot.edu.in')) {
        console.log(`🚫 Blocking non-AOT email: ${email}`);
        
        // You can use Clerk's Backend API to delete the user
        // or mark them as banned
        return NextResponse.json({
          success: false,
          message: 'Only @aot.edu.in email addresses are allowed'
        }, { status: 403 });
      }
      
      console.log(`✅ Approved AOT email: ${email}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }
}
