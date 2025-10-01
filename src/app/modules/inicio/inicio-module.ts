import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { InicioPage } from './view/inicio-page';
import { InicioRoutingModule } from './inicio-routing-module';

@NgModule({
  declarations: [InicioPage],
  imports: [
    CommonModule,
    IonicModule,
    InicioRoutingModule
  ]
})
export class InicioModule {}