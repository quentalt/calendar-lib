import { Component, OnInit } from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {EventPopupComponent} from "../event-popup/event-popup.component";

interface CalendarEvent {
  name: string;
  color: string;
  start: Date;
  end: Date;
}

@Component({
  selector: 'lib-calendar',
  templateUrl: './calendar.component.html',
  standalone: true,
  imports: [
    NgIf,
    EventPopupComponent,
    NgStyle,
    NgClass,
    NgForOf
  ],
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dates: Date[] = [];
  currentDate: Date = new Date();
  showPopup: boolean = false;
  selectedDate: Date | null = null;
  selectedEvent: CalendarEvent | null = null;
  events: CalendarEvent[] = [];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const startOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const endDay = endOfMonth.getDate();

    this.dates = [];
    for (let i = 0; i < startDay; i++) {
      this.dates.push(new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i - startDay + 1));
    }
    for (let i = 1; i <= endDay; i++) {
      this.dates.push(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i));
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  isSelected(date: Date): boolean {
    return this.selectedDate ? date.getTime() === this.selectedDate.getTime() : false;
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  openPopup(date: Date) {
    this.selectedDate = date;
    this.selectedEvent = this.getEvent(date);
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  saveEvent(event: { name: string, color: string, start: string, end: string }) {
    const newEvent: CalendarEvent = {
      name: event.name,
      color: event.color,
      start: new Date(event.start),
      end: new Date(event.end)
    };

    const existingEventIndex = this.events.findIndex(e => e.start.getTime() === newEvent.start.getTime() && e.end.getTime() === newEvent.end.getTime());
    if (existingEventIndex > -1) {
      this.events[existingEventIndex] = newEvent;
    } else {
      this.events.push(newEvent);
    }

    this.closePopup();
  }

  hasEvent(date: Date): boolean {
    return this.events.some(event => date >= event.start && date <= event.end);
  }

  getEvent(date: Date): CalendarEvent | null {
    return this.events.find(event => date >= event.start && date <= event.end) || null;
  }

  getEventColor(date: Date): string {
    const event = this.getEvent(date);
    return event ? event.color : '';
  }

  getEventName(date: Date): string {
    const event = this.getEvent(date);
    return event ? event.name : '';
  }

  editEvent(date: Date) {
    this.selectedDate = date;
    this.selectedEvent = this.getEvent(date);
    this.showPopup = true;
  }
}
