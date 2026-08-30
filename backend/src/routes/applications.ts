import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { createApplicationSchema } from '../lib/schema';

const router = Router();


// this creates a new application tied to the logged-in user
// it's validated by Zod
router.post('/', requireAuth, async (req, res) => {
    const parsed = createApplicationSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'validation failed',
            details: parsed.error.flatten().fieldErrors,
        });
    }
    // req.user is populated by requireAuth middleware
    // we know this request came from a logged-in user and we know which user
    const userID = req.user!.userID;

    const application = await prisma.application.create({
        data: {
            ... parsed.data,
            userId: userID,
        },
    });

    return res.status(201).json({ application });
});


// here we get a list of the user's applications
router.get('/', requireAuth, async (req, res) => {
    const userID = req.user!.userID;
    const applications = await prisma.application.findMany({
        where: {
            userId: userID},
    });

    return res.status(200).json({ applications});
});


export default router;