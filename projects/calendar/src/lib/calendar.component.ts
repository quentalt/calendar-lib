import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import * as moment from 'moment';


interface CalendarDay {
  date: Date;
  events: { title: string }[];
}

@Component({
  selector: 'lib-calendar',
  template: `
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
  <div class="flex items-center justify-between p-4 bg-blue-500 text-white">
    <button (click)="prevMonth()" class="focus:outline-none">
      &#9664;
    </button>
    <span class="font-bold text-lg">{{ currentMonth | date: 'MMMM yyyy' }}</span>
    <button (click)="nextMonth()" class="focus:outline-none">
      &#9654;
    </button>
    <button (click)="goToToday()" class="ml-4 bg-white text-blue-500 px-2 py-1 rounded focus:outline-none">
      Today
    </button>
  </div>
  <div class="grid grid-cols-7 gap-2 p-4">
    <div *ngFor="let day of daysOfWeek" class="text-center font-bold">
      {{ day }}
    </div>
  </div>
  <div class="grid grid-cols-7 gap-2 p-4">
    <div *ngFor="let day of calendarDays" class="border rounded-lg p-2" cdkDropList [cdkDropListData]="day.events" (cdkDropListDropped)="drop($event, day)">
      <div [ngClass]="{'bg-blue-500 text-white': isToday(day.date), 'bg-blue-100': !isToday(day.date)}" class="text-center font-semibold rounded-full w-8 h-8 mx-auto flex items-center justify-center">
        {{ day.date.getDate() }}
      </div>
      <div class="mt-2">
        <div *ngFor="let event of day.events" (click)="editEvent(event, day.date)" class="rounded px-1 py-0.5 text-xs mb-1 cursor-pointer" [ngStyle]="{'background-color': event.color}" cdkDrag>
          {{ event.title }}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Popup d'édition d'événement -->
<div *ngIf="selectedEvent" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
  <div class="bg-white p-4 rounded-lg shadow-lg">
    <h2 class="text-lg font-bold mb-2">Edit Event</h2>
    <form [formGroup]="eventForm">
      <input formControlName="title" class="border p-2 w-full mb-2" placeholder="Event Title" />
      <ngx-daterangepicker-material formControlName="dateRange" class="border p-2 w-full mb-2"></ngx-daterangepicker-material>
      <input formControlName="color" class="border p-2 w-full mb-2" cpColorPicker />
    </form>
    <div class="flex justify-end">
      <button (click)="saveEvent()" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
      <button (click)="closePopup()" class="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
    </div>
  </div>
</div>

  `,
  styles: [
    `
.calendar {
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.header {
  background-color: #f7f7f7;
}

.event {
  font-size: 0.75rem;
}

.bg-blue-100 {
  background-color: #ebf8ff;
}

.bg-blue-500 {
  background-color: #4299e1;
}

.text-white {
  color: #fff;
}

.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-gray-800 {
  background-color: #2d3748;
}

.bg-opacity-75 {
  opacity: 0.75;
}

.cursor-pointer {
  cursor: pointer;
}

    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements OnInit {
  currentMonth: Date = new Date();
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];
  selectedEvent: { title: string, color: string } | null = null;
  selectedDate: Date | null = null;
  eventForm: FormGroup = new FormGroup({});
  color: string = '#000000';


  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: [''],
      color: ['#000000'],
      dateRange: [{ startDate: moment(), endDate: moment() }]
    });
  }
  
  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    // Calculer le début de la semaine à afficher
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Calculer la fin de la semaine à afficher
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    this.calendarDays = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      this.calendarDays.push({
        date: new Date(date),
        events: this.getEventsForDate(date)
      });
    }
  }

  getEventsForDate(date: Date): { title: string, color: string }[] {
    // Remplacez cette logique par la récupération des événements réels
    return [
      // Exemple fictif d'événements
      { title: 'Event 1', color: '#ff0000' },
      { title: 'Event 2', color: '#00ff00' }
    ];
  }

  prevMonth() {
    const newMonth = new Date(this.currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    this.currentMonth = newMonth;
    this.generateCalendar();
  }

  nextMonth() {
    const newMonth = new Date(this.currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    this.currentMonth = newMonth;
    this.generateCalendar();
  }

  goToToday() {
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  editEvent(event: { title: string, color: string }, date: Date) {
    this.selectedEvent = { ...event };
    this.selectedDate = date;
    this.eventForm.setValue({
      title: event.title,
      color: event.color,
      dateRange: {
        startDate: moment(date),
        endDate: moment(date)
      }
    });
  }

  saveEvent() {
    if (this.selectedEvent && this.selectedDate) {
      const startDate = this.eventForm.value.dateRange.startDate.toDate();
      const endDate = this.eventForm.value.dateRange.endDate.toDate();
      const event = {
        title: this.eventForm.value.title,
        color: this.eventForm.value.color
      };

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const day = this.calendarDays.find(d => d.date.getTime() === date.getTime());
        if (day) {
          const eventIndex = day.events.findIndex(e => e.title === this.selectedEvent!.title);
          if (eventIndex !== -1) {
            day.events[eventIndex] = event;
          } else {
            day.events.push(event);
          }
        }
      }

      this.selectedEvent = null;
      this.selectedDate = null;
    }
  }

  closePopup() {
    this.selectedEvent = null;
    this.selectedDate = null;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  drop(event: CdkDragDrop<{ title: string, color: string }[]>, day: CalendarDay) {
    if (event.previousContainer === event.container) {
      moveItemInArray(day.events, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, day.events, event.previousIndex, event.currentIndex);
    }
  }
}