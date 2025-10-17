import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ConsejosRoutingModule } from './consejos-routing-module';
import { ConsejosPage } from './view/consejos-page';
import { ConsejoDetailPage } from './view/consejo-detail-page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ConsejosRoutingModule,
    ConsejosPage,
    ConsejoDetailPage,
  ],
})
export class ConsejosModule {}
