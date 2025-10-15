import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css'],
})
export class ConfirmDialogComponent {
  // --- Inputs to configure the dialog ---
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmButtonType: 'primary' | 'danger' | 'success' = 'primary';

  // --- Output event ---
  @Output() closed = new EventEmitter<boolean>();

  onConfirm(): void {
    this.closed.emit(true);
  }

  onCancel(): void {
    this.closed.emit(false);
  }
}