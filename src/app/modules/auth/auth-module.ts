import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { LoginPage } from './view/login-page';
import { RegisterPage } from './view/register-page';
import { WelcomePage } from './view/welcome-page';
import { AuthRoutingModule } from './auth-routing-module';

@NgModule({
  declarations: [LoginPage, RegisterPage, WelcomePage],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    AuthRoutingModule
]
})
export class AuthModule{ }
