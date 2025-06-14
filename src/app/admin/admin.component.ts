import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AcuarioService } from '../service/acuario.service';  // Asegúrate que la ruta sea correcta
import { AquariumDataService } from '../service/aquarium-data.service';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  items: any[] = [];

  constructor(
    private router: Router,
    private acuarioService: AcuarioService,
    private aquariumDataService: AquariumDataService,
  ) { }

  ngOnInit(): void {
    this.acuarioService.getPeceras().subscribe((data: any) => {
      this.items = data.map((pecera: any, index: number) => ({
        id: pecera.id,
        nombre: pecera.nombre,
        descripcion: pecera.descripcion,
        tamano: pecera.tamano,
      }));
    });
  }

  onCardClick(item: any) {
    this.router.navigate(['/aquarium'], { state: { item } });
  }

  onAddAquarium() {
    this.router.navigate(['/add-aquarium']);
  }
}
