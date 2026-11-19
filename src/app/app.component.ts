import { Component } from "@angular/core";
import { VoiceService } from "./services/voice.service";
import { VoiceCommandService } from "./services/voice-command.service";
import { TaskService } from "./services/task.service";
import { CalendarService } from "./services/calendar.service";
import { NoteService } from "./services/note.service";
import { GoalService } from "./services/goal.service";
import { JarvisService } from "./services/jarvis.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  voiceResponse = "";
  voiceResponseVisible = false;
  title = "frontend";
  currentUserId = 1;

  constructor(
    public voiceService: VoiceService,
    public voiceCommandService: VoiceCommandService,
    public taskService: TaskService,
    public calendarService: CalendarService,
    public noteService: NoteService,
    public goalService: GoalService,
    public jarvisService: JarvisService
  ) {
    this.voiceService.onCommand = (text: string) => {
      const command = this.voiceCommandService.parseCommand(text);

      console.log("Recognized command:", command);

      this.executeVoiceCommand(command);
    };
  }

  private cleanTextForSpeech(text: string): string {
    return (
      text
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, "Code example omitted.")

        // Remove inline code formatting
        .replace(/`([^`]+)`/g, "$1")

        // Remove Markdown headings
        .replace(/^#{1,6}\s*/gm, "")

        // Remove bold and italic formatting
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/_([^_]+)_/g, "$1")

        // Remove Markdown links but keep their text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

        // Remove bullet and blockquote symbols
        .replace(/^\s*[-+>]\s*/gm, "")

        // Remove remaining Markdown symbols
        .replace(/[#*_~]/g, "")

        // Clean extra whitespace
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  }

  // ==========================================
  // COMMON RESPONSE SYSTEM
  // ==========================================

  showVoiceResponse(message: string): void {
    this.voiceResponse = message;
    this.voiceResponseVisible = true;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(
        this.cleanTextForSpeech(message)
      );

      // Get available system voices
      const voices = window.speechSynthesis.getVoices();

      // Prefer an English male-sounding voice if available
      const preferredVoice = voices.find(
        (voice) =>
          /david|mark|guy|daniel|male/i.test(voice.name) &&
          voice.lang.toLowerCase().startsWith("en")
      );

      // Fallback to any available English voice
      const englishVoice = voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("en")
      );

      speech.voice = preferredVoice || englishVoice || null;

      // Natural, deeper speaking settings
      speech.rate = 0.95;
      speech.pitch = 0.85;
      speech.volume = 1;

      speech.lang = "en-IN";
      speech.rate = 1;
      speech.pitch = 0.9;
      speech.volume = 1;

      window.speechSynthesis.speak(speech);
    }

    console.log("Nexus response:", message);
  }

  // Safely extract arrays from different API response formats.
  private extractArray(response: any, key: string): any[] {
    const possibleArrays = [
      response,
      response?.[key],
      response?.data,
      response?.data?.[key],
    ];

    return possibleArrays.find((item) => Array.isArray(item)) || [];
  }

  // Safely extract an individual object from API responses.
  private extractObject(response: any, key: string): any {
    return (
      response?.[key] || response?.data?.[key] || response?.data || response
    );
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
      this.showVoiceResponse("I did not hear any command.");
      return;
    }

    const command = this.voiceCommandService.parseCommand(transcript);

    console.log("Recognized command:", command);

    this.executeVoiceCommand(command);
  }

  // ==========================================
  // VOICE COMMAND ROUTER
  // ==========================================

  executeVoiceCommand(command: any): void {
    if (!command || !command.type || !command.action) {
      this.showVoiceResponse("Sorry, I could not understand your command.");
      return;
    }

    // TASKS
    if (command.type === "task") {
      switch (command.action) {
        case "create":
          this.createTaskFromVoice(command.text);
          return;
        case "show":
          this.showTasksFromVoice();
          return;
        case "update":
          this.updateTaskFromVoice(command.text);
          return;
        case "delete":
          this.deleteTaskFromVoice(command.text);
          return;
      }
    }

    // CALENDAR
    if (command.type === "calendar") {
      switch (command.action) {
        case "create":
          this.createCalendarEventFromVoice(command.text);
          return;
        case "show":
          this.showCalendarFromVoice();
          return;
        case "update":
          this.updateCalendarFromVoice(command.text);
          return;
        case "delete":
          this.deleteCalendarFromVoice(command.text);
          return;
      }
    }

    // NOTES
    if (command.type === "note") {
      switch (command.action) {
        case "create":
          this.createNoteFromVoice(command.text);
          return;
        case "show":
          this.showNotesFromVoice();
          return;
        case "update":
          this.updateNoteFromVoice(command.text);
          return;
        case "delete":
          this.deleteNoteFromVoice(command.text);
          return;
      }
    }

    // GOALS
    if (command.type === "goal") {
      switch (command.action) {
        case "create":
          this.createGoalFromVoice(command.text);
          return;
        case "show":
          this.showGoalsFromVoice();
          return;
        case "update":
          this.updateGoalFromVoice(command.text);
          return;
        case "delete":
          this.deleteGoalFromVoice(command.text);
          return;
      }
    }

    // GENERAL AI CONVERSATION
    if (command.type === "unknown") {
      this.handleGeneralChat(command.text);
      return;
    }

    this.showVoiceResponse(
      "I can help you with tasks, calendar events, notes and goals."
    );

    console.log("Unsupported voice command:", command);
  }

  // ==========================================
  // JARVIS - GENERAL AI CONVERSATION
  // ==========================================

  handleGeneralChat(text: string): void {
    if (!text || !text.trim()) {
      this.showVoiceResponse("Please tell me what you need help with.");
      return;
    }

    console.log("Sending message to Python JARVIS:", text);

    this.jarvisService.chat(text, "nexus-user").subscribe({
      next: (response: any) => {
        console.log("JARVIS AI response:", response);

        if (response.success && response.response) {
          this.showVoiceResponse(response.response);
        } else {
          this.showVoiceResponse(
            response.message || "Sorry, I couldn't generate a response."
          );
        }
      },

      error: (err) => {
        console.error("JARVIS AI connection error:", err);

        this.showVoiceResponse(
          "I'm unable to connect to my AI service. Please check whether the JARVIS server is running."
        );
      },
    });
  }

  // ==========================================
  // TASK - CREATE
  // ==========================================

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

    patterns.forEach((pattern) => {
      title = title.replace(pattern, "");
    });

    title = title.trim();

    if (!title) {
      this.showVoiceResponse("I could not understand the task title.");
      return;
    }

    const newTask = {
      user_id: this.currentUserId,
      title,
      description: "",
      status: "pending",
      priority: "medium",
      due_date: "",
    };

    this.taskService.createTask(newTask).subscribe({
      next: (response) => {
        console.log("Task created:", response);
        this.showVoiceResponse(`Task created successfully: ${title}`);
      },
      error: (err) => {
        console.error("Task creation error:", err);
        this.showVoiceResponse("Unable to create the task.");
      },
    });
  }

  // ==========================================
  // TASK - SHOW
  // ==========================================

  showTasksFromVoice(): void {
    this.taskService.getTasks(this.currentUserId).subscribe({
      next: (response: any) => {
        const tasks = this.extractArray(response, "tasks");

        console.log("Tasks:", tasks);

        if (tasks.length === 0) {
          this.showVoiceResponse("You currently have no tasks.");
          return;
        }

        const taskList = tasks
          .map(
            (task: any, index: number) =>
              `${index + 1}. ${task.title}, status ${task.status || "pending"}.`
          )
          .join("\n");

        this.showVoiceResponse(`Here are your tasks:\n${taskList}`);
      },
      error: (err) => {
        console.error("Task loading error:", err);
        this.showVoiceResponse("Sorry, I couldn't retrieve your tasks.");
      },
    });
  }

  // ==========================================
  // TASK - UPDATE
  // ==========================================

  updateTaskFromVoice(text: string): void {
    // Recognize: task 17, task ID 17, ID 17, number 17
    const idMatch = text.match(
      /\b(?:task\s*(?:id\s*)?|id\s*|number\s*)(\d+)\b/i
    );

    if (!idMatch) {
      this.showVoiceResponse(
        "Please specify the task ID. Example: Update task ID 17 status to completed."
      );
      return;
    }

    const taskId = parseInt(idMatch[1], 10);

    if (taskId <= 0) {
      this.showVoiceResponse("Please provide a valid task ID.");
      return;
    }

    this.taskService.getTask(taskId, this.currentUserId).subscribe({
      next: (response: any) => {
        const existingTask = this.extractObject(response, "task");

        if (!existingTask || !existingTask.id) {
          this.showVoiceResponse(`Could not find task ${taskId}.`);
          return;
        }

        // Preserve existing task information
        const updatedTask: any = {
          user_id: existingTask.user_id || this.currentUserId,
          title: existingTask.title || "",
          description: existingTask.description || "",
          status: existingTask.status || "pending",
          priority: existingTask.priority || "medium",
          due_date: existingTask.due_date || "",
        };

        let updateMessage = "";

        // STATUS UPDATE
        const statusMatch = text.match(
          /\b(?:status|progress)\s+(?:to\s+)?(completed|complete|done|finished|pending|in[\s-]?progress)\b/i
        );

        if (statusMatch) {
          const value = statusMatch[1].toLowerCase();

          if (["completed", "complete", "done", "finished"].includes(value)) {
            updatedTask.status = "completed";
          } else if (value === "pending") {
            updatedTask.status = "pending";
          } else {
            updatedTask.status = "in-progress";
          }

          updateMessage = `Task ${taskId} status updated to ${updatedTask.status}.`;
        }

        // PRIORITY UPDATE
        else {
          const priorityMatch = text.match(
            /\bpriority\s+(?:to\s+)?(low|medium|high|urgent)\b/i
          );

          if (priorityMatch) {
            updatedTask.priority = priorityMatch[1].toLowerCase();

            updateMessage = `Task ${taskId} priority updated to ${updatedTask.priority}.`;
          }
        }

        // TITLE UPDATE
        if (!updateMessage) {
          let title = text
            .replace(/\bupdate\b/i, "")
            .replace(/\bedit\b/i, "")
            .replace(/\bchange\b/i, "")
            .replace(/\bmodify\b/i, "")
            .replace(/\btask\s*(?:id\s*)?\d+\b/i, "")
            .replace(/\bid\s*\d+\b/i, "")
            .replace(/\bnumber\s*\d+\b/i, "")
            .replace(/^\s*to\s+/i, "")
            .trim();

          if (!title) {
            this.showVoiceResponse(
              "Please provide the new task title or field value."
            );
            return;
          }

          updatedTask.title = title;
          updateMessage = `Task ${taskId} title updated successfully.`;
        }

        // SAVE TO DATABASE
        this.taskService.updateTask(taskId, updatedTask).subscribe({
          next: (result) => {
            console.log("Task updated:", result);
            this.showVoiceResponse(updateMessage);
          },
          error: (err) => {
            console.error("Task update error:", err);
            this.showVoiceResponse("Unable to update the task.");
          },
        });
      },

      error: (err) => {
        console.error("Task fetch error:", err);
        this.showVoiceResponse(`Could not find task ${taskId}.`);
      },
    });
  }

  // ==========================================
  // TASK - DELETE
  // ==========================================

  deleteTaskFromVoice(text: string): void {
    const idMatch = text.match(
      /\b(?:task\s*(?:id\s*)?|id\s*|number\s*)(\d+)\b/i
    );

    if (!idMatch) {
      this.showVoiceResponse("Please specify the task number.");
      return;
    }

    const taskId = parseInt(idMatch[1], 10);

    this.taskService.getTask(taskId, this.currentUserId).subscribe({
      next: (response: any) => {
        const task = this.extractObject(response, "task");

        if (!task || !task.id) {
          this.showVoiceResponse(`Could not find task ${taskId}.`);
          return;
        }

        const confirmed = window.confirm(
          `Are you sure you want to delete task ${taskId}?\n\n"${task.title}"`
        );

        if (!confirmed) {
          this.showVoiceResponse("Task deletion cancelled.");
          return;
        }

        this.taskService.deleteTask(taskId, this.currentUserId).subscribe({
          next: (result) => {
            console.log("Task deleted:", result);
            this.showVoiceResponse(`Task ${taskId} deleted successfully.`);
          },
          error: (err) => {
            console.error("Task deletion error:", err);
            this.showVoiceResponse("Unable to delete the task.");
          },
        });
      },
      error: (err) => {
        console.error("Task fetch error:", err);
        this.showVoiceResponse(`Could not find task ${taskId}.`);
      },
    });
  }

  // ==========================================
  // CALENDAR - CREATE
  // ==========================================
  createCalendarEventFromVoice(text: string): void {
    let title = text;

    // Remove event creation phrases
    const patterns = [
      /schedule a meeting/gi,
      /schedule meeting/gi,
      /schedule an event/gi,
      /schedule event/gi,
      /create a meeting/gi,
      /create meeting/gi,
      /create an event/gi,
      /create event/gi,
      /add a meeting/gi,
      /add meeting/gi,
      /add an event/gi,
      /add event/gi,
    ];

    patterns.forEach((pattern) => {
      title = title.replace(pattern, "");
    });

    const now = new Date();
    let eventDate = new Date(now);
    let dateFound = false;

    // TODAY
    if (/\btoday\b/i.test(title)) {
      dateFound = true;
      title = title.replace(/\btoday\b/gi, "");
    }

    // TOMORROW
    if (/\btomorrow\b/i.test(title)) {
      eventDate.setDate(eventDate.getDate() + 1);
      dateFound = true;
      title = title.replace(/\btomorrow\b/gi, "");
    }

    // DATE FORMAT: 29 November or November 29
    const dateMatch = title.match(
      /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\b/i
    );

    if (dateMatch) {
      const day = parseInt(dateMatch[1] || dateMatch[4], 10);
      const monthName = dateMatch[2] || dateMatch[3];

      const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];

      const month = months.indexOf(monthName.toLowerCase());

      const year = now.getFullYear();

      const candidate = new Date(year, month, day);

      // Validate date
      if (
        month < 0 ||
        candidate.getDate() !== day ||
        candidate.getMonth() !== month
      ) {
        this.showVoiceResponse("Please provide a valid calendar date.");
        return;
      }

      eventDate = candidate;

      // If date has already passed this year, use next year
      if (
        eventDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())
      ) {
        eventDate.setFullYear(year + 1);
      }

      dateFound = true;
      title = title.replace(dateMatch[0], "");
    }

    // TIME: 2:00 AM, 2 AM, 14:00, 2:00 a.m.
    const timeMatch = title.match(
      /\b(?:at|on)?\s*(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\b/i
    );

    let hours = 10;
    let minutes = 0;

    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;

      const period = timeMatch[3]?.toLowerCase().replace(/\./g, "");

      if (period === "pm" && hours < 12) {
        hours += 12;
      }

      if (period === "am" && hours === 12) {
        hours = 0;
      }

      if (
        minutes > 59 ||
        (period && (hours > 23 || hours < 0)) ||
        (!period && hours > 23)
      ) {
        this.showVoiceResponse("Please provide a valid meeting time.");
        return;
      }

      if (period && parseInt(timeMatch[1], 10) > 12) {
        this.showVoiceResponse("Please provide a valid meeting time.");
        return;
      }

      title = title.replace(timeMatch[0], "");
    }

    eventDate.setHours(hours, minutes, 0, 0);

    const endTime = new Date(eventDate);
    endTime.setHours(endTime.getHours() + 1);

    // Clean event title
    title = title
      .replace(/\b(on|at|for)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!title) {
      title = "New Nexus Event";
    }

    const newEvent = {
      user_id: this.currentUserId,
      title,
      description: "",
      start_time: eventDate.toISOString(),
      end_time: endTime.toISOString(),
    };

    console.log("Creating calendar event:", newEvent);

    this.calendarService.createEvent(newEvent).subscribe({
      next: (response) => {
        console.log("Calendar event created:", response);
        this.showVoiceResponse(`Event scheduled successfully: ${title}`);
      },
      error: (err) => {
        console.error("Calendar creation error:", err);
        this.showVoiceResponse("Unable to create the calendar event.");
      },
    });
  }

  // ==========================================
  // CALENDAR - SHOW
  // ==========================================

  showCalendarFromVoice(): void {
    this.calendarService.getEvents().subscribe({
      next: (response: any) => {
        const events = this.extractArray(response, "events");

        console.log("Calendar events:", events);

        if (events.length === 0) {
          this.showVoiceResponse("You currently have no calendar events.");
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
            }, ${formattedDate} at ${formattedTime}.`;
          })
          .join("\n");

        this.showVoiceResponse(`Here is your calendar:\n${eventList}`);
      },
      error: (err) => {
        console.error("Calendar loading error:", err);
        this.showVoiceResponse("Unable to retrieve your calendar.");
      },
    });
  }

  // ==========================================
  // CALENDAR - UPDATE
  // ==========================================

  updateCalendarFromVoice(text: string): void {
    const idMatch = text.match(/\b(?:event|meeting|calendar)\s+(\d+)\b/i);

    if (!idMatch) {
      this.showVoiceResponse(
        "Please specify the event number. Example: Update event 2 to Nexus meeting."
      );
      return;
    }

    const eventId = parseInt(idMatch[1], 10);

    const title = text
      .replace(/update\s+(?:event|meeting|calendar)\s+\d+/i, "")
      .replace(/edit\s+(?:event|meeting|calendar)\s+\d+/i, "")
      .replace(/change\s+(?:event|meeting|calendar)\s+\d+/i, "")
      .replace(/^\s*to\s+/i, "")
      .trim();

    if (!title) {
      this.showVoiceResponse("Please provide the new event title.");
      return;
    }

    this.calendarService.getEvent(eventId).subscribe({
      next: (response: any) => {
        const existingEvent = this.extractObject(response, "event");

        if (!existingEvent || !existingEvent.id) {
          this.showVoiceResponse(`Could not find event ${eventId}.`);
          return;
        }

        const updatedEvent = {
          user_id: existingEvent.user_id || this.currentUserId,
          title,
          description: existingEvent.description || "",
          start_time: existingEvent.start_time,
          end_time: existingEvent.end_time,
        };

        this.calendarService.updateEvent(eventId, updatedEvent).subscribe({
          next: (result) => {
            console.log("Calendar event updated:", result);
            this.showVoiceResponse(`Event ${eventId} updated successfully.`);
          },
          error: (err) => {
            console.error("Calendar update error:", err);
            this.showVoiceResponse("Unable to update the calendar event.");
          },
        });
      },
      error: (err) => {
        console.error("Calendar fetch error:", err);
        this.showVoiceResponse(`Could not find event ${eventId}.`);
      },
    });
  }

  // ==========================================
  // CALENDAR - DELETE
  // ==========================================

  deleteCalendarFromVoice(text: string): void {
    const idMatch = text.match(
      /\b(?:(?:event|meeting|calendar)\s*(?:id\s*)?|id\s*)(\d+)\b/i
    );

    if (!idMatch) {
      this.showVoiceResponse("Please specify the event number.");
      return;
    }

    const eventId = parseInt(idMatch[1], 10);

    this.calendarService.getEvent(eventId).subscribe({
      next: (response: any) => {
        const event = this.extractObject(response, "event");

        if (!event || !event.id) {
          this.showVoiceResponse(`Could not find event ${eventId}.`);
          return;
        }

        const confirmed = window.confirm(
          `Are you sure you want to delete event ${eventId}?\n\n"${event.title}"`
        );

        if (!confirmed) {
          this.showVoiceResponse("Calendar event deletion cancelled.");
          return;
        }

        this.calendarService.deleteEvent(eventId).subscribe({
          next: (result) => {
            console.log("Calendar event deleted:", result);
            this.showVoiceResponse(`Event ${eventId} deleted successfully.`);
          },
          error: (err) => {
            console.error("Calendar deletion error:", err);
            this.showVoiceResponse("Unable to delete the calendar event.");
          },
        });
      },
      error: (err) => {
        console.error("Calendar fetch error:", err);
        this.showVoiceResponse(`Could not find event ${eventId}.`);
      },
    });
  }

  // ==========================================
  // NOTE - CREATE
  // ==========================================

  createNoteFromVoice(text: string): void {
    let content = text;

    const patterns = [
      /create a note about /i,
      /create note about /i,
      /create a note /i,
      /create note /i,
      /add a note about /i,
      /add note about /i,
      /add a note /i,
      /add note /i,
      /write a note about /i,
      /write note about /i,
      /write a note /i,
      /write note /i,
    ];

    patterns.forEach((pattern) => {
      content = content.replace(pattern, "");
    });

    content = content.trim();

    if (!content) {
      this.showVoiceResponse("I could not understand the note content.");
      return;
    }

    const newNote = {
      user_id: this.currentUserId,
      title: "Voice Note",
      content,
    };

    this.noteService.createNote(newNote).subscribe({
      next: (response) => {
        console.log("Note created:", response);
        this.showVoiceResponse(`Note created successfully: ${content}`);
      },
      error: (err) => {
        console.error("Note creation error:", err);
        this.showVoiceResponse("Unable to create the note.");
      },
    });
  }

  // ==========================================
  // NOTE - SHOW
  // ==========================================

  showNotesFromVoice(): void {
    this.noteService.getNotes().subscribe({
      next: (response: any) => {
        const notes = this.extractArray(response, "notes");

        console.log("Notes:", notes);

        if (notes.length === 0) {
          this.showVoiceResponse("You currently have no notes.");
          return;
        }

        const noteList = notes
          .map(
            (note: any, index: number) =>
              `${index + 1}. ${note.title}. ${note.content}`
          )
          .join("\n");

        this.showVoiceResponse(`Here are your notes:\n${noteList}`);
      },
      error: (err) => {
        console.error("Note loading error:", err);
        this.showVoiceResponse("Sorry, I couldn't retrieve your notes.");
      },
    });
  }

  // ==========================================
  // NOTE - UPDATE
  // ==========================================

  updateNoteFromVoice(text: string): void {
    const numberMatch = text.match(/\bnote\s+(\d+)\b/i);

    if (!numberMatch) {
      this.showVoiceResponse(
        "Please specify the note number. Example: Update note 1 to Review Nexus documentation."
      );
      return;
    }

    const noteNumber = parseInt(numberMatch[1], 10);

    if (noteNumber <= 0) {
      this.showVoiceResponse("Please provide a valid note number.");
      return;
    }

    const content = text
      .replace(/update\s+note\s+\d+/i, "")
      .replace(/edit\s+note\s+\d+/i, "")
      .replace(/change\s+note\s+\d+/i, "")
      .replace(/^\s*to\s+/i, "")
      .trim();

    if (!content) {
      this.showVoiceResponse("Please provide the new note content.");
      return;
    }

    this.noteService.getNotes().subscribe({
      next: (response: any) => {
        const notes = this.extractArray(response, "notes");

        if (notes.length === 0) {
          this.showVoiceResponse("You currently have no notes.");
          return;
        }

        if (noteNumber > notes.length) {
          this.showVoiceResponse(`There are only ${notes.length} notes.`);
          return;
        }

        const existingNote = notes[noteNumber - 1];

        if (!existingNote?.id) {
          this.showVoiceResponse("Could not identify the selected note.");
          return;
        }

        const updatedNote = {
          user_id: existingNote.user_id || this.currentUserId,
          title: existingNote.title || "Voice Note",
          content,
        };

        this.noteService.updateNote(existingNote.id, updatedNote).subscribe({
          next: (result) => {
            console.log("Note updated:", result);
            this.showVoiceResponse(`Note ${noteNumber} updated successfully.`);
          },
          error: (err) => {
            console.error("Note update error:", err);
            this.showVoiceResponse("Unable to update the note.");
          },
        });
      },
      error: (err) => {
        console.error("Notes fetch error:", err);
        this.showVoiceResponse("Unable to fetch your notes.");
      },
    });
  }

  // ==========================================
  // NOTE - DELETE
  // ==========================================

  deleteNoteFromVoice(text: string): void {
    const numberMatch = text.match(/\bnote\s+(\d+)\b/i);

    if (!numberMatch) {
      this.showVoiceResponse("Please specify the note number.");
      return;
    }

    const noteNumber = parseInt(numberMatch[1], 10);

    if (noteNumber <= 0) {
      this.showVoiceResponse("Please provide a valid note number.");
      return;
    }

    this.noteService.getNotes().subscribe({
      next: (response: any) => {
        const notes = this.extractArray(response, "notes");

        if (notes.length === 0) {
          this.showVoiceResponse("You currently have no notes.");
          return;
        }

        if (noteNumber > notes.length) {
          this.showVoiceResponse(`There are only ${notes.length} notes.`);
          return;
        }

        const note = notes[noteNumber - 1];

        if (!note?.id) {
          this.showVoiceResponse("Could not identify the selected note.");
          return;
        }

        const confirmed = window.confirm(
          `Are you sure you want to delete note ${noteNumber}?\n\n"${note.title}"`
        );

        if (!confirmed) {
          this.showVoiceResponse("Note deletion cancelled.");
          return;
        }

        this.noteService.deleteNote(note.id).subscribe({
          next: (result) => {
            console.log("Note deleted:", result);
            this.showVoiceResponse(`Note ${noteNumber} deleted successfully.`);
          },
          error: (err) => {
            console.error("Note deletion error:", err);
            this.showVoiceResponse("Unable to delete the note.");
          },
        });
      },
      error: (err) => {
        console.error("Notes fetch error:", err);
        this.showVoiceResponse("Unable to fetch your notes.");
      },
    });
  }

  // ==========================================
  // GOAL - CREATE
  // ==========================================

  createGoalFromVoice(text: string): void {
    let title = text;

    const patterns = [
      /create a goal to /i,
      /create a goal for /i,
      /create a goal called /i,
      /create a goal named /i,
      /create goal to /i,
      /create goal for /i,
      /create goal called /i,
      /create goal named /i,
      /add a goal to /i,
      /add a goal for /i,
      /add goal to /i,
      /add goal for /i,
      /set a goal to /i,
      /set a goal for /i,
      /set goal to /i,
      /set goal for /i,
      /make a goal to /i,
      /make a goal for /i,
      /create a goal /i,
      /create goal /i,
      /add a goal /i,
      /add goal /i,
      /set a goal /i,
      /set goal /i,
    ];

    patterns.forEach((pattern) => {
      title = title.replace(pattern, "");
    });

    title = title.trim();

    if (!title) {
      this.showVoiceResponse("I could not understand the goal title.");
      return;
    }

    const newGoal = {
      user_id: this.currentUserId,
      title,
      description: "",
      progress: 0,
      target_date: "",
    };

    this.goalService.createGoal(newGoal).subscribe({
      next: (response) => {
        console.log("Goal created:", response);
        this.showVoiceResponse(`Goal created successfully: ${title}`);
      },
      error: (err) => {
        console.error("Goal creation error:", err);
        this.showVoiceResponse("Unable to create the goal.");
      },
    });
  }

  // ==========================================
  // GOAL - SHOW
  // ==========================================

  showGoalsFromVoice(): void {
    this.goalService.getGoals().subscribe({
      next: (response: any) => {
        const goals = this.extractArray(response, "goals");

        console.log("Goals:", goals);

        if (goals.length === 0) {
          this.showVoiceResponse("You currently have no saved goals.");
          return;
        }

        const goalList = goals
          .map(
            (goal: any, index: number) =>
              `${index + 1}. ${goal.title}, ${
                goal.progress || 0
              } percent completed.`
          )
          .join("\n");

        this.showVoiceResponse(`Here are your goals:\n${goalList}`);
      },
      error: (err) => {
        console.error("Goal loading error:", err);
        this.showVoiceResponse("Sorry, I couldn't retrieve your goals.");
      },
    });
  }

  // ==========================================
  // GOAL - UPDATE
  // ==========================================

  updateGoalFromVoice(text: string): void {
    const idMatch = text.match(
      /\b(?:goal\s*(?:id\s*)?|id\s*|number\s*)(\d+)\b/i
    );

    if (!idMatch) {
      this.showVoiceResponse(
        "Please specify the goal number. Example: Update goal 2 progress to 75 percent."
      );
      return;
    }

    const goalNumber = parseInt(idMatch[1], 10);

    if (goalNumber <= 0) {
      this.showVoiceResponse("Please provide a valid goal number.");
      return;
    }

    this.goalService.getGoals().subscribe({
      next: (response: any) => {
        const goals = this.extractArray(response, "goals");

        if (!goals.length) {
          this.showVoiceResponse("You currently have no goals.");
          return;
        }

        // Explicit ID means database ID.
        const explicitId = /\b(?:goal\s*)?id\s*\d+\b/i.test(text);

        const existingGoal = explicitId
          ? goals.find((goal: any) => Number(goal.id) === goalNumber)
          : goals[goalNumber - 1];

        if (!existingGoal) {
          this.showVoiceResponse(`Could not find goal ${goalNumber}.`);
          return;
        }

        const updatedGoal: any = {
          user_id: existingGoal.user_id || this.currentUserId,
          title: existingGoal.title,
          description: existingGoal.description || "",
          progress: existingGoal.progress || 0,
          target_date: existingGoal.target_date || "",
        };

        const progressMatch = text.match(
          /\b(?:progress|completion)\s+(?:to\s+)?(\d{1,3})\s*(?:percent|%)?/i
        );

        let updateMessage = "";

        if (/\b(complete|completed|finish|finished|done)\b/i.test(text)) {
          updatedGoal.progress = 100;
          updateMessage = `Goal ${goalNumber} marked as completed.`;
        } else if (progressMatch) {
          const progress = parseInt(progressMatch[1], 10);

          if (progress < 0 || progress > 100) {
            this.showVoiceResponse(
              "Goal progress must be between 0 and 100 percent."
            );
            return;
          }

          updatedGoal.progress = progress;
          updateMessage = `Goal ${goalNumber} progress updated to ${progress} percent.`;
        } else {
          const title = text
            .replace(/\bupdate\b/i, "")
            .replace(/\bedit\b/i, "")
            .replace(/\bchange\b/i, "")
            .replace(/\bmodify\b/i, "")
            .replace(/\bgoal\s*(?:id\s*)?\d+\b/i, "")
            .replace(/\bid\s*\d+\b/i, "")
            .replace(/\bnumber\s*\d+\b/i, "")
            .replace(/^\s*to\s+/i, "")
            .trim();

          if (!title) {
            this.showVoiceResponse("Please provide the new goal title.");
            return;
          }

          updatedGoal.title = title;
          updateMessage = `Goal ${goalNumber} title updated successfully.`;
        }

        this.goalService.updateGoal(existingGoal.id, updatedGoal).subscribe({
          next: (result) => {
            console.log("Goal updated:", result);
            this.showVoiceResponse(updateMessage);
          },
          error: (err) => {
            console.error("Goal update error:", err);
            this.showVoiceResponse("Unable to update the goal.");
          },
        });
      },

      error: (err) => {
        console.error("Goals fetch error:", err);
        this.showVoiceResponse("Unable to fetch your goals.");
      },
    });
  }

  // ==========================================
  // GOAL - DELETE
  // ==========================================

  deleteGoalFromVoice(text: string): void {
    const numberMatch = text.match(/\bgoal\s+(\d+)\b/i);

    if (!numberMatch) {
      this.showVoiceResponse("Please specify the goal number.");
      return;
    }

    const goalNumber = parseInt(numberMatch[1], 10);

    if (goalNumber <= 0) {
      this.showVoiceResponse("Please provide a valid goal number.");
      return;
    }

    this.goalService.getGoals().subscribe({
      next: (response: any) => {
        const goals = this.extractArray(response, "goals");

        if (goals.length === 0) {
          this.showVoiceResponse("You currently have no goals.");
          return;
        }

        if (goalNumber > goals.length) {
          this.showVoiceResponse(`There are only ${goals.length} goals.`);
          return;
        }

        const goal = goals[goalNumber - 1];

        if (!goal?.id) {
          this.showVoiceResponse("Could not identify the selected goal.");
          return;
        }

        const confirmed = window.confirm(
          `Are you sure you want to delete goal ${goalNumber}?\n\n"${goal.title}"`
        );

        if (!confirmed) {
          this.showVoiceResponse("Goal deletion cancelled.");
          return;
        }

        this.goalService.deleteGoal(goal.id).subscribe({
          next: (result) => {
            console.log("Goal deleted:", result);

            this.showVoiceResponse(
              `Goal ${goalNumber}, ${goal.title}, deleted successfully.`
            );
          },
          error: (err) => {
            console.error("Goal deletion error:", err);
            this.showVoiceResponse("Unable to delete the goal.");
          },
        });
      },
      error: (err) => {
        console.error("Goals fetch error:", err);
        this.showVoiceResponse("Unable to fetch your goals.");
      },
    });
  }
}
