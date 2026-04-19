import { Component, signal } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-reset-password',
  imports: [],
  templateUrl: './reset-password.html',
  styles: ``,
})
export class ResetPassword {
  password1 = '';
  password2 = '';
  token = '';
  message = signal('');
  error = signal('');

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.router.navigate(['/login']);
  }

  reset() {
    if (this.password1 !== this.password2) { this.error.set("Passwords don't match"); return; }
    if (this.password1.length < 6) { this.error.set("Password must be at least 6 characters"); return; }

    this.api.resetPassword(this.token, this.password1).subscribe({
      next: () => {
        this.message.set("Password reset! Redirecting...");
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => this.error.set("Invalid or expired token")
    });
  }
}
