const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
require("dotenv").config({ path: ".env.local" });

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function loadSecrets() {
  try {
    const secretName = process.env.AWS_SECRET_NAME;
    if (!secretName) {
      console.error("❌ AWS_SECRET_NAME is missing in .env.local");
      process.exit(1);
    }

    console.log(`🔍 Fetching secret: ${secretName}`);
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await client.send(command);
    const secrets = JSON.parse(data.SecretString);

    Object.keys(secrets).forEach((key) => {
      process.env[key] = secrets[key];
    });

    console.log("✅ AWS Secrets loaded into environment variables");
    return true
  } catch (error) {
    console.error("❌ Error fetching secrets:", error);
  }
}

module.exports = loadSecrets;
