import { Component, OnInit } from "@angular/core";
import { NoteService } from "../../services/note.service";

@Component({
  selector: "app-notes",
  templateUrl: "./notes.component.html",
  styleUrls: ["./notes.component.css"],
})
export class NotesComponent implements OnInit {
  notes: any[] = [];

  loading = true;
  error = "";

  showForm = false;
  editingNoteId: number | null = null;

  currentUserId = 1;

  note = {
    user_id: this.currentUserId,
    title: "",
    content: "",
  };

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  // Load all notes
  loadNotes(): void {
    this.loading = true;
    this.error = "";

    this.noteService.getNotes(this.currentUserId).subscribe({
      next: (response: any) => {
        console.log("Notes API Response:", response);

        this.notes = Array.isArray(response)
          ? response
          : Array.isArray(response.notes)
          ? response.notes
          : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.notes)
          ? response.data.notes
          : [];

        console.log("Notes loaded:", this.notes);

        this.loading = false;
      },

      error: (err) => {
        console.error("Error loading notes:", err);
        this.error = "Unable to load notes.";
        this.loading = false;
      },
    });
  }

  // Open add note form
  openAddForm(): void {
    this.editingNoteId = null;

    this.note = {
      user_id: this.currentUserId,
      title: "",
      content: "",
    };

    this.showForm = true;
  }

  // Open edit note form
  openEditForm(note: any): void {
    this.editingNoteId = note.id;

    this.note = {
      user_id: this.currentUserId,
      title: note.title,
      content: note.content || "",
    };

    this.showForm = true;
  }

  // Close form
  closeForm(): void {
    this.showForm = false;
    this.editingNoteId = null;
  }

  // Create or update note
  saveNote(): void {
    if (!this.note.title.trim()) {
      alert("Please enter a note title.");
      return;
    }

    this.note.user_id = this.currentUserId;

    if (this.editingNoteId !== null) {
      this.noteService.updateNote(this.editingNoteId, this.note).subscribe({
        next: () => {
          this.closeForm();
          this.loadNotes();
        },
        error: (err) => {
          console.error("Error updating note:", err);
          alert("Unable to update note.");
        },
      });
    } else {
      this.noteService.createNote(this.note).subscribe({
        next: () => {
          this.closeForm();
          this.loadNotes();
        },
        error: (err) => {
          console.error("Error creating note:", err);
          alert("Unable to create note.");
        },
      });
    }
  }

  // Delete note
  deleteNote(id: number): void {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    this.noteService.deleteNote(id, this.currentUserId).subscribe({
      next: () => {
        this.loadNotes();
      },
      error: (err) => {
        console.error("Error deleting note:", err);
        alert("Unable to delete note.");
      },
    });
  }
}
