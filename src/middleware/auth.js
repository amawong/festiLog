const jwt = require('jsonwebtoken')  // import JWT

// in express, middleware funcs receive three args: the request, response, and next
module.exports = (req, res, next) => {  
    // grabbing auth header from the request
    const header = req.headers.authorization

    // check if token exists
    // ?. is optional chaining; returns undefined instead of crashing
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token' })
    }
    // verify the token
    try {
        const token = header.split(' ')[1]
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.userId
        next()
    } catch {
        res.status(401).json({ error: 'Invalid token' })
    }
}
