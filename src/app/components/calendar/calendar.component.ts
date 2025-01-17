import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../services/calendar.service';
import { CalendarEvent } from '../../models/event.model';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendar-container">
      <div class="calendar">
        <header class="calendar-header">
          <div class="calendar-nav">
            <button class="nav-button" (click)="previousMonth()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <h2>{{ format(currentDate, 'MMMM yyyy', { locale: fr }) }}</h2>
            <button class="nav-button" (click)="nextMonth()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <button class="today-button" (click)="goToToday()">Aujourd'hui</button>
        </header>

        <div class="calendar-grid">
          <div class="weekdays">
            <div class="weekday" *ngFor="let day of weekDays">{{ day }}</div>
          </div>
          <div class="days">
            <div
                *ngFor="let date of calendarDays"
                class="day"
                [class.other-month]="!isSameMonth(date, currentDate)"
                [class.today]="isSameDay(date, today)"
                (click)="openEventDialog(date)"
            >
              <div class="date-number">{{ format(date, 'd') }}</div>
              <div class="events">
                <div
                    *ngFor="let event of getEventsForDate(date)"
                    class="event"
                    [class.event-start]="isSameDay(date, event.start)"
                    [class.event-end]="isSameDay(date, event.end)"
                    [class.event-middle]="!isSameDay(date, event.start) && !isSameDay(date, event.end)"
                    [style.backgroundColor]="event.color"
                    (click)="editEvent($event, event)"
                >
                  <span class="event-title">{{ event.title }}</span>
                  <span class="event-time" *ngIf="isSameDay(date, event.start)">
                    {{ format(event.start, 'HH:mm') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showEventDialog" class="dialog-overlay" (click)="closeEventDialog()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h3>{{ selectedEvent ? 'Modifier l\\'évènement' : 'Nouvel évènement' }}</h3>
            <button class="close-button" (click)="closeEventDialog()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <form (submit)="saveEvent()" class="dialog-form">
            <div class="form-group">
              <label>Titre</label>
              <input
                  [(ngModel)]="eventForm.title"
                  name="title"
                  placeholder="Titre de l'événement"
                  class="form-input"
                  required
              >
            </div>

            <div class="form-group">
              <label>Date et heure de début</label>
              <input
                  type="datetime-local"
                  [ngModel]="formatDateForInput(eventForm.start)"
                  (ngModelChange)="eventForm.start = parseInputDate($event)"
                  name="start"
                  class="form-input"
                  required
              >
            </div>

            <div class="form-group">
              <label>Date et heure de fin</label>
              <input
                  type="datetime-local"
                  [ngModel]="formatDateForInput(eventForm.end)"
                  (ngModelChange)="eventForm.end = parseInputDate($event)"
                  name="end"
                  class="form-input"
                  required
              >
            </div>

            <div class="form-group">
              <label>Couleur</label>
              <div class="color-picker">
                <input
                    type="color"
                    [(ngModel)]="eventForm.color"
                    name="color"
                    class="color-input"
                >
                <span class="color-preview" [style.backgroundColor]="eventForm.color"></span>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                  [(ngModel)]="eventForm.description"
                  name="description"
                  placeholder="Description de l'événement"
                  class="form-textarea"
                  rows="3"
              ></textarea>
            </div>

            <div class="dialog-buttons">
              <button *ngIf="selectedEvent" type="button" class="btn-danger" (click)="deleteEvent()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Supprimer
              </button>
              <div class="right-buttons">
                <button type="button" class="btn-secondary" (click)="closeEventDialog()">Annuler</button>
                <button type="submit" class="btn-primary">
                  {{ selectedEvent ? 'Mettre à jour' : 'Créer' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .calendar {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .calendar-nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .calendar-nav h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      min-width: 200px;
      text-align: center;
    }

    .nav-button {
      background: transparent;
      border: 1px solid #e2e8f0;
      color: #64748b;
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-button:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .today-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .today-button:hover {
      background: #2563eb;
    }

    .calendar-grid {
      padding: 1rem;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 1px;
    }

    .weekday {
      padding: 0.75rem;
      text-align: center;
      font-weight: 600;
      color: #64748b;
      font-size: 0.875rem;
    }

    .days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #e2e8f0;
    }

    .day {
      background: white;
      min-height: 120px;
      padding: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }

    .day:hover {
      background: #f8fafc;
    }

    .date-number {
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .other-month {
      background: #f8fafc;
    }

    .other-month .date-number {
      color: #94a3b8;
    }

    .today {
      background: #eff6ff;
    }

    .today .date-number {
      color: #3b82f6;
      font-weight: 600;
    }

    .events {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .event {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .event:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 2;
    }

    .event-start {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      margin-left: 0;
    }

    .event-end {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      margin-right: 0;
    }

    .event-middle {
      border-radius: 0;
      margin: 0 -0.5rem;
    }

    .event-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .event-time {
      font-size: 0.7rem;
      opacity: 0.9;
      margin-left: 0.5rem;
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 90%;
      max-width: 500px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
      font-weight: 600;
    }

    .close-button {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .close-button:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .dialog-form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #475569;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      color: #1e293b;
      transition: all 0.2s;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      background: white;
    }

    .color-picker {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .color-input {
      width: 100px;
      height: 40px;
      padding: 0;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .color-preview {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .dialog-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      gap: 1rem;
    }

    .right-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn-primary,
    .btn-secondary,
    .btn-danger {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-danger {
      background: #fee2e2;
      color: #ef4444;
      border: 1px solid #fecaca;
    }

    .btn-danger:hover {
      background: #fecaca;
    }
  `]
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  today = new Date();
  calendarDays: Date[] = [];
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  events: CalendarEvent[] = [];
  showEventDialog = false;
  selectedEvent: CalendarEvent | null = null;
  selectedDate: Date | null = null;

  eventForm: Partial<CalendarEvent> = {
    title: '',
    start: new Date(),
    end: new Date(),
    color: '#3b82f6',
    description: ''
  };

  constructor(private calendarService: CalendarService) {}

  ngOnInit() {
    this.generateCalendarDays();
    this.calendarService.getEvents().subscribe(events => {
      this.events = events;
    });
  }

  generateCalendarDays() {
    const start = startOfWeek(startOfMonth(this.currentDate), { weekStartsOn: 1 });
    const end = endOfMonth(this.currentDate);
    const days = eachDayOfInterval({ start, end });

    let lastDay = days[days.length - 1];
    while (days.length % 7 !== 0) {
      lastDay = addDays(lastDay, 1);
      days.push(lastDay);
    }

    this.calendarDays = days;
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.generateCalendarDays();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateCalendarDays();
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events.filter(event =>
        isSameDay(date, event.start) ||
        isSameDay(date, event.end) ||
        (event.start <= date && event.end >= date)
    );
  }

  formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    return format(date, "yyyy-MM-dd'T'HH:mm");
  }

  parseInputDate(dateString: string): Date {
    return parseISO(dateString);
  }

  openEventDialog(date: Date) {
    this.selectedDate = date;
    this.showEventDialog = true;
    const now = new Date();
    this.eventForm = {
      title: '',
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), now.getHours(), now.getMinutes()),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), now.getHours() + 1, now.getMinutes()),
      color: '#3b82f6',
      description: ''
    };
  }

  editEvent(event: MouseEvent, calendarEvent: CalendarEvent) {
    event.stopPropagation();
    this.selectedEvent = calendarEvent;
    this.showEventDialog = true;
    this.eventForm = { ...calendarEvent };
  }

  saveEvent() {
    if (this.eventForm.title && this.eventForm.start && this.eventForm.end) {
      if (this.selectedEvent) {
        this.calendarService.updateEvent({
          ...this.selectedEvent,
          ...this.eventForm as CalendarEvent
        });
      } else {
        this.calendarService.addEvent(this.eventForm as CalendarEvent);
      }
      this.closeEventDialog();
    }
  }

  deleteEvent() {
    if (this.selectedEvent) {
      this.calendarService.deleteEvent(this.selectedEvent.id);
      this.closeEventDialog();
    }
  }

  closeEventDialog() {
    this.showEventDialog = false;
    this.selectedEvent = null;
    this.eventForm = {
      title: '',
      start: new Date(),
      end: new Date(),
      color: '#3b82f6',
      description: ''
    };
  }

  protected readonly isSameDay = isSameDay;
  protected readonly format = format;
  protected readonly isSameMonth = isSameMonth;
  protected readonly fr = fr;
}