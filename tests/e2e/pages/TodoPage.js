const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
    this.newTaskInput = page.getByLabel('Task name');
    this.addTaskButton = page.getByRole('button', { name: 'Add Task' });
    this.taskList = page.getByRole('list', { name: 'Task items' });
    this.errorAlert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
  }

  taskListItemByName(name) {
    return this.page.locator('li', { hasText: name }).first();
  }

  async addTask(name) {
    await this.newTaskInput.fill(name);
    await this.addTaskButton.click();
  }

  async openEditForTask(name) {
    const listItem = this.taskListItemByName(name);
    await listItem.getByRole('button', { name: 'Edit' }).click();
  }

  async saveEdit(newName) {
    const editInput = this.page.getByLabel('Edit task name');
    await editInput.fill(newName);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async setStatus(taskName, status) {
    const listItem = this.taskListItemByName(taskName);
    await listItem.getByRole('combobox').selectOption(status);
  }

  async deleteTask(name) {
    const listItem = this.taskListItemByName(name);
    await listItem.getByRole('button', { name: 'Delete' }).click();
  }

  async expectTaskVisible(name) {
    await expect(this.taskListItemByName(name)).toBeVisible();
  }

  async expectTaskNotVisible(name) {
    await expect(this.taskListItemByName(name)).toHaveCount(0);
  }

  async expectStatusForTask(name, status) {
    const listItem = this.taskListItemByName(name);
    await expect(listItem.locator('.task-status')).toHaveText(status);
  }
}

module.exports = { TodoPage };
