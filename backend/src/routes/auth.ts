import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { registerSchema } from '../lib/schema';
import { loginSchema } from '../lib/schema';
import jwt from 'jsonwebtoken';

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

  if (!validUser) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, validUser.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // because email and password are valid, we are going to provide a JWT shortlived access token
  const payload = {userID: validUser.id};
  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_in_production';
  const accessToken = jwt.sign(payload, jwtSecret, {expiresIn: '15m'});

  return res.status(200).json({
    success: true,
    accessToken: accessToken
  })

})


export default router;