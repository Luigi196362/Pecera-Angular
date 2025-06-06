import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AquariumComponent } from './aquarium/aquarium.component';
import { LoginComponent } from './login/login.component';
import { AddAquariumComponent } from './add-aquarium/add-aquarium.component';
import { InfoAquariumComponent } from './info-aquarium/info-aquarium.component';

export const routes: Routes = [
    //{ path: '', component: LoginComponent },
    { path: '', component: AdminComponent },
    { path: 'aquarium', component: AquariumComponent, },
    { path: 'add-aquarium', component: AddAquariumComponent },
    { path: 'sensor-info', component: InfoAquariumComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }