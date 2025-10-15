import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
// Import our renamed and modified uploader component
import { EmployeeCsvUploaderComponent } from '../../components/employee-csv-uploader/employee-csv-uploader';

@Component({
  selector: 'app-upload-employees-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmployeeCsvUploaderComponent], // Import the uploader
  templateUrl: './upload-employees-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadEmployeesPageComponent {
  private router = inject(Router);

  handleUploadCompletion(wasSuccessful: boolean): void {
    // The 'wasSuccessful' flag could be used to show a toast message here if desired
    this.router.navigate(['/org/employees']);
  }
}