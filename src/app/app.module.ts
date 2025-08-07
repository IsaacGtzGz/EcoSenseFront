import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ← ¡IMPORTANTE!
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsuariosListComponent } from './pages/usuarios-list/usuarios-list.component';
import { UsuarioFormComponent } from './pages/admin/usuario-form/usuario-form.component';
import { DispositivosListComponent } from './pages/admin/dispositivos-list/dispositivos-list.component';
import { DispositivoFormComponent } from './pages/admin/dispositivo-form/dispositivo-form.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { UmbralesConfigComponent } from './pages/admin/umbrales-config/umbrales-config.component';
import { PerfilSaludComponent } from './pages/perfil-salud/perfil-salud.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    UsuariosListComponent,
    UsuarioFormComponent,
    DispositivosListComponent,
    DispositivoFormComponent,
    HeaderComponent,
    FooterComponent,
    UmbralesConfigComponent,
    PerfilSaludComponent,
    ReportesComponent,
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
