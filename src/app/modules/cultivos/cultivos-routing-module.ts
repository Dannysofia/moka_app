import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth-guard';
import { CultivosListPage } from './view/cultivos-list-page';
import { CultivoFormPage } from './view/cultivo-form-page';
import { TareasListPage } from './view/tareas-list-page';
import { TareaFormPage } from './view/tarea-form-page';

const routes: Routes = [
  { path: '', component: CultivosListPage, canActivate: [AuthGuard] },
  { path: 'nuevo', component: CultivoFormPage, canActivate: [AuthGuard] },
  { path: ':id/editar', component: CultivoFormPage, canActivate: [AuthGuard] },
  { path: ':id/tareas', component: TareasListPage, canActivate: [AuthGuard] },
  { path: ':id/tareas/nueva', component: TareaFormPage, canActivate: [AuthGuard] },
  { path: ':id/tareas/:tareaId/editar', component: TareaFormPage, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CultivosRoutingModule {}

