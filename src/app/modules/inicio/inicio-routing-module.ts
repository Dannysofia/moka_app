import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth-guard';
import { InicioPage } from './view/inicio-page';

const routes: Routes = [
  { path: '', component: InicioPage, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InicioRoutingModule {}
