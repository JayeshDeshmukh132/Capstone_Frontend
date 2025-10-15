// src/app/features/employee/pages/salary-slip-detail/salary-slip-detail.component.ts
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';

import { SalarySlipDetail } from '../../../../core/model/model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-salary-slip-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './salary-slip-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SalarySlipDetailComponent {
  slipId = input<string>(); // Optional to prevent init errors

  private readonly employeeService = inject(EmployeeService);
  private readonly location = inject(Location);
  private route = inject(ActivatedRoute);

  readonly state = signal<{ slip: SalarySlipDetail | null; status: 'loading' | 'loaded' | 'error'; error: string | null; }>({ slip: null, status: 'loading', error: null });

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('slipId');
      if (id) {
        this.fetchSlip(id);
      }
    });
  }

  fetchSlip(id: string): void {
    this.state.set({ slip: null, status: 'loading', error: null });
    this.employeeService.getSalarySlipDetail(Number(id)).subscribe({
      next: (slip) => this.state.set({ slip, status: 'loaded', error: null }),
      error: () => this.state.set({ slip: null, status: 'error', error: 'Failed to load salary slip.' }),
    });
  }

  downloadSlip(): void {
  const id = this.route.snapshot.paramMap.get('slipId');
  const slip = this.state().slip;

  if (!id || !slip) {
    return;
  }

  this.employeeService.downloadSalarySlip(Number(id)).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SalarySlip_${slip.month}-${slip.year}.pdf`;
      document.body.appendChild(a); // Append to the DOM for better browser compatibility
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a); // Clean up
    },
    error: (err) => {
      console.error('Download API call failed:', err);
    }
  });
}
  
  goBack(): void {
    this.location.back();
  }
}