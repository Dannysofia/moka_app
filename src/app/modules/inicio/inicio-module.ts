import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { InicioPage } from './view/inicio-page';
import { InicioRoutingModule } from './inicio-routing-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InicioRoutingModule,
    InicioPage
  ]
})
export class InicioModule {}

