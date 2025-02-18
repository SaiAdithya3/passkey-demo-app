import { generateRegistrationOptions } from '@simplewebauthn/server';

// Temporary solution for demo - In production, use a proper database
let currentChallenge = '';

export async function POST(request: Request) {
  const body = await request.json();
  const { username } = body;

  const userID = new Uint8Array(Buffer.from(username));

  const options = await generateRegistrationOptions({
    rpName: 'Passkey Demo App',
    rpID: 'localhost',
    userID,
    userName: username,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    }
  });

  // Store challenge
  currentChallenge = options.challenge;

  return Response.json(options);
}

// Export the challenge for verification
export { currentChallenge };