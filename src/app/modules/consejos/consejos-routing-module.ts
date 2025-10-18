import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth-guard';
import { ConsejosPage } from './view/consejos-page';
import { ConsejoDetailPage } from './view/consejo-detail-page';

const routes: Routes = [
  { path: '', component: ConsejosPage, canActivate: [AuthGuard] },
  { path: ':id', component: ConsejoDetailPage, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsejosRoutingModule {}
