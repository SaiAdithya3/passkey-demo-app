'use client';
import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import axios from 'axios';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';


type PublicKeyCredentialHint = 'hybrid' | 'security-key' | 'client-device';
type AttestationFormat = 'fido-u2f' | 'packed' | 'android-safetynet' | 'android-key' | 'tpm' | 'apple' | 'none';

export default function Home() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');

  const handleRegister = async () => {
    try {
      const optionsRes = await axios.post('/api/auth/register', { username });
      const options = optionsRes.data.json() as PublicKeyCredentialCreationOptionsJSON;

      const regResponse = await startRegistration({optionsJSON: options});

      const verificationRes = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, regResponse }),
      });
      
      const verification = await verificationRes.json();
      console.log(verification);
      
      if (verification.verified) {
        setStatus('Registration successful!');
      }
    } catch (error) {
      console.error(error);
      setStatus('Registration failed!');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Passkey Demo App</h1>
      <div className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Register with Passkey
        </button>
        {status && (
          <p className="text-center text-sm mt-2">{status}</p>
        )}
      </div>
    </div>
  );
}