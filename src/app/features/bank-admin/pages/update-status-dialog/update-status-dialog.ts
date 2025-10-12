import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationStatus } from '../../../../core/model/model';
import { CommonModule } from '@angular/common';
import { BankAdminService } from '../../../../core/services/bank-admin.service';

// Define the shape of the data passed to the dialog
interface DialogData {
  organizationId: string;
  organizationName: string;
  newStatus: OrganizationStatus;
}

@Component({
  selector: 'app-update-status-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule
  ],
  template: `
    <h2 mat-dialog-title>Confirm Status Change</h2>
    <mat-dialog-content [formGroup]="form">
      <p>
        Are you sure you want to <strong>{{ data.newStatus | lowercase }}</strong> the organization 
        "{{ data.organizationName }}"?
      </p>
      <mat-form-field>
        <mat-label>Note (Required for rejection)</mat-label>
        <textarea matInput formControlName="note" cdkTextareaAutosize></textarea>
        @if (form.controls.note.hasError('required')) {
          <mat-error>A note is required to reject an organization.</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="{ success: false }">Cancel</button>
      <button mat-flat-button
        [color]="data.newStatus === OrganizationStatus.APPROVED ? 'primary' : 'warn'"
        [disabled]="form.invalid"
        (click)="submit()">
        Confirm
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateStatusDialog {
  private readonly fb = inject(FormBuilder);
  private readonly bankAdminService = inject(BankAdminService);
  private readonly dialogRef = inject(MatDialogRef<UpdateStatusDialog>);
  public readonly data: DialogData = inject(MAT_DIALOG_DATA);

  readonly OrganizationStatus = OrganizationStatus; // Make enum available
  readonly form = this.fb.group({
    note: ['', this.data.newStatus === OrganizationStatus.REJECTED ? Validators.required : null],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const note = this.form.value.note ?? '';
    this.bankAdminService.updateOrganizationStatus(Number(this.data.organizationId), this.data.newStatus, note)
      .subscribe({
        next: () => this.dialogRef.close({ success: true }),
        error: () => {
          // You can show a snackbar here for the error
          this.dialogRef.close({ success: false });
        },
      });
  }
}