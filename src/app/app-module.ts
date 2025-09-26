import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    CommonModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
