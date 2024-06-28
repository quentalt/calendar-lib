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
  @Output() save = new EventEmitter<{ name: string, color: string, start: string, end: string }>();

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
    this.save.emit({
      name: this.eventName,
      color: this.eventColor,
      start: this.startDate,
      end: this.endDate
    });
    this.closePopup();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
