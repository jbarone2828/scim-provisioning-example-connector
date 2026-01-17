import dotenv from 'dotenv';
import { GitHubClient } from './github-client';
import { SCIMServer } from './scim-server';

// Load environment variables
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG;
const PORT = parseInt(process.env.PORT || '3000');

if (!GITHUB_TOKEN || !GITHUB_ORG) {
  console.error('❌ Error: GITHUB_TOKEN and GITHUB_ORG must be set in .env file');
  process.exit(1);
}

// Initialize GitHub client
const githubClient = new GitHubClient(GITHUB_TOKEN, GITHUB_ORG);

// Start SCIM server
const scimServer = new SCIMServer(githubClient);
scimServer.start(PORT);