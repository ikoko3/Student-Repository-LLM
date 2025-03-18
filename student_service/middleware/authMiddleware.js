require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
const REGION = process.env.AWS_REGION;

const jwksUrl = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

// Create a JWKS client to fetch signing keys
const client = jwksClient({ jwksUri: jwksUrl });

async function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error fetching signing key:", err);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Middleware to validate JWT token from AWS Cognito
 */
async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decodedToken) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ message: "Invalid token." });
    }

    // Verify the token is issued for our app
    if (decodedToken.aud !== CLIENT_ID) {
      return res.status(403).json({ message: "Invalid token audience." });
    }

    req.user = decodedToken; // Attach user info to request
    next();
  });
}

function authorizeUser(validKeys = ["id", "studentId", "userId"]) {
  return (req, res, next) => {
    let userId = req.user?.["cognito:username"];
    //This is not a good practise...
    if (userId.includes("google")) userId = req.user?.sub;

    // Look for the correct ID in params, query, or body
    let paramId = null;

    for (const key of validKeys) {
      if (req.params[key]) paramId = req.params[key];
      if (req.query[key]) paramId = req.query[key];
      if (req.body[key]) paramId = req.body[key];
      if (paramId) break; // Stop searching once we find the first match
    }

    if (!userId || userId !== paramId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to access this resource." });
    }

    next(); // Proceed if authorized
  };
}

module.exports = { authenticateToken, authorizeUser };
