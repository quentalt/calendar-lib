import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CalendarComponent } from './app/components/calendar/calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarComponent],
  template: `
    <div class="container">
      <h1>Calendrier</h1>
      <app-calendar></app-calendar>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 2rem;
    }
  `]
})
export class App {}

bootstrapApplication(App);