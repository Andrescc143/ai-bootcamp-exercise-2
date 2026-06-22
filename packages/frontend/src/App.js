import React, { useState, useEffect } from 'react';
import './App.css';

const TASK_STATUSES = ['Defined', 'Started', 'Completed'];

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const result = await response.json();
      setData([result, ...data]);
      setNewItem('');
      setError(null);
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const updateItem = async (itemId, payload) => {
    setUpdatingItemId(itemId);

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      setData((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? updatedItem : item))
      );
      setError(null);
      return true;
    } catch (err) {
      setError('Error updating item: ' + err.message);
      console.error('Error updating item:', err);
      return false;
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setData(data.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditingName(item.name);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingName('');
  };

  const saveEditedItem = async (itemId) => {
    if (!editingName.trim()) return;

    const didSave = await updateItem(itemId, { name: editingName.trim() });
    if (didSave) {
      cancelEditing();
    }
  };

  const handleStatusChange = async (itemId, nextStatus) => {
    if (!TASK_STATUSES.includes(nextStatus)) return;
    await updateItem(itemId, { status: nextStatus });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo Command Center</h1>
        <p>Track, edit, and complete your tasks clearly.</p>
      </header>

      <main>
        <section className="add-item-section" aria-labelledby="add-task-heading">
          <h2 id="add-task-heading">Add New Task</h2>
          <form onSubmit={handleSubmit} aria-label="Add task form">
            <label htmlFor="new-task-input">Task name</label>
            <input
              id="new-task-input"
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter task name"
            />
            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="items-section" aria-labelledby="task-list-heading">
          <h2 id="task-list-heading">Task List</h2>
          {loading && <p role="status">Loading data...</p>}
          {error && <p className="error" role="alert">{error}</p>}
          {!loading && !error && (
            <ul aria-label="Task items">
              {data.length > 0 ? (
                data.map((item) => (
                  <li key={item.id}>
                    <div className="task-main">
                      {editingItemId === item.id ? (
                        <>
                          <label htmlFor={`edit-task-${item.id}`} className="sr-only">
                            Edit task name
                          </label>
                          <input
                            id={`edit-task-${item.id}`}
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                        </>
                      ) : (
                        <span className="task-name">{item.name}</span>
                      )}
                      <span className={`task-status task-status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="task-actions">
                      <label htmlFor={`status-${item.id}`} className="sr-only">
                        Change task status
                      </label>
                      <select
                        id={`status-${item.id}`}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        disabled={updatingItemId === item.id}
                        aria-label={`Status for ${item.name}`}
                      >
                        {TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {editingItemId === item.id ? (
                        <>
                          <button
                            onClick={() => saveEditedItem(item.id)}
                            className="save-btn"
                            type="button"
                            disabled={updatingItemId === item.id || !editingName.trim()}
                          >
                            Save
                          </button>
                          <button onClick={cancelEditing} className="cancel-btn" type="button">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditing(item)}
                          className="edit-btn"
                          type="button"
                          disabled={updatingItemId === item.id}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="delete-btn"
                        type="button"
                        disabled={updatingItemId === item.id}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p role="status">No items found. Add some!</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;