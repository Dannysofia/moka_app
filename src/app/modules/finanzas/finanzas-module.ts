import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

// Importa el routing del módulo
import { FinanzasRoutingModule } from './finanzas-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinanzasRoutingModule
  ]
})
export class FinanzasModule { }