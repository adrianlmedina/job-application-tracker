import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { createApplicationSchema, patchSchema } from '../lib/schema';

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

    return res.status(201).json({ application});
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


router.patch('/:id', requireAuth, async(req, res) => {
    // grab the user ID
    const { id } = req.params as { id: string};
    const userID = req.user!.userID;

    const parsed = patchSchema.safeParse(req.body);     // validate the body

    if (!parsed.success) {
        return res.status(400).json({
            error: 'validation failed',
            details: parsed.error.flatten().fieldErrors,
        });
    }

    const application = await prisma.application.findUnique({
        where: { id },
    });
    // check if the application is found
    if (!application) {
        return res.status(404).json({error: 'application not found'})
    }

    if (application.userId !== userID) {
        return res.status(403).json({ error: 'you do not have access to this application'});
    }

    // if the application is valid, then we want to updated that application
    const updatedApplication = await prisma.application.update({
        where: { id },
        data: parsed.data
    });

    return res.status(200).json({ application: updatedApplication})
});

router.delete('/:id', requireAuth, async(req, res) => {
    // grab the user ID
    const { id } = req.params as { id: string};
    const userID = req.user!.userID;

    const application = await prisma.application.findUnique({
        where: { id },
    });
    // check if the application is found
    if (!application) {
        return res.status(404).json({error: 'application not found'})
    }

    if (application.userId !== userID) {
        return res.status(403).json({ error: 'you do not have access to this application'});
    }

    await prisma.application.delete({
        where: { id },
    });

    return res.status(200).json({
        message: "your application has been deleted"
    })

});


export default router;