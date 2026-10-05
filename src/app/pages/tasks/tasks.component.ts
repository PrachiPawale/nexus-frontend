import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  tasks: any[] = [];

  loading = true;
  error = '';

  showForm = false;
  editingTaskId: number | null = null;

  task = {
    user_id: 1,
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: ''
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;

    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.error = 'Unable to load tasks.';
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.editingTaskId = null;

    this.task = {
      user_id: 1,
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: ''
    };

    this.showForm = true;
  }

  openEditForm(task: any): void {
    this.editingTaskId = task.id;

    this.task = {
      user_id: task.user_id,
      title: task.title,
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      due_date: task.due_date
        ? task.due_date.substring(0, 16)
        : ''
    };

    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingTaskId = null;
  }

  saveTask(): void {

    if (!this.task.title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    if (this.editingTaskId) {

      this.taskService
        .updateTask(this.editingTaskId, this.task)
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error updating task:', err);
            alert('Unable to update task.');
          }
        });

    } else {

      this.taskService
        .createTask(this.task)
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error creating task:', err);
            alert('Unable to create task.');
          }
        });
    }
  }

  deleteTask(id: number): void {

    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        alert('Unable to delete task.');
      }
    });
  }
}