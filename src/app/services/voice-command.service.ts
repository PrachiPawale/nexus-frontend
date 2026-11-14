import { Injectable } from "@angular/core";

export interface VoiceCommand {
  type: "task" | "note" | "goal" | "calendar" | "unknown";
  action: "create" | "show" | "update" | "delete" | "unknown";
  text: string;
}

@Injectable({
  providedIn: "root",
})
export class VoiceCommandService {
  parseCommand(text: string): VoiceCommand {
    const command = text.toLowerCase().trim();

    const result = (
      type: VoiceCommand["type"],
      action: VoiceCommand["action"]
    ): VoiceCommand => ({
      type,
      action,
      text,
    });

    // --------------------------------
    // DETECT MODULE
    // --------------------------------

    let type: VoiceCommand["type"] = "unknown";

    if (/\b(tasks?|todos?|to-dos?)\b/i.test(command)) {
      type = "task";
    } else if (/\b(notes?)\b/i.test(command)) {
      type = "note";
    } else if (/\b(goals?)\b/i.test(command)) {
      type = "goal";
    } else if (
      /\b(calendar|meeting|meetings|event|events|schedule)\b/i.test(command)
    ) {
      type = "calendar";
    }

    // --------------------------------
    // DETECT ACTION
    // --------------------------------

    let action: VoiceCommand["action"] = "unknown";

    // CREATE
    if (/\b(create|add|make|write|set|book|schedule)\b/i.test(command)) {
      action = "create";
    }

    // SHOW
    else if (
      /\b(show|list|view|display|find|what|which|upcoming)\b/i.test(command) ||
      /\b(my tasks|my notes|my goals|my schedule|my meetings)\b/i.test(command)
    ) {
      action = "show";
    }

    // UPDATE
    else if (
      /\b(update|edit|change|modify|complete|finish|mark)\b/i.test(command)
    ) {
      action = "update";
    }

    // DELETE
    else if (/\b(delete|remove|erase|cancel)\b/i.test(command)) {
      action = "delete";
    }

    if (type === "unknown" || action === "unknown") {
      return result("unknown", "unknown");
    }

    return result(type, action);
  }
}
