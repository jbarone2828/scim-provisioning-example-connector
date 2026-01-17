import { UserMapper } from '../src/user-mapper';

describe('UserMapper', () => {
  describe('scimToGitHub', () => {
    it('should convert SCIM user to GitHub format', () => {
      const scimUser = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'jdoe',
        emails: [
          { value: 'john.doe@example.com', primary: true }
        ],
        active: true
      };

      const result = UserMapper.scimToGitHub(scimUser);

      expect(result.email).toBe('john.doe@example.com');
      expect(result.username).toBe('jdoe');
      expect(result.role).toBe('direct_member');
    });

    it('should use first email if no primary is specified', () => {
      const scimUser = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'jdoe',
        emails: [
          { value: 'john.doe@example.com' }
        ],
        active: true
      };

      const result = UserMapper.scimToGitHub(scimUser);

      expect(result.email).toBe('john.doe@example.com');
    });

    it('should throw error if no email provided', () => {
      const scimUser = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'jdoe',
        emails: [],
        active: true
      };

      expect(() => UserMapper.scimToGitHub(scimUser)).toThrow('User must have at least one email address');
    });
  });
});