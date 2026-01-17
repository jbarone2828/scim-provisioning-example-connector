export interface SCIMUser {
  schemas: string[];
  userName: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails: Array<{
    value: string;
    primary?: boolean;
  }>;
  active: boolean;
}

export class UserMapper {
  // Convert SCIM user to GitHub invitation format
  static scimToGitHub(scimUser: SCIMUser) {
    const primaryEmail = scimUser.emails.find(e => e.primary)?.value || scimUser.emails[0]?.value;
    
    if (!primaryEmail) {
      throw new Error('User must have at least one email address');
    }

    return {
      email: primaryEmail,
      username: scimUser.userName,
      role: 'direct_member' as const,
    };
  }

  // Convert GitHub user to SCIM format
  static gitHubToSCIM(githubUser: any, id: string) {
    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: id,
      userName: githubUser.login,
      name: {
        givenName: githubUser.name?.split(' ')[0] || '',
        familyName: githubUser.name?.split(' ').slice(1).join(' ') || '',
      },
      emails: [
        {
          value: githubUser.email || `${githubUser.login}@users.noreply.github.com`,
          primary: true,
        },
      ],
      active: githubUser.state === 'active',
      meta: {
        resourceType: 'User',
        created: githubUser.created_at,
        lastModified: githubUser.updated_at,
      },
    };
  }
}