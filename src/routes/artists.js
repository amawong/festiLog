const router = require('express').Router()
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

//GET - /api/artists       get all artists user has ranked

router.get('/', authMiddleware, async(req, res) => {
    try {
        const artists = await prisma.artist.findMany({
                where: {
                    sets: {
                        some: {
                            event: {
                                userId: req.userId
                            }
                        }
                    }
                },
                include: {
                    sets: {
                        where: {
                            event: {
                                userId: req.userId
                            }
                        }
                    }
                }
            })
        const ranked = artists.map(artist => {
            const ratings = artist.sets
                .filter(s => s.rating !== null)
                .map(s => s.rating)
            const avgRating = ratings.length? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null
            return { ...artist, avgRating}
        }).sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
        res.status(200).json({ ranked })
    } catch (e) {
        res.status(500).json({ error: 'Server error'})
    }
})

// GET /api/artists/:id
router.get('/:id', authMiddleware, async(req, res) => {
    const { id } = req.params
    try {
        const artist =  await prisma.artist.findUnique({ 
            where: { id },
            include: {
                sets: {
                    where: { event: { userId: req.userId } },
                    include: { event: true}
                }
            }
        })
        if (!artist) {
            return res.status(404).json({ error: 'Not found'})
        }
        res.json({ artist })
    } catch (e) {
        res.status(500).json({ error: 'Server error' })
    }
})


module.exports = router
