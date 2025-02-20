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

module.exports = { authenticateToken };
