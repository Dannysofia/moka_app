import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

/**Rutas por modulos */

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  {
    path: 'inicio',
    canMatch: [AuthGuard],
    loadChildren: () => import('./modules/inicio/inicio-module').then((m) => m.InicioModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'cultivos',
    canMatch: [AuthGuard],
    loadChildren: () => import('./modules/cultivos/cultivos-module').then((m) => m.CultivosModule),
  },
  {
    path: 'inventario',
    canMatch: [AuthGuard],
    loadChildren: () =>
      import('./modules/inventario/inventario-module').then((m) => m.InventarioModule),
  },
  {
    path: 'personal',
    canMatch: [AuthGuard],
    loadChildren: () => import('./modules/personal/personal.module').then((m) => m.PersonalModule),
  },
  {
    path: 'cooperativas',
    canMatch: [AuthGuard],
    loadChildren: () =>
      import('./modules/cooperativas/cooperativas.module').then((m) => m.CooperativasModule),
  },
  {
    path: 'consejos',
    canMatch: [AuthGuard],
    loadChildren: () => import('./modules/consejos/consejos-module').then((m) => m.ConsejosModule),
  },
  {
    path: 'finanzas',
    canMatch: [AuthGuard],
    loadChildren: () => import('./modules/finanzas/finanzas-module').then((m) => m.FinanzasModule),
  },
  {
    path: 'perfil',
    canMatch: [AuthGuard],
    loadChildren: () => import('./modules/perfil/perfil-module').then((m) => m.PerfilModule),
  },

  { path: '**', redirectTo: 'auth' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
