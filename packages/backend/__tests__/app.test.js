const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async (name = 'Temp Item to Delete') => {
  const response = await request(app)
    .post('/api/items')
    .send({ name })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('created_at');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'Test Item' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.status).toBe('Defined');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('Item To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update item name and status', async () => {
      const item = await createItem('Item To Update');

      const updateResponse = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: 'Updated Item', status: 'Started' })
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toMatchObject({
        id: item.id,
        name: 'Updated Item',
        status: 'Started',
      });
    });

    it('should update only status', async () => {
      const item = await createItem('Status Only Update');

      const updateResponse = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ status: 'Completed' })
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toMatchObject({
        id: item.id,
        name: 'Status Only Update',
        status: 'Completed',
      });
    });

    it('should return 400 for invalid status', async () => {
      const item = await createItem('Invalid Status Update');

      const updateResponse = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ status: 'Blocked' })
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.body).toHaveProperty('error', 'Valid status is required');
    });

    it('should return 400 with empty body', async () => {
      const item = await createItem('Empty Body Update');

      const updateResponse = await request(app)
        .put(`/api/items/${item.id}`)
        .send({})
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.body).toHaveProperty(
        'error',
        'At least one field (name or status) is required'
      );
    });

    it('should return 404 for missing item', async () => {
      const updateResponse = await request(app)
        .put('/api/items/999999')
        .send({ status: 'Started' })
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(404);
      expect(updateResponse.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id format', async () => {
      const updateResponse = await request(app)
        .put('/api/items/abc')
        .send({ status: 'Started' })
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.body).toHaveProperty('error', 'Valid item ID is required');
    });

    it('should return 400 for empty name when updating', async () => {
      const item = await createItem('Name Validation');

      const updateResponse = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: '   ' })
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.body).toHaveProperty('error', 'Item name is required');
    });

    it('should return 400 for non-string name when updating', async () => {
      const item = await createItem('Name Type Validation');

      const updateResponse = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: 123 })
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.body).toHaveProperty('error', 'Item name is required');
    });
  });
});