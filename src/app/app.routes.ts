import { Routes } from '@angular/router';
import { Board } from './components/board/board';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { Mytasks } from './components/mytasks/mytasks';
import { ResetPassword } from './components/auth/reset-password/reset-password';

export const routes: Routes = [
    {path: "", redirectTo: "login", pathMatch: "full"},
    {path: "login", component: Login},
    {path: "register", component: Register},
    {path: "dashboard", component: Dashboard, canActivate: [authGuard]},
    {path: "board/:id", component: Board, canActivate: [authGuard]},
    {path: "tasks/:username", component: Mytasks, canActivate: [authGuard]},
    { path: 'reset-password', component: ResetPassword }
];
