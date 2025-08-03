import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsuariosListComponent } from './pages/usuarios-list/usuarios-list.component';
import { UsuarioFormComponent } from './pages/admin/usuario-form/usuario-form.component';
import { DispositivosListComponent } from './pages/admin/dispositivos-list/dispositivos-list.component';
import { DispositivoFormComponent } from './pages/admin/dispositivo-form/dispositivo-form.component';
import { UmbralesConfigComponent } from './pages/admin/umbrales-config/umbrales-config.component';
import { PerfilSaludComponent } from './pages/perfil-salud/perfil-salud.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  // Rutas de administración (solo para administradores)
  {
    path: 'admin/usuarios',
    component: UsuariosListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/usuarios/nuevo',
    component: UsuarioFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/usuarios/editar/:id',
    component: UsuarioFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },

  // Rutas de dispositivos (solo para administradores)
  {
    path: 'admin/dispositivos',
    component: DispositivosListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/dispositivos/nuevo',
    component: DispositivoFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/dispositivos/editar/:id',
    component: DispositivoFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },

  // Configuración de umbrales (solo para administradores)
  {
    path: 'admin/umbrales',
    component: UmbralesConfigComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },

  // Perfil de salud (para usuarios logueados)
  {
    path: 'perfil-salud',
    component: PerfilSaludComponent,
    canActivate: [AuthGuard]
  },

  // Configurar salud de usuario específico (solo para administradores)
  {
    path: 'admin/usuarios/:id/configurar-salud',
    component: PerfilSaludComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
