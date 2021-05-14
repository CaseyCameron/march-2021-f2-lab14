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
    let todo1 = {
      id: expect.any(Number),
      task: 'lab14',
      completed: false,
      shared: false,
    };

    let todo2 = {
      id: expect.any(Number),
      task: 'cc14',
      completed: false,
      shared: false,
    };

    let todo3 = {
      id: expect.any(Number),
      task: 'read14',
      completed: false,
      shared: true,
    };

    it('posts to /api/todos', async () => {
      todo1.userId = user.id;
      const response1 = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send(todo1);

      expect(response1.status).toBe(200);
      expect(response1.body).toEqual(todo1);

      todo2.userId = user.id;
      const response2 = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send(todo2);

      expect(response2.status).toBe(200);
      expect(response2.body).toEqual(todo2);

      todo3.userId = user.id;
      const response3 = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send(todo3);

      expect(response3.status).toBe(200);
      expect(response3.body).toEqual(todo3);
    });

    it('gets from /api/me/todos', async () => {
      const response = await request
        .get('/api/me/todos')
        .set('Authorization', user.token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([todo1, todo2, todo3]);
      [todo1, todo2, todo3] = response.body;
    });

    it('puts into /api/todos/:id/completed', async () => {
      todo1.completed = todo1.completed ? false : true;
      const response = await request
        .put(`/api/todos/${todo1.id}/completed`)
        .set('Authorization', user.token)
        .send(todo1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(todo1);
    });

    it('puts into /api/todos/:id/shared', async () => {
      todo2.shared = todo2.shared ? false : true;
      const response = await request
        .put(`/api/todos/${todo2.id}/shared`)
        .set('Authorization', user.token)
        .send(todo2);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(todo2);
    });

    it('gets from /api/todos', async () => {
      const response = await request
        .get('/api/todos')
        .set('Authorization', user.token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          { ...todo2, userName: user.name },
          { ...todo3, userName: user.name },
        ])
      );
    });

    it('deletes from /api/todos/:id', async () => {
      const response = await request
        .delete(`/api/todos/${todo2.id}`)
        .set('Authorization', user.token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(todo2);
    });
  });
});
