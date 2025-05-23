import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AquariumComponent } from './aquarium/aquarium.component';
import { LoginComponent } from './login/login.component';
import { AquariumSComponent } from './aquarium-s/aquarium-s.component';
import { AquariumMComponent } from './aquarium-m/aquarium-m.component';
import { AquariumLComponent } from './aquarium-l/aquarium-l.component';

export const routes: Routes = [
    //{ path: '', component: LoginComponent },
    { path: '', component: AdminComponent },
    { path: 'aquarium', component: AquariumComponent, },
    { path: 'aquarium-s', component: AquariumSComponent, },
    { path: 'aquarium-m', component: AquariumMComponent, },
    { path: 'aquarium-l', component: AquariumLComponent, },



];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }