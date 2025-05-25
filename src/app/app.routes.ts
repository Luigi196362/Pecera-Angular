import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AquariumComponent } from './aquarium/aquarium.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    //{ path: '', component: LoginComponent },
    { path: '', component: AdminComponent },
    { path: 'aquarium', component: AquariumComponent, },


];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }