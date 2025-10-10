import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CultivosRoutingModule } from './cultivos-routing-module';
import { CultivosListPage } from './view/cultivos-list-page';
import { CultivoFormPage } from './view/cultivo-form-page';
import { TareasListPage } from './view/tareas-list-page';
import { TareaFormPage } from './view/tarea-form-page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CultivosRoutingModule,
    CultivosListPage,
    CultivoFormPage,
    TareasListPage,
    TareaFormPage,
  ]
})
export class CultivosModule {}
