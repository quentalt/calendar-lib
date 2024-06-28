import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'lib-event-popup',
  templateUrl: './event-popup.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./event-popup.component.scss']
})
export class EventPopupComponent implements OnChanges {
  @Input() event: { name: string, color: string, start: Date, end: Date } | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ name: string, color: string, start: Date, end: Date }>();
  @Output() delete = new EventEmitter<{ name: string, color: string, start: Date, end: Date }>();

  eventName: string = '';
  eventColor: string = '#000000';
  startDate: string = '';
  endDate: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['event'] && this.event) {
      this.eventName = this.event.name;
      this.eventColor = this.event.color;
      this.startDate = this.formatDate(this.event.start);
      this.endDate = this.formatDate(this.event.end);
    }
  }

  closePopup() {
    this.close.emit();
  }

  saveEvent() {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    const newEvent = {
      name: this.eventName,
      color: this.eventColor,
      start: new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())),
      end: new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()))
    };

    this.save.emit(newEvent);
    this.closePopup();
  }

  deleteEvent() {
    if (this.event) {
      this.delete.emit(this.event);
    }
    this.closePopup();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
