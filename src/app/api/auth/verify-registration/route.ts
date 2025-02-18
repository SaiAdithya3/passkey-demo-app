import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { currentChallenge } from '../register/route';

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: currentChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
    });

    if (verification.verified) {
      // TODO: Store the credential in database
      return Response.json({ verified: true });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Verification failed' }, { status: 400 });
  }
}