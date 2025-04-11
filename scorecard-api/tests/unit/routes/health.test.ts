import request from 'supertest';
import { app } from '../../../src/app';
import { assert } from 'chai';
import { describe, it } from '@jest/globals';

describe('Health Check API', () => {
  it('should return 200 OK with status message', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);
    
    assert.property(response.body, 'status');
    assert.equal(response.body.status, 'OK');
  });
}); 