import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnDestroy, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationService } from '../../../../core/services/organization.service';
import { JobCompletionResponse } from '../../../../core/model/model';

type UploadStatus = 'idle' | 'uploading' | 'polling' | 'result';

@Component({
  selector: 'app-employee-csv-uploader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-csv-uploader.html',
  styleUrls: ['./employee-csv-uploader.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeCsvUploaderComponent implements OnDestroy {
  private orgService = inject(OrganizationService);
  @Output() closed = new EventEmitter<boolean>();

  // --- UI State ---
  status = signal<UploadStatus>('idle');
  selectedFile = signal<File | null>(null);
  jobExecutionId = signal<number | null>(null);
  uploadResult = signal<JobCompletionResponse | null>(null);
  errorMessage = signal<string | null>(null);

  private pollingInterval: any = null;
  private pollingAttempts = 0;
  private maxPollingAttempts = 40; // Poll for a maximum of 2 minutes (40 * 3s)

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.errorMessage.set(null);
  }

  downloadFormat(): void {
    this.orgService.downloadEmployeeCsvFormat().subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'employee_format.csv';
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => this.errorMessage.set('Could not download the format file.'),
    });
  }

   startUploadProcess(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.status.set('uploading');
    this.errorMessage.set(null);

    this.orgService.startEmployeeCsvJob(file).subscribe({
      next: (response) => {
        this.jobExecutionId.set(response.jobExecutionId);
        this.status.set('polling');
        this.startPolling(response.jobExecutionId);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400) { 
          this.errorMessage.set('Invalid CSV format. Please download the template and ensure all required headers are present.');
        } else {
          this.errorMessage.set(err.error?.message || 'An unexpected error occurred while starting the job.');
        }
        this.status.set('idle'); 
      },
    });
}

  private startPolling(id: number): void {
    this.pollingAttempts = 0;
    this.pollingInterval = setInterval(() => {
      this.pollingAttempts++;
      if (this.pollingAttempts > this.maxPollingAttempts) {
        this.stopPolling();
        this.errorMessage.set('Job is taking too long to complete. You can close this dialog; the job will continue in the background.');
        this.status.set('idle');
        return;
      }

      this.orgService.getEmployeeJobStatus(id).subscribe({
        next: (statusResponse) => {
          const isFinished = ['COMPLETED', 'FAILED', 'STOPPED', 'ABANDONED'].includes(statusResponse.status);
          if (isFinished) {
            this.stopPolling();
            this.uploadResult.set(statusResponse);
            this.status.set('result');
          }
        },
        error: () => {
          this.stopPolling();
          this.errorMessage.set('Error checking job status.');
          this.status.set('idle');
        },
      });
    }, 3000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  close(shouldRefresh: boolean | undefined): void {
    // We default to false if the value is undefined for safety
    this.closed.emit(shouldRefresh ?? false);
  }

  uploadAnother(): void {
    this.status.set('idle');
    this.selectedFile.set(null);
    this.jobExecutionId.set(null);
    this.uploadResult.set(null);
    this.errorMessage.set(null);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}