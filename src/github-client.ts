import { Octokit } from '@octokit/rest';

export class GitHubClient {
  private octokit: Octokit;
  private org: string;

  constructor(token: string, org: string) {
    this.octokit = new Octokit({ auth: token });
    this.org = org;
  }

  async inviteUser(email: string, role: 'member' | 'admin' = 'member') {
    try {
      const response = await this.octokit.orgs.createInvitation({
        org: this.org,
        email: email,
        role: role,
      });
      
      console.log(`✓ Invited ${email} to ${this.org}`);
      return response.data;
    } catch (error: any) {
      console.error(`✗ Failed to invite ${email}:`, error.message);
      throw error;
    }
  }

  async removeUser(username: string) {
    try {
      await this.octokit.orgs.removeMembershipForUser({
        org: this.org,
        username: username,
      });
      
      console.log(`✓ Removed ${username} from ${this.org}`);
      return { success: true };
    } catch (error: any) {
      console.error(`✗ Failed to remove ${username}:`, error.message);
      throw error;
    }
  }

  async getUser(username: string) {
    try {
      const response = await this.octokit.orgs.getMembershipForUser({
        org: this.org,
        username: username,
      });
      
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async listMembers() {
    try {
      const response = await this.octokit.orgs.listMembers({
        org: this.org,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('✗ Failed to list members:', error.message);
      throw error;
    }
  }
}