const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Todo critical journeys', () => {
  test('loads seeded tasks on initial render', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();

    await expect(page.getByRole('heading', { name: 'Todo Command Center' })).toBeVisible();
    await todoPage.expectTaskVisible('Item 1');
  });

  test('creates a new task', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await todoPage.addTask('E2E New Task');

    await todoPage.expectTaskVisible('E2E New Task');
  });

  test('edits an existing task name', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await todoPage.openEditForTask('Item 1');
    await todoPage.saveEdit('Item 1 Renamed');

    await todoPage.expectTaskVisible('Item 1 Renamed');
  });

  test('changes task status', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await todoPage.setStatus('Item 1', 'Completed');

    await todoPage.expectStatusForTask('Item 1', 'Completed');
  });

  test('deletes a task', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await todoPage.deleteTask('Item 1');

    await todoPage.expectTaskNotVisible('Item 1');
  });
});
