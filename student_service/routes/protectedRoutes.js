// const express = require("express");
// const { authenticateToken } = require("../middleware/authMiddleware");
// const router = express.Router();

// /**
//  * @swagger
//  * /api/protected/secure-data:
//  *   get:
//  *     summary: Retrieve protected data
//  *     description: Requires a valid Cognito JWT token.
//  *     security:
//  *       - BearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved protected data
//  *       401:
//  *         description: Unauthorized - No token provided
//  *       403:
//  *         description: Forbidden - Invalid token
//  */
// router.get("/secure-data", authenticateToken, (req, res) => {
//   res.json({
//     message: "This is protected data",
//     user: req.user,
//   });
// });

// module.exports = router;
