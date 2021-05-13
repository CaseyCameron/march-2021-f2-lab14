import client from '../lib/client.js';
import supertest from 'supertest';
import app from '../lib/app.js';
import { execSync } from 'child_process';

const request = supertest(app);

describe('API Routes', () => {
  afterAll(async () => {
    return client.end();
  });

  describe('/api/todos', () => {
    let user;

    beforeAll(async () => {
      execSync('npm run recreate-tables');

      const response = await request.post('/api/auth/signup').send({
        name: 'Me the User',
        email: 'me@user.com',
        password: 'password',
      });

      expect(response.status).toBe(200);

      user = response.body;
    });

    // append the token to your requests:
    //  .set('Authorization', user.token);
    let todo = {
      id: expect.any(Number),
      task: 'lab14',
      completed: false,
    };

    it('posts to /api/todos', async () => {
      todo.userId = user.id;
      const response = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send(todo);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(todo);
    });

    it.skip('gets from /api/todos', async () => {
      const response = await (
        await request.get('/api/todos')
      ).set('Authorization', user.token);
      expect(response.status).toBe(200);
      // expect(response.body).toEqual(?);
    });
  });
});
