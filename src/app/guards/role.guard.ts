import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Verificar si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Obtener los roles requeridos desde la configuración de la ruta
    const requiredRoles = route.data['roles'] as Array<string>;

    if (!requiredRoles) {
      // Si no se especifican roles, permitir acceso a usuarios logueados
      return true;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const userRole = this.authService.getRole();
    const hasRequiredRole = requiredRoles.some(role => userRole === role);

    if (!hasRequiredRole) {
      // Si no tiene el rol requerido, redirigir al dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
