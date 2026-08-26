import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { registerSchema, loginSchema, refreshSchema } from '../lib/schema';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

router.post('/register', async (req, res) => {
  // here we validate and compare the request body against our Zod schema
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { name, email, password } = parsed.data;

  // we check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  // hash the password so that we never ever store plain text
  const passwordHash = await bcrypt.hash(password, 10);

  // create the user in the database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  // finally we return that we've successfully registered a user and exclude the password
  return res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});


router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  

  // check if the email and password are valid inputs
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { email, password } = parsed.data;

  const validUser = await prisma.user.findUnique({
    where: { email },  
  })

  // checks if the user exists in DB
  if (!validUser) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // if the user is valid, then we get validUser's hashed password and compare it to the received password
  const isMatch = await bcrypt.compare(password, validUser.passwordHash);

  // if the received password does not match the validUser's hashed password, then it's not valid
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // because email and password are valid, we are going to provide a JWT shortlived access token
  const payload = {userID: validUser.id};
  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_in_production';
  const shortAccessToken = jwt.sign(payload, jwtSecret, {expiresIn: '15m'});

  // generating random refresh token
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenHash = await bcrypt.hash(rawRefreshToken, 10);

  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sevenDaysInMs);

  await prisma.refreshToken.create({
    data: {
      userId: validUser.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    },
  });

  return res.status(200).json({
    success: true,
    accessToken: shortAccessToken,
    refreshToken: rawRefreshToken,
  })

});


router.post('/refresh', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { refreshToken } = parsed.data;

  // we stored a hash not a raw token, os we need to fetch all currently valid tokens
  // and compare each one with bcrypt until we find a match

  const candidateTokens = await prisma.refreshToken.findMany({
    where: {
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  let matchedToken = null;


  for (const candidate of candidateTokens) {
    const isMatch = await bcrypt.compare(refreshToken, candidate.tokenHash);
    if (isMatch) {
      matchedToken = candidate;
      break;
    }
  }

  if (!matchedToken) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  // if the token is old, then revoke it so it's never used again
  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { revokedAt: new Date() },
  });


  // issuing a new access token
  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_in_production';
  const newAccessToken = jwt.sign(
    { userID: matchedToken.userId },
    jwtSecret,
    { expiresIn: '15m' }
  );
  
  // issuing a new access token
  const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
  const newRefreshTokenHash = await bcrypt.hash(newRawRefreshToken, 10);

  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sevenDaysInMs);

  await prisma.refreshToken.create({
    data: {
      userId: matchedToken.userId,
      tokenHash: newRefreshTokenHash,
      expiresAt,
    },
  });

  return res.status(200).json({
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRawRefreshToken,
  });
});

router.post('/logout', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { refreshToken } = parsed.data;

  const candidateTokens = await prisma.refreshToken.findMany({
    where: {
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  let matchedToken = null;

  for (const candidate of candidateTokens) {
    const isMatch = await bcrypt.compare(refreshToken, candidate.tokenHash);
    if (isMatch) {
      matchedToken = candidate;
      break;
    }
  }

  if (matchedToken) {
    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});


export default router;