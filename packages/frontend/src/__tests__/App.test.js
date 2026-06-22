import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let items = [];

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(items)
    );
  }),
  
  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item name is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: items.length + 1,
        name,
        status: 'Defined',
        created_at: new Date().toISOString(),
      })
    );
  }),

  // PUT /api/items/:id handler
  rest.put('/api/items/:id', (req, res, ctx) => {
    const itemId = Number.parseInt(req.params.id, 10);
    const target = items.find((item) => item.id === itemId);

    if (!target) {
      return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    }

    const { name, status } = req.body;

    if (typeof name !== 'undefined') {
      target.name = name;
    }

    if (typeof status !== 'undefined') {
      target.status = status;
    }

    return res(ctx.status(200), ctx.json(target));
  }),

  // DELETE /api/items/:id handler
  rest.delete('/api/items/:id', (req, res, ctx) => {
    const itemId = Number.parseInt(req.params.id, 10);
    items = items.filter((item) => item.id !== itemId);
    return res(ctx.status(200), ctx.json({ message: 'Item deleted successfully', id: itemId }));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
beforeEach(() => {
  items = [
    { id: 1, name: 'Test Item 1', status: 'Defined', created_at: '2023-01-02T00:00:00.000Z' },
    { id: 2, name: 'Test Item 2', status: 'Started', created_at: '2023-01-01T00:00:00.000Z' },
  ];
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('Todo Command Center')).toBeInTheDocument();
    expect(screen.getByText('Track, edit, and complete your tasks clearly.')).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Initially shows loading state
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('adds a new item', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });
    
    // Fill in the form and submit
    const input = screen.getByPlaceholderText('Enter task name');
    await act(async () => {
      await user.type(input, 'New Test Item');
    });
    
    const submitButton = screen.getByText('Add Task');
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Check that the new item appears
    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
  });

  test('updates task name through edit flow', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    await act(async () => {
      await user.click(editButtons[0]);
    });

    const editInput = screen.getByLabelText('Edit task name');
    await act(async () => {
      await user.clear(editInput);
      await user.type(editInput, 'Renamed Task');
      await user.click(screen.getByRole('button', { name: 'Save' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Renamed Task')).toBeInTheDocument();
    });
  });

  test('updates task status', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText('Status for Test Item 1');

    await act(async () => {
      await user.selectOptions(statusSelect, 'Completed');
    });

    await waitFor(() => {
      const updatedTask = screen.getByText('Test Item 1').closest('li');
      expect(updatedTask).toHaveTextContent('Completed');
    });
  });

  test('deletes a task from list', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await act(async () => {
      await user.click(deleteButtons[1]);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
    });
  });
});