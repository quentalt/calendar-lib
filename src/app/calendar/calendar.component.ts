import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {EventPopupComponent} from "../event-popup/event-popup.component";
import {DragDropModule, CdkDragDrop, transferArrayItem} from '@angular/cdk/drag-drop';

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
    FormsModule,
    NgForOf,
    NgClass,
    NgStyle,
    EventPopupComponent,
    NgIf,
    DragDropModule
  ],
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  view: 'months' | 'days' = 'days';
  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];
  dates: Date[] = [];
  currentDate: Date = new Date();
  selectedYear: number = this.currentDate.getFullYear();
  selectedMonth: number = this.currentDate.getMonth();
  showPopup: boolean = false;
  selectedDate: Date | null = null;
  selectedEvent: CalendarEvent | null = null;
  events: CalendarEvent[] = [];

  ngOnInit() {
    this.generateYears();
    this.loadEvents();
    this.generateCalendar();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      this.years.push(i);
    }
  }

  generateCalendar() {
    const startOfMonth = new Date(this.selectedYear, this.selectedMonth, 1);
    const endOfMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0);
    const startDay = startOfMonth.getDay();
    const endDay = endOfMonth.getDate();

    this.dates = [];
    for (let i = 0; i < startDay; i++) {
      this.dates.push(new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i - startDay + 1));
    }
    for (let i = 1; i <= endDay; i++) {
      this.dates.push(new Date(this.selectedYear, this.selectedMonth, i));
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  isSelected(date: Date): boolean {
    if (this.selectedDate === null) {
      return false;
    }
    return date.getTime() === this.selectedDate.getTime() && this.view === 'days';
  }

  goToToday() {
    this.currentDate = new Date();
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth();
    this.generateCalendar();
    this.view = 'days';
  }

  onYearChange(event: Event) {
    this.generateCalendar();
  }

  onMonthChange(event: Event) {
    this.generateCalendar();
  }

  selectMonth(month: number) {
    this.selectedMonth = month;
    this.generateCalendar();
    this.view = 'days';
  }

  backToMonths() {
    this.view = 'months';
  }

  prevYear() {
    this.selectedYear--;
    this.generateCalendar();
  }

  nextYear() {
    this.selectedYear++;
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

  saveEvent(event: { name: string, color: string, start: Date, end: Date }) {
    const existingEventIndex = this.events.findIndex(e => e.start.getTime() === event.start.getTime() && e.end.getTime() === event.end.getTime());
    if (existingEventIndex > -1) {
      this.events[existingEventIndex] = event;
    } else {
      this.events.push(event);
    }

    this.saveEvents();
    this.closePopup();
  }

  deleteEvent(event: CalendarEvent) {
    this.events = this.events.filter(e => e !== event);
    this.saveEvents();
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

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events.filter(event => date >= event.start && date <= event.end);
  }

  onDrop(event: CdkDragDrop<CalendarEvent[]>, date: Date) {
    if (event.previousContainer === event.container) {
      return;
    }

    const movedEvent = event.item.data;
    const newStartDate = new Date(date);
    const updatedEvent = this.updateEventDates(movedEvent, newStartDate);

    // Remove the event from the previous date's list
    const previousDateEvents = event.previousContainer.data;
    const eventIndex = previousDateEvents.findIndex(e => e === movedEvent);
    if (eventIndex > -1) {
      previousDateEvents.splice(eventIndex, 1);
    }

    // Add the updated event to the new date's list
    const newDateEvents = event.container.data;
    newDateEvents.push(updatedEvent);

    // Update the main events array
    this.events = this.events.map(e => e === movedEvent ? updatedEvent : e);
    this.saveEvents();
  }

  updateEventDates(event: CalendarEvent, newStartDate: Date): CalendarEvent {
    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60 * 24); // Duration in days
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + duration);

    return {
      ...event,
      start: newStartDate,
      end: newEndDate
    };
  }

  saveEvents() {
    localStorage.setItem('calendarEvents', JSON.stringify(this.events));
  }

  loadEvents() {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      this.events = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
    }
  }
}
