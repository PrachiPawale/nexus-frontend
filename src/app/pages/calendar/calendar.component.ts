import { Component, OnInit } from "@angular/core";
import { CalendarService } from "../../services/calendar.service";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.css"],
})
export class CalendarComponent implements OnInit {

  events: any[] = [];

  loading = true;
  error = "";

  showForm = false;
  editingEventId: number | null = null;

  currentUserId = 1;

  event = {
    user_id: this.currentUserId,
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  };

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  // Load all calendar events
  loadEvents(): void {
    this.loading = true;
    this.error = "";

    this.calendarService.getEvents(this.currentUserId).subscribe({
      next: (response: any) => {
        console.log("Calendar API Response:", response);

        this.events = Array.isArray(response)
          ? response
          : Array.isArray(response.events)
          ? response.events
          : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.events)
          ? response.data.events
          : [];

        console.log("Calendar events loaded:", this.events);

        this.loading = false;
      },

      error: (err) => {
        console.error("Error loading calendar events:", err);
        this.error = "Unable to load calendar events.";
        this.loading = false;
      },
    });
  }

  // Open add event form
  openAddForm(): void {
    this.editingEventId = null;

    this.event = {
      user_id: this.currentUserId,
      title: "",
      description: "",
      start_time: "",
      end_time: "",
    };

    this.showForm = true;
  }

  // Open edit event form
  openEditForm(event: any): void {
    this.editingEventId = event.id;

    this.event = {
      user_id: this.currentUserId,
      title: event.title,
      description: event.description || "",
      start_time: event.start_time
        ? this.formatDateTime(event.start_time)
        : "",
      end_time: event.end_time
        ? this.formatDateTime(event.end_time)
        : "",
    };

    this.showForm = true;
  }

  // Format date for datetime-local input
  formatDateTime(date: string): string {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Close event form
  closeForm(): void {
    this.showForm = false;
    this.editingEventId = null;
  }

  // Create or update event
  saveEvent(): void {
    if (!this.event.title.trim()) {
      alert("Please enter an event title.");
      return;
    }

    if (!this.event.start_time) {
      alert("Please select a start time.");
      return;
    }

    if (
      this.event.end_time &&
      new Date(this.event.end_time) <= new Date(this.event.start_time)
    ) {
      alert("End time must be after start time.");
      return;
    }

    this.event.user_id = this.currentUserId;

    if (this.editingEventId !== null) {
      this.calendarService
        .updateEvent(this.editingEventId, this.event)
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadEvents();
          },
          error: (err) => {
            console.error("Error updating event:", err);
            alert("Unable to update event.");
          },
        });
    } else {
      this.calendarService.createEvent(this.event).subscribe({
        next: () => {
          this.closeForm();
          this.loadEvents();
        },
        error: (err) => {
          console.error("Error creating event:", err);
          alert("Unable to create event.");
        },
      });
    }
  }

  // Delete event
  deleteEvent(id: number): void {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    this.calendarService.deleteEvent(id, this.currentUserId).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: (err) => {
        console.error("Error deleting event:", err);
        alert("Unable to delete event.");
      },
    });
  }
}