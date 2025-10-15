// src/app/shared/under-construction/under-construction.component.ts
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, pipes etc.

@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './maintanence.html',
  styleUrls: ['./maintanence.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UnderConstructionComponent implements OnInit, OnDestroy {
  // Set your target date here (e.g., 2 days from now)
  // For example: new Date().getTime() + 2 * 24 * 60 * 60 * 1000; // 2 days
  // Or a specific future date: new Date('2024-12-31T00:00:00').getTime();
  private targetDate = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // Example: 7 days from now

  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  private countdownInterval: any;

  ngOnInit(): void {
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000); // Update every second
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.targetDate - now;

    if (distance < 0) {
      clearInterval(this.countdownInterval);
      this.days.set(0);
      this.hours.set(0);
      this.minutes.set(0);
      this.seconds.set(0);
      // Optionally, show a "We are live!" message or redirect
      return;
    }

    this.days.set(Math.floor(distance / (1000 * 60 * 60 * 24)));
    this.hours.set(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    this.minutes.set(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
    this.seconds.set(Math.floor((distance % (1000 * 60)) / 1000));
  }
}