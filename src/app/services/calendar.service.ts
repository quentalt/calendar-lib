import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CalendarEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private events = new BehaviorSubject<CalendarEvent[]>([]);

  getEvents(): Observable<CalendarEvent[]> {
    return this.events.asObservable();
  }

  addEvent(event: CalendarEvent): void {
    const currentEvents = this.events.getValue();
    this.events.next([...currentEvents, { ...event, id: crypto.randomUUID() }]);
  }

  updateEvent(updatedEvent: CalendarEvent): void {
    const currentEvents = this.events.getValue();
    const index = currentEvents.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      currentEvents[index] = updatedEvent;
      this.events.next([...currentEvents]);
    }
  }

  deleteEvent(eventId: string): void {
    const currentEvents = this.events.getValue();
    this.events.next(currentEvents.filter(e => e.id !== eventId));
  }
}