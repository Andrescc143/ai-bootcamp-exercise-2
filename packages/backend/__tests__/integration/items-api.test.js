const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Items API integration', () => {
  it('supports create, update, and delete lifecycle', async () => {
    const createResponse = await request(app)
      .post('/api/items')
      .send({ name: 'Integration Task' })
      .set('Accept', 'application/json');

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      name: 'Integration Task',
      status: 'Defined',
    });

    const updateResponse = await request(app)
      .put(`/api/items/${createResponse.body.id}`)
      .send({ name: 'Integration Task Updated', status: 'Started' })
      .set('Accept', 'application/json');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: createResponse.body.id,
      name: 'Integration Task Updated',
      status: 'Started',
    });

    const deleteResponse = await request(app).delete(`/api/items/${createResponse.body.id}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      message: 'Item deleted successfully',
      id: createResponse.body.id,
    });
  });
});
