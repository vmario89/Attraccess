import * as Handlebars from 'handlebars';

describe('MQTT Template Rendering', () => {
  // Test context data
  const context = {
    id: 42,
    name: 'Test Resource',
    timestamp: '2023-05-01T12:34:56.789Z',
    user: {
      id: 123,
      username: 'johndoe',
    },
  };

  describe('Topic Templates', () => {
    it('should render simple topic template correctly', () => {
      const template = 'resources/{{id}}/status';
      const compiled = Handlebars.compile(template);
      const result = compiled(context);

      expect(result).toBe('resources/42/status');
    });

    it('should handle nested properties', () => {
      const template = 'users/{{user.id}}/resources/{{id}}';
      const compiled = Handlebars.compile(template);
      const result = compiled(context);

      expect(result).toBe('users/123/resources/42');
    });

    it('should handle missing properties gracefully', () => {
      const template = 'resources/{{id}}/{{nonExistentProperty}}';
      const compiled = Handlebars.compile(template);
      const result = compiled(context);

      expect(result).toBe('resources/42/');
    });

    it('should handle conditionals', () => {
      const template =
        'resources/{{id}}/{{#if user}}user-present{{else}}no-user{{/if}}';
      const compiled = Handlebars.compile(template);

      // With user
      let result = compiled(context);
      expect(result).toBe('resources/42/user-present');

      // Without user
      result = compiled({ ...context, user: null });
      expect(result).toBe('resources/42/no-user');
    });
  });

  describe('Message Templates', () => {
    it('should render JSON message template correctly', () => {
      const template =
        '{"resourceId":{{id}},"resourceName":"{{name}}","status":"in_use"}';
      const compiled = Handlebars.compile(template);
      const result = compiled(context);

      // Result should be valid JSON
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        resourceId: 42,
        resourceName: 'Test Resource',
        status: 'in_use',
      });
    });

    it('should include user information when available', () => {
      const template =
        '{"resourceId":{{id}},"resourceName":"{{name}}","user":"{{user.username}}"}';
      const compiled = Handlebars.compile(template);
      const result = compiled(context);

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        resourceId: 42,
        resourceName: 'Test Resource',
        user: 'johndoe',
      });
    });

    it('should handle escaped quotes in JSON', () => {
      const template =
        '{"name":"{{name}}","description":"Resource \\"{{name}}\\" status"}';
      const compiled = Handlebars.compile(template);
      const result = compiled(context);

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        name: 'Test Resource',
        description: 'Resource "Test Resource" status',
      });
    });

    it('should handle complex structures', () => {
      const template = `{
        "resource": {
          "id": {{id}},
          "name": "{{name}}"
        },
        "timestamp": "{{timestamp}}",
        "user": {{#if user}}{ "id": {{user.id}}, "name": "{{user.name}}" }{{else}}null{{/if}},
        "status": "active"
      }`;

      const compiled = Handlebars.compile(template);
      const result = compiled(context);

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        resource: {
          id: 42,
          name: 'Test Resource',
        },
        timestamp: '2023-05-01T12:34:56.789Z',
        user: {
          id: 123,
          name: 'John Doe',
        },
        status: 'active',
      });
    });
  });
});
