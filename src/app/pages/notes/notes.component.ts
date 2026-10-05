import { Component, OnInit } from '@angular/core';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  notes: any[] = [];

  loading = true;
  error = '';

  showForm = false;
  editingNoteId: number | null = null;

  note = {
    user_id: 1,
    title: '',
    content: ''
  };

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading = true;
    this.error = '';

    this.noteService.getNotes().subscribe({
      next: (data) => {
        this.notes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.error = 'Unable to load notes.';
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.editingNoteId = null;

    this.note = {
      user_id: 1,
      title: '',
      content: ''
    };

    this.showForm = true;
  }

  openEditForm(note: any): void {
    this.editingNoteId = note.id;

    this.note = {
      user_id: note.user_id,
      title: note.title,
      content: note.content || ''
    };

    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingNoteId = null;
  }

  saveNote(): void {

    if (!this.note.title.trim()) {
      alert('Please enter a note title.');
      return;
    }

    if (this.editingNoteId) {

      this.noteService
        .updateNote(this.editingNoteId, this.note)
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadNotes();
          },
          error: (err) => {
            console.error('Error updating note:', err);
            alert('Unable to update note.');
          }
        });

    } else {

      this.noteService
        .createNote(this.note)
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadNotes();
          },
          error: (err) => {
            console.error('Error creating note:', err);
            alert('Unable to create note.');
          }
        });
    }
  }

  deleteNote(id: number): void {

    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    this.noteService.deleteNote(id).subscribe({
      next: () => {
        this.loadNotes();
      },
      error: (err) => {
        console.error('Error deleting note:', err);
        alert('Unable to delete note.');
      }
    });
  }
}