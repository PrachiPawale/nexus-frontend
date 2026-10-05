import { Injectable } from '@angular/core';

export interface VoiceCommand {
  type: 'task' | 'note' | 'goal' | 'calendar' | 'unknown';
  action: 'create' | 'show' | 'update' | 'delete' | 'unknown';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceCommandService {

  parseCommand(text: string): VoiceCommand {

    const command = text.toLowerCase().trim();

    // TASK
    if (
      command.includes('task') ||
      command.includes('todo') ||
      command.includes('to-do')
    ) {

      if (
        command.includes('create') ||
        command.includes('add') ||
        command.includes('make')
      ) {

        return {
          type: 'task',
          action: 'create',
          text: text
        };

      }

      if (
        command.includes('show') ||
        command.includes('list') ||
        command.includes('view')
      ) {

        return {
          type: 'task',
          action: 'show',
          text: text
        };

      }

    }


    // NOTE
    if (
      command.includes('note') ||
      command.includes('notes')
    ) {

      if (
        command.includes('create') ||
        command.includes('add') ||
        command.includes('write')
      ) {

        return {
          type: 'note',
          action: 'create',
          text: text
        };

      }

      if (
        command.includes('show') ||
        command.includes('list') ||
        command.includes('view')
      ) {

        return {
          type: 'note',
          action: 'show',
          text: text
        };

      }

    }


    // GOAL
    if (
      command.includes('goal') ||
      command.includes('goals')
    ) {

      if (
        command.includes('create') ||
        command.includes('add') ||
        command.includes('set')
      ) {

        return {
          type: 'goal',
          action: 'create',
          text: text
        };

      }

      if (
        command.includes('show') ||
        command.includes('list') ||
        command.includes('view')
      ) {

        return {
          type: 'goal',
          action: 'show',
          text: text
        };

      }

    }


    // CALENDAR
    if (
      command.includes('calendar') ||
      command.includes('meeting') ||
      command.includes('event') ||
      command.includes('schedule')
    ) {

      if (
        command.includes('create') ||
        command.includes('add') ||
        command.includes('schedule') ||
        command.includes('book')
      ) {

        return {
          type: 'calendar',
          action: 'create',
          text: text
        };

      }

      if (
        command.includes('show') ||
        command.includes('list') ||
        command.includes('view')
      ) {

        return {
          type: 'calendar',
          action: 'show',
          text: text
        };

      }

    }


    return {
      type: 'unknown',
      action: 'unknown',
      text: text
    };

  }

}