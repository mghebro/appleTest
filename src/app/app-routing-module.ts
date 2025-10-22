import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppleSigninComponent } from './components/apple-signin/apple-signin';

const routes: Routes = [
  { path: "auth/apple/callback",  component: AppleSigninComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
