import { Component } from "@angular/core";
import { VoiceService } from "./services/voice.service";
import { VoiceCommandService } from "./services/voice-command.service";
import { TaskService } from "./services/task.service";
import { CalendarService } from "./services/calendar.service";
import { NoteService } from "./services/note.service";
import { GoalService } from "./services/goal.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  voiceResponse = "";
  voiceResponseVisible = false;
  title = "frontend";
  constructor(
    public voiceService: VoiceService,
    public voiceCommandService: VoiceCommandService,
    public taskService: TaskService,
    public calendarService: CalendarService,
    public noteService: NoteService,
    public goalService: GoalService
  ) {
    this.voiceService.onCommand = (text: string) => {
      const command = this.voiceCommandService.parseCommand(text);

      console.log("Recognized command:", command);

      this.executeVoiceCommand(command);
    };
  }

  showVoiceResponse(message: string): void {
    this.voiceResponse = message;
    this.voiceResponseVisible = true;

    setTimeout(() => {
      console.log("Hiding Nexus response");

      this.voiceResponseVisible = false;
      this.voiceResponse = "";
    }, 5000);
  }

  toggleVoice(): void {
    if (this.voiceService.isListening) {
      this.voiceService.stopListening();
    } else {
      this.voiceService.startListening();
    }
  }

  processVoiceCommand(): void {
    const transcript = this.voiceService.transcript;

    if (!transcript) {
      return;
    }

    const command = this.voiceCommandService.parseCommand(transcript);

    console.log("Recognized command:", command);
  }

  executeVoiceCommand(command: any): void {
    // TASK - CREATE
    if (command.type === "task" && command.action === "create") {
      this.createTaskFromVoice(command.text);
      return;
    }

    // TASK - SHOW
    if (command.type === "task" && command.action === "show") {
      this.showTasksFromVoice();
      return;
    }

    // TASK - UPDATE
    if (command.type === "task" && command.action === "update") {
      this.updateTaskFromVoice(command.text);
      return;
    }

    // TASK - DELETE
    if (command.type === "task" && command.action === "delete") {
      this.deleteTaskFromVoice(command.text);
      return;
    }

    // CALENDAR - CREATE
    if (command.type === "calendar" && command.action === "create") {
      this.createCalendarEventFromVoice(command.text);
      return;
    }

    // CALENDAR - SHOW
    if (command.type === "calendar" && command.action === "show") {
      this.showCalendarFromVoice();
      return;
    }

    // CALENDAR - UPDATE
    if (command.type === "calendar" && command.action === "update") {
      this.updateCalendarFromVoice(command.text);
      return;
    }

    // CALENDAR - DELETE
    if (command.type === "calendar" && command.action === "delete") {
      this.deleteCalendarFromVoice(command.text);
      return;
    }

    // NOTE - CREATE
    if (command.type === "note" && command.action === "create") {
      this.createNoteFromVoice(command.text);
      return;
    }

    // NOTE - SHOW
    if (command.type === "note" && command.action === "show") {
      this.showNotesFromVoice();
      return;
    }

    // NOTE - UPDATE
    if (command.type === "note" && command.action === "update") {
      this.updateNoteFromVoice(command.text);
      return;
    }

    // NOTE - DELETE
    if (command.type === "note" && command.action === "delete") {
      this.deleteNoteFromVoice(command.text);
      return;
    }

    // GOAL - CREATE
    if (command.type === "goal" && command.action === "create") {
      this.createGoalFromVoice(command.text);
      return;
    }

    // GOAL - SHOW
    if (command.type === "goal" && command.action === "show") {
      this.showGoalsFromVoice();
      return;
    }

    // GOAL - UPDATE
    if (command.type === "goal" && command.action === "update") {
      this.updateGoalFromVoice(command.text);
      return;
    }

    // GOAL - DELETE
    if (command.type === "goal" && command.action === "delete") {
      this.deleteGoalFromVoice(command.text);
      return;
    }

    console.log(
      "Voice command is recognized but not implemented yet:",
      command
    );
  }

  createTaskFromVoice(text: string): void {
    let title = text;

    const patterns = [
      /create a task (to )?/i,
      /create task (to )?/i,
      /add a task (to )?/i,
      /add task (to )?/i,
      /make a task (to )?/i,
      /create a todo (to )?/i,
      /add a todo (to )?/i,
    ];

    for (const pattern of patterns) {
      title = title.replace(pattern, "");
    }

    title = title.trim();

    if (!title) {
      this.showVoiceResponse("I could not understand the task title.");

      return;
    }

    const newTask = {
      user_id: 1,
      title: title,
      description: "",
      status: "pending",
      priority: "medium",
      due_date: "",
    };

    console.log("Creating task:", newTask);

    this.taskService.createTask(newTask).subscribe({
      next: (response) => {
        console.log("Task created successfully:", response);

        this.showVoiceResponse(`Task created successfully: ${title}`);
      },

      error: (err) => {
        console.error("Error creating task from voice:", err);

        this.showVoiceResponse("Unable to create the task.");
      },
    });
  }

  createCalendarEventFromVoice(text: string): void {
    let title = text;

    // Remove command phrases
    const patterns = [
      /schedule a meeting/i,
      /schedule meeting/i,
      /schedule an event/i,
      /schedule event/i,
      /create a meeting/i,
      /create meeting/i,
      /create an event/i,
      /create event/i,
      /add a meeting/i,
      /add meeting/i,
      /add an event/i,
      /add event/i,
    ];

    for (const pattern of patterns) {
      title = title.replace(pattern, "");
    }

    // Detect today / tomorrow
    let eventDate = new Date();

    if (/\btomorrow\b/i.test(title)) {
      eventDate.setDate(eventDate.getDate() + 1);
      title = title.replace(/\btomorrow\b/gi, "");
    }

    if (/\btoday\b/i.test(title)) {
      title = title.replace(/\btoday\b/gi, "");
    }

    // Detect time
    let hours = 10;
    let minutes = 0;

    const timeMatch = title.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;

      const period = timeMatch[3]?.toLowerCase();

      if (period === "pm" && hours < 12) {
        hours += 12;
      }

      if (period === "am" && hours === 12) {
        hours = 0;
      }

      // Remove time from title
      title = title.replace(timeMatch[0], "");
    }

    // Set event start time
    eventDate.setHours(hours, minutes, 0, 0);

    // Default duration = 1 hour
    const endTime = new Date(eventDate);

    endTime.setHours(endTime.getHours() + 1);

    // Clean title
    title = title.replace(/\s+/g, " ").trim();

    // Remove unnecessary words left after parsing
    title = title.replace(/^for\s+/i, "").trim();

    if (!title) {
      this.showVoiceResponse("I could not understand the meeting title.");

      return;
    }

    const newEvent = {
      user_id: 1,
      title: title,
      description: "",
      start_time: eventDate.toISOString(),
      end_time: endTime.toISOString(),
    };

    console.log("Creating calendar event:", newEvent);

    this.calendarService.createEvent(newEvent).subscribe({
      next: (response) => {
        console.log("Calendar event created successfully:", response);

        alert(`Meeting scheduled: ${title}`);
      },

      error: (err) => {
        console.error("Error creating calendar event:", err);

        alert("Unable to create the calendar event.");
      },
    });
  }

  createNoteFromVoice(text: string): void {
    let content = text;

    // Remove command phrases
    const patterns = [
      /create a note/i,
      /create note/i,
      /add a note/i,
      /add note/i,
      /write a note/i,
      /write note/i,
      /make a note/i,
      /make note/i,
    ];

    for (const pattern of patterns) {
      content = content.replace(pattern, "");
    }

    content = content.trim();

    if (!content) {
      alert("I could not understand the note.");
      return;
    }

    const newNote = {
      user_id: 1,
      title: "Voice Note",
      content: content,
    };

    console.log("Creating note:", newNote);

    this.noteService.createNote(newNote).subscribe({
      next: (response) => {
        console.log("Note created successfully:", response);

        alert(`Note created: ${content}`);
      },

      error: (err) => {
        console.error("Error creating note from voice:", err);

        alert("Unable to create the note.");
      },
    });
  }

  createGoalFromVoice(text: string): void {
    let title = text;

    // Remove command phrases
    const patterns = [
      /create a goal/i,
      /create goal/i,
      /add a goal/i,
      /add goal/i,
      /set a goal/i,
      /set goal/i,
      /make a goal/i,
      /make goal/i,
    ];

    for (const pattern of patterns) {
      title = title.replace(pattern, "");
    }

    title = title.trim();

    if (!title) {
      this.showVoiceResponse("I could not understand the goal.");
      return;
    }

    const newGoal = {
      user_id: 1,
      title: title,
      description: "",
      progress: 0,
      target_date: "",
    };

    console.log("Creating goal:", newGoal);

    this.goalService.createGoal(newGoal).subscribe({
      next: (response) => {
        console.log("Goal created successfully:", response);

        alert(`Goal created: ${title}`);
      },

      error: (err) => {
        console.error("Error creating goal from voice:", err);

        alert("Unable to create the goal.");
      },
    });
  }

  showTasksFromVoice(): void {
    console.log("Fetching tasks for voice command...");

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        console.log("Tasks received:", tasks);

        if (!tasks || tasks.length === 0) {
          alert("You currently have no tasks.");

          return;
        }

        const taskList = tasks
          .map((task: any, index: number) => {
            return `${index + 1}. ${task.title}`;
          })
          .join("\n");

        alert(`Your tasks:\n\n${taskList}`);
      },

      error: (err) => {
        console.error("Error fetching tasks:", err);

        alert("Unable to fetch your tasks.");
      },
    });
  }

  showCalendarFromVoice(): void {
    console.log("Fetching calendar events for voice command...");

    this.calendarService.getEvents().subscribe({
      next: (events) => {
        console.log("Calendar events received:", events);

        if (!events || events.length === 0) {
          alert("You currently have no calendar events.");

          return;
        }

        const eventList = events
          .map((event: any, index: number) => {
            const startTime = new Date(event.start_time);

            const formattedDate = startTime.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const formattedTime = startTime.toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
            });

            return `${index + 1}. ${
              event.title
            }\n   ${formattedDate} at ${formattedTime}`;
          })
          .join("\n\n");

        alert(`Your calendar:\n\n${eventList}`);
      },

      error: (err) => {
        console.error("Error fetching calendar:", err);

        alert("Unable to fetch your calendar.");
      },
    });
  }

  showNotesFromVoice(): void {
    console.log("Fetching notes for voice command...");

    this.noteService.getNotes().subscribe({
      next: (notes) => {
        console.log("Notes received:", notes);

        if (!notes || notes.length === 0) {
          alert("You currently have no notes.");
          return;
        }

        const noteList = notes
          .map((note: any, index: number) => {
            return `${index + 1}. ${note.title}\n   ${note.content}`;
          })
          .join("\n\n");

        alert(`Your notes:\n\n${noteList}`);
      },

      error: (err) => {
        console.error("Error fetching notes:", err);

        alert("Unable to fetch your notes.");
      },
    });
  }

  showGoalsFromVoice(): void {
    console.log("Fetching goals for voice command...");

    this.goalService.getGoals().subscribe({
      next: (goals) => {
        console.log("Goals received:", goals);

        if (!goals || goals.length === 0) {
          alert("You currently have no goals.");
          return;
        }

        const goalList = goals
          .map((goal: any, index: number) => {
            return `${index + 1}. ${goal.title}
   Progress: ${goal.progress}%`;
          })
          .join("\n\n");

        alert(`Your goals:\n\n${goalList}`);
      },

      error: (err) => {
        console.error("Error fetching goals:", err);

        alert("Unable to fetch your goals.");
      },
    });
  }

  updateTaskFromVoice(text: string): void {
    const idMatch = text.match(/\btask\s+(\d+)\b/i);

    if (!idMatch) {
      alert(
        "Please specify the task number. Example: Update task 1 to Finish Nexus"
      );
      return;
    }

    const taskId = parseInt(idMatch[1], 10);

    let title = text;

    // Remove command phrases
    title = title.replace(/update\s+task\s+\d+/i, "");

    title = title.replace(/edit\s+task\s+\d+/i, "");

    title = title.replace(/change\s+task\s+\d+/i, "");

    // Remove "to"
    title = title.replace(/^\s*to\s+/i, "");

    title = title.trim();

    if (!title) {
      this.showVoiceResponse("I could not understand the task title.");
      return;
    }

    console.log("Fetching existing task:", taskId);

    // First fetch the existing task
    this.taskService.getTask(taskId).subscribe({
      next: (existingTask) => {
        console.log("Existing task:", existingTask);

        // Preserve existing fields
        const updatedTask = {
          user_id: existingTask.user_id,
          title: title,
          description: existingTask.description || "",
          status: existingTask.status || "pending",
          priority: existingTask.priority || "medium",
          due_date: existingTask.due_date || "",
        };

        console.log("Updating task with:", updatedTask);

        this.taskService.updateTask(taskId, updatedTask).subscribe({
          next: (response) => {
            console.log("Task updated successfully:", response);

            alert(`Task ${taskId} updated successfully.`);
          },

          error: (err) => {
            console.error("Error updating task:", err);

            alert("Unable to update the task.");
          },
        });
      },

      error: (err) => {
        console.error("Error fetching task:", err);

        alert(`Could not find task ${taskId}.`);
      },
    });
  }
  deleteTaskFromVoice(text: string): void {
    const idMatch = text.match(/\btask\s+(\d+)\b/i);

    if (!idMatch) {
      alert("Please specify the task number. Example: Delete task 3");

      return;
    }

    const taskId = parseInt(idMatch[1], 10);

    // First fetch the task
    this.taskService.getTask(taskId).subscribe({
      next: (task) => {
        console.log("Task selected for deletion:", task);

        const confirmed = window.confirm(
          `Are you sure you want to delete task ${taskId}?\n\n"${task.title}"`
        );

        if (!confirmed) {
          console.log("Task deletion cancelled.");

          return;
        }

        // Delete only after confirmation
        this.taskService.deleteTask(taskId).subscribe({
          next: (response) => {
            console.log("Task deleted successfully:", response);

            alert(`Task ${taskId} deleted successfully.`);
          },

          error: (err) => {
            console.error("Error deleting task:", err);

            alert("Unable to delete the task.");
          },
        });
      },

      error: (err) => {
        console.error("Error finding task:", err);

        alert(`Could not find task ${taskId}.`);
      },
    });
  }

  updateCalendarFromVoice(text: string): void {
    const idMatch = text.match(/\b(?:event|meeting|calendar)\s+(\d+)\b/i);

    if (!idMatch) {
      alert(
        "Please specify the event number. Example: Update event 2 to Nexus meeting"
      );
      return;
    }

    const eventId = parseInt(idMatch[1], 10);

    let title = text;

    title = title.replace(/update\s+(?:event|meeting|calendar)\s+\d+/i, "");

    title = title.replace(/edit\s+(?:event|meeting|calendar)\s+\d+/i, "");

    title = title.replace(/change\s+(?:event|meeting|calendar)\s+\d+/i, "");

    title = title.replace(/^\s*to\s+/i, "");

    title = title.trim();

    if (!title) {
      this.showVoiceResponse("I could not understand the meeting title.");
      return;
    }

    this.calendarService.getEvent(eventId).subscribe({
      next: (existingEvent) => {
        const updatedEvent = {
          user_id: existingEvent.user_id,
          title: title,
          description: existingEvent.description || "",
          start_time: existingEvent.start_time,
          end_time: existingEvent.end_time,
        };

        console.log("Updating calendar event:", eventId, updatedEvent);

        this.calendarService.updateEvent(eventId, updatedEvent).subscribe({
          next: (response) => {
            console.log("Calendar event updated:", response);

            alert(`Event ${eventId} updated successfully.`);
          },

          error: (err) => {
            console.error("Error updating calendar event:", err);

            alert("Unable to update the calendar event.");
          },
        });
      },

      error: (err) => {
        console.error("Error finding calendar event:", err);

        alert(`Could not find event ${eventId}.`);
      },
    });
  }

  deleteCalendarFromVoice(text: string): void {
    const idMatch = text.match(/\b(?:event|meeting|calendar)\s+(\d+)\b/i);

    if (!idMatch) {
      alert("Please specify the event number. Example: Delete event 2");
      return;
    }

    const eventId = parseInt(idMatch[1], 10);

    this.calendarService.getEvent(eventId).subscribe({
      next: (event) => {
        const confirmed = window.confirm(
          `Are you sure you want to delete event ${eventId}?\n\n"${event.title}"`
        );

        if (!confirmed) {
          console.log("Calendar event deletion cancelled.");

          return;
        }

        this.calendarService.deleteEvent(eventId).subscribe({
          next: (response) => {
            console.log("Calendar event deleted successfully:", response);

            alert(`Event ${eventId} deleted successfully.`);
          },

          error: (err) => {
            console.error("Error deleting calendar event:", err);

            alert("Unable to delete the calendar event.");
          },
        });
      },

      error: (err) => {
        console.error("Error finding calendar event:", err);

        alert(`Could not find event ${eventId}.`);
      },
    });
  }

  updateNoteFromVoice(text: string): void {
    const numberMatch = text.match(/\bnote\s+(\d+)\b/i);

    if (!numberMatch) {
      alert(
        "Please specify the note number. Example: Update note 1 to Review Nexus documentation"
      );
      return;
    }

    const noteNumber = parseInt(numberMatch[1], 10);

    if (noteNumber <= 0) {
      alert("Please provide a valid note number.");
      return;
    }

    let content = text;

    content = content.replace(/update\s+note\s+\d+/i, "");

    content = content.replace(/edit\s+note\s+\d+/i, "");

    content = content.replace(/change\s+note\s+\d+/i, "");

    content = content.replace(/^\s*to\s+/i, "");

    content = content.trim();

    if (!content) {
      alert("Please provide the new note content.");
      return;
    }

    this.noteService.getNotes().subscribe({
      next: (notes) => {
        if (!notes || notes.length === 0) {
          alert("You currently have no notes.");
          return;
        }

        if (noteNumber > notes.length) {
          alert(`There are only ${notes.length} notes.`);
          return;
        }

        const existingNote = notes[noteNumber - 1];

        const noteId = existingNote.id;

        const updatedNote = {
          user_id: existingNote.user_id,
          title: existingNote.title || "Voice Note",
          content: content,
        };

        console.log(
          "Updating note:",
          noteNumber,
          "Database ID:",
          noteId,
          updatedNote
        );

        this.noteService.updateNote(noteId, updatedNote).subscribe({
          next: (response) => {
            console.log("Note updated successfully:", response);

            alert(`Note ${noteNumber} updated successfully.`);
          },

          error: (err) => {
            console.error("Error updating note:", err);

            alert("Unable to update the note.");
          },
        });
      },

      error: (err) => {
        console.error("Error fetching notes:", err);

        alert("Unable to fetch your notes.");
      },
    });
  }

  deleteNoteFromVoice(text: string): void {
    const numberMatch = text.match(/\bnote\s+(\d+)\b/i);

    if (!numberMatch) {
      alert("Please specify the note number. Example: Delete note 1");
      return;
    }

    const noteNumber = parseInt(numberMatch[1], 10);

    if (noteNumber <= 0) {
      alert("Please provide a valid note number.");
      return;
    }

    this.noteService.getNotes().subscribe({
      next: (notes) => {
        if (!notes || notes.length === 0) {
          alert("You currently have no notes.");
          return;
        }

        if (noteNumber > notes.length) {
          alert(`There are only ${notes.length} notes.`);
          return;
        }

        const note = notes[noteNumber - 1];

        const noteId = note.id;

        const confirmed = window.confirm(
          `Are you sure you want to delete note ${noteNumber}?\n\n"${note.title}"\n\n${note.content}`
        );

        if (!confirmed) {
          console.log("Note deletion cancelled.");

          return;
        }

        this.noteService.deleteNote(noteId).subscribe({
          next: (response) => {
            console.log("Note deleted successfully:", response);

            alert(`Note ${noteNumber} deleted successfully.`);
          },

          error: (err) => {
            console.error("Error deleting note:", err);

            alert("Unable to delete the note.");
          },
        });
      },

      error: (err) => {
        console.error("Error fetching notes:", err);

        alert("Unable to fetch your notes.");
      },
    });
  }

  updateGoalFromVoice(text: string): void {
    const numberMatch = text.match(/\bgoal\s+(\d+)\b/i);

    if (!numberMatch) {
      alert(
        "Please specify the goal number. Example: Update goal 1 to Complete Nexus project"
      );
      return;
    }

    const goalNumber = parseInt(numberMatch[1], 10);

    if (goalNumber <= 0) {
      alert("Please provide a valid goal number.");
      return;
    }

    let title = text;

    title = title.replace(/update\s+goal\s+\d+/i, "");

    title = title.replace(/edit\s+goal\s+\d+/i, "");

    title = title.replace(/change\s+goal\s+\d+/i, "");

    title = title.replace(/^\s*to\s+/i, "");

    title = title.trim();

    if (!title) {
      this.showVoiceResponse("I could not understand the goal.");
      return;
    }

    this.goalService.getGoals().subscribe({
      next: (goals) => {
        if (!goals || goals.length === 0) {
          alert("You currently have no goals.");
          return;
        }

        if (goalNumber > goals.length) {
          alert(`There are only ${goals.length} goals.`);
          return;
        }

        const existingGoal = goals[goalNumber - 1];

        const goalId = existingGoal.id;

        const updatedGoal = {
          user_id: existingGoal.user_id,
          title: title,
          description: existingGoal.description || "",
          progress: existingGoal.progress || 0,
          target_date: existingGoal.target_date || "",
        };

        console.log(
          "Updating goal:",
          goalNumber,
          "Database ID:",
          goalId,
          updatedGoal
        );

        this.goalService.updateGoal(goalId, updatedGoal).subscribe({
          next: (response) => {
            console.log("Goal updated successfully:", response);

            alert(`Goal ${goalNumber} updated successfully.`);
          },

          error: (err) => {
            console.error("Error updating goal:", err);

            alert("Unable to update the goal.");
          },
        });
      },

      error: (err) => {
        console.error("Error fetching goals:", err);

        alert("Unable to fetch your goals.");
      },
    });
  }

  deleteGoalFromVoice(text: string): void {
    const numberMatch = text.match(/\bgoal\s+(\d+)\b/i);

    if (!numberMatch) {
      alert("Please specify the goal number. Example: Delete goal 1");
      return;
    }

    const goalNumber = parseInt(numberMatch[1], 10);

    if (goalNumber <= 0) {
      alert("Please provide a valid goal number.");
      return;
    }

    this.goalService.getGoals().subscribe({
      next: (goals) => {
        if (!goals || goals.length === 0) {
          alert("You currently have no goals.");
          return;
        }

        if (goalNumber > goals.length) {
          alert(`There are only ${goals.length} goals.`);
          return;
        }

        const goal = goals[goalNumber - 1];

        const goalId = goal.id;

        const confirmed = window.confirm(
          `Are you sure you want to delete goal ${goalNumber}?\n\n"${goal.title}"`
        );

        if (!confirmed) {
          console.log("Goal deletion cancelled.");

          return;
        }

        this.goalService.deleteGoal(goalId).subscribe({
          next: (response) => {
            console.log("Goal deleted successfully:", response);

            alert(`Goal ${goalNumber} deleted successfully.`);
          },

          error: (err) => {
            console.error("Error deleting goal:", err);

            alert("Unable to delete the goal.");
          },
        });
      },

      error: (err) => {
        console.error("Error fetching goals:", err);

        alert("Unable to fetch your goals.");
      },
    });
  }
}
