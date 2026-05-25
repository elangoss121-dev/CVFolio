import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { connected } from '../config/db.js';
import { createUser as createUserRecord, findUserByEmail } from '../data/store.js';

const client = new OAuth2Client();

async function verifyGoogleToken(token, clientSideClientId) {
  // Gracefully support local mock/development testing
  if (process.env.NODE_ENV !== 'production' && token.startsWith('mock-google-token-')) {
    const username = token.replace('mock-google-token-', '');
    const email = `${username}@example.com`;
    const name = username.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      email,
      name,
      picture: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    };
  }

  const clientId = clientSideClientId || process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured on the server. Please add it to your environment variables or supply it.');
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });
  return ticket.getPayload();
}

export async function googleLogin(req, res) {
  try {
    const { token, clientId } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }

    const payload = await verifyGoogleToken(token, clientId);
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email could not be retrieved from Google account.' });
    }

    let user = null;

    if (!connected) {
      // In-memory fallback database
      user = findUserByEmail(email);
      if (!user) {
        user = createUserRecord({
          fullName: name,
          email: email,
          imageUrl: picture,
        });
      }
    } else {
      // Production MongoDB database
      user = await User.findOne({ email });
      if (!user) {
        user = new User({
          fullName: name,
          email: email,
          imageUrl: picture,
        });
        await user.save();
      }
    }

    res.status(200).json({
      message: 'Google authentication successful',
      user,
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({
      error: 'Google authentication failed',
      details: error.message,
    });
  }
}
