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
import { ReportesComponent } from './pages/reportes/reportes.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { LandingComponent } from './pages/landing/landing.component';
import { RegisterComponent } from './pages/register/register.component';
import { AcercaDeComponent } from './pages/acerca-de/acerca-de.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { FaqPublicoComponent } from './pages/faq/faq-publico.component';
import { ComentariosAdminComponent } from './pages/admin/comentarios-admin/comentarios-admin.component';
import { ContactoMensajesComponent } from './pages/admin/contacto-mensajes/contacto-mensajes.component';
import { PerfilClienteComponent } from './pages/perfil-cliente/perfil-cliente.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'acerca-de', component: AcercaDeComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'producto', loadComponent: () => import('./pages/producto/producto.component').then(m => m.ProductoComponent) },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin/comentarios',
    component: ComentariosAdminComponent,
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  // Reportes (accesible para usuarios autenticados)
  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [AuthGuard]
  },

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
  { path: 'faq', component: FaqPublicoComponent },
  {
    path: 'cotizar',
    loadComponent: () => import('./pages/cotizar/cotizar.component').then(m => m.CotizarComponent)
  },
    {
      path: 'admin/contacto-mensajes',
      loadComponent: () => import('./pages/admin/contacto-mensajes/contacto-mensajes.component').then(m => m.ContactoMensajesComponent),
      canActivate: [RoleGuard], // Solo admin
    },
  {
    path: 'perfil',
    component: PerfilClienteComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
