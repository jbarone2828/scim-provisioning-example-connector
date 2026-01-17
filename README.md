# SCIM GitHub Provisioning Connector

A SCIM 2.0 server that automates user provisioning to GitHub organizations. Similar to the custom connectors I built at CarMax using SailPoint ISC, but implemented from scratch to show I understand the underlying protocols.

## Why I Built This

After 8 years doing IAM work, I realized my resume shows enterprise tools (SailPoint, PingFederate, CyberArk) but not much code. This project demonstrates that I can build the integrations myself, not just configure vendor tools.

## What It Does

Implements SCIM 2.0 endpoints that provision users to GitHub:
- POST /Users - Invite users to org
- GET /Users - List members  
- DELETE /Users - Remove users
- GET /Users/{id} - Get specific user

The connector translates SCIM format into GitHub API calls, handling the authentication, error handling, and data mapping.

## Technical Details

**Stack:** TypeScript, Express, Octokit (GitHub API client)

**Key files:**
- `scim-server.ts` - SCIM endpoints and request handling
- `github-client.ts` - GitHub API wrapper with error handling
- `user-mapper.ts` - Data transformation between SCIM and GitHub formats

I used TypeScript because that's what is required for custom SailPoint connectors in ISC. The patterns are similar - REST API integration, data mapping, lifecycle operations.

### Audit Logging

All provisioning operations are logged to `logs/audit-YYYY-MM-DD.json` for compliance and troubleshooting:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "operation": "CREATE",
  "resource": "User",
  "resourceId": "jdoe",
  "status": "success",
  "details": {
    "email": "john.doe@example.com",
    "invitationId": 12345
  }
}
```

This audit trail supports:
- SOX compliance requirements
- Security incident investigation
- Access certification evidence
- Troubleshooting provisioning failures


## Running It
```bash
npm install
cp .env.example .env
# Add your GitHub token and org name to .env
npm run dev
```

Test with curl:
```bash
curl -X POST http://localhost:3000/Users \
  -H "Content-Type: application/json" \
  -d '{"schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"], "userName": "testuser", "emails": [{"value": "test@example.com"}]}'
```

## Real-World Context

This is a simplified version of what I did at CarMax - we had dozens of custom connectors interfacing with vendor APIs. The difference is I can't share that code (proprietary), so I rebuilt the pattern here to demonstrate:

- SCIM protocol knowledge
- REST API integration  
- TypeScript/Node.js development
- IAM concepts (provisioning, lifecycle, identity federation)

## What's Missing (Would Add in Production)

- Authentication on the SCIM endpoints
- PATCH support for attribute updates
- Group/team management
- Better error handling and retries
- Logging/monitoring
- Rate limiting

Built this as a portfolio piece while job hunting. Feel free to reach out if you want to discuss IAM architecture or implementation details.

**Joseph Barone**  
jbarone2828@gmail.com