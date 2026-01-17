import express, { Request, Response } from 'express';
import { GitHubClient } from './github-client';
import { UserMapper, SCIMUser } from './user-mapper';

export class SCIMServer {
  private app: express.Application;
  private githubClient: GitHubClient;

  constructor(githubClient: GitHubClient) {
    this.app = express();
    this.githubClient = githubClient;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    
    // Simple logging middleware
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    // SCIM Service Provider Config
    this.app.get('/ServiceProviderConfig', (req, res) => {
      res.json({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
        documentationUri: 'https://github.com/yourusername/scim-github-provisioner',
        patch: { supported: true },
        bulk: { supported: false },
        filter: { supported: false },
        changePassword: { supported: false },
        sort: { supported: false },
        etag: { supported: false },
        authenticationSchemes: [
          {
            type: 'oauthbearertoken',
            name: 'OAuth Bearer Token',
            description: 'Authentication using OAuth 2.0 Bearer Token',
          },
        ],
      });
    });

    // Create User (POST /Users)
    this.app.post('/Users', async (req: Request, res: Response) => {
      try {
        const scimUser: SCIMUser = req.body;
        const githubUser = UserMapper.scimToGitHub(scimUser);
        
        const result = await this.githubClient.inviteUser(githubUser.email, githubUser.role);
        
        // Return SCIM-formatted response
        res.status(201).json({
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          id: result.id.toString(),
          userName: scimUser.userName,
          emails: scimUser.emails,
          active: true,
          meta: {
            resourceType: 'User',
            created: result.created_at,
            location: `/Users/${result.id}`,
          },
        });
      } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: error.message,
          status: '500',
        });
      }
    });

    // Get User (GET /Users/:id)
    this.app.get('/Users/:id', async (req: Request, res: Response) => {
      try {
        const username = req.params.id;
        const githubUser = await this.githubClient.getUser(username);
        
        if (!githubUser) {
          return res.status(404).json({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'User not found',
            status: '404',
          });
        }

        const scimUser = UserMapper.gitHubToSCIM(githubUser.user, username);
        res.json(scimUser);
      } catch (error: any) {
        console.error('Error getting user:', error);
        res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: error.message,
          status: '500',
        });
      }
    });

    // Delete User (DELETE /Users/:id)
    this.app.delete('/Users/:id', async (req: Request, res: Response) => {
      try {
        const username = req.params.id;
        await this.githubClient.removeUser(username);
        
        res.status(204).send();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: error.message,
          status: '500',
        });
      }
    });

    // List Users (GET /Users)
    this.app.get('/Users', async (req: Request, res: Response) => {
      try {
        const members = await this.githubClient.listMembers();
        
        const scimUsers = members.map((member, index) => 
          UserMapper.gitHubToSCIM(member, member.login)
        );

        res.json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
          totalResults: scimUsers.length,
          startIndex: 1,
          itemsPerPage: scimUsers.length,
          Resources: scimUsers,
        });
      } catch (error: any) {
        console.error('Error listing users:', error);
        res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: error.message,
          status: '500',
        });
      }
    });
  }

  start(port: number) {
    this.app.listen(port, () => {
      console.log(`🚀 SCIM Server running on http://localhost:${port}`);
      console.log(`📋 Service Provider Config: http://localhost:${port}/ServiceProviderConfig`);
    });
  }
}