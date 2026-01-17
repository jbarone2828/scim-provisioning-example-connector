# Architecture

## High-Level Overview
```
┌─────────────────────┐
│   Identity Provider │
│  (SailPoint, Okta)  │
└──────────┬──────────┘
           │ SCIM 2.0
           │ HTTP/JSON
           ▼
┌──────────────────────┐
│   SCIM Server        │
│  (Express.js)        │
│  ┌────────────────┐  │
│  │ POST /Users    │  │
│  │ GET  /Users    │  │
│  │ DELETE /Users  │  │
│  └────────────────┘  │
└──────────┬───────────┘
           │
           │ User Mapper
           │ (Transform data)
           ▼
┌──────────────────────┐
│   GitHub Client      │
│  (Octokit wrapper)   │
└──────────┬───────────┘
           │ GitHub REST API
           │ HTTPS
           ▼
┌──────────────────────┐
│   GitHub.com         │
│  Organization        │
└──────────────────────┘
```

## Request Flow

1. **IGA System initiates provisioning**
   - SailPoint detects new hire in HR system
   - Sends SCIM POST /Users request

2. **SCIM Server receives request**
   - Validates SCIM schema
   - Logs the operation
   - Routes to appropriate handler

3. **User Mapper transforms data**
   - Converts SCIM user object to GitHub format
   - Maps email, username, role

4. **GitHub Client executes API call**
   - Authenticates with Personal Access Token
   - Invites user to organization
   - Returns invitation ID

5. **SCIM Server returns response**
   - Formats response in SCIM standard
   - Returns 201 Created with user object
   - IGA system receives confirmation

## Error Handling
```
Request → Validation → Transform → API Call → Response
   ↓          ↓            ↓          ↓          ↓
  400       400          500        500        2xx
 (Bad      (Invalid     (Mapping  (GitHub   (Success)
Request)   Schema)       Error)    Error)
```

## Security

- **Authentication**: GitHub Personal Access Token (admin:org scope)
- **Transport**: HTTPS only in production
- **Secrets**: Environment variables, never committed
- **Audit**: All operations logged to console (production: log aggregation)