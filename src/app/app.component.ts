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
      alert("I could not understand the task title.");

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

        alert(`Task created: ${title}`);
      },

      error: (err) => {
        console.error("Error creating task from voice:", err);

        alert("Unable to create the task.");
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
      alert("I could not understand the meeting title.");
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
      alert("I could not understand the goal.");
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
}
