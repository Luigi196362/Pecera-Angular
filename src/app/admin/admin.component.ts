import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AcuarioService } from '../service/acuario.service';  // Asegúrate que la ruta sea correcta


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
    private acuarioService: AcuarioService
  ) { }

  ngOnInit(): void {
    this.acuarioService.getPeceras().subscribe((data: any) => {
      this.items = data.map((pecera: any, index: number) => ({
        id: pecera.id,
        nombre: pecera.nombre,
        descripcion: pecera.descripcion,
        tamanio: pecera.tamanio,
      }));
    });
  }

  onCardClick(item: any) {
    if (item.tamanio === 's') {
      this.router.navigate(['/aquarium-s'], { state: { item } });
    } else if (item.tamanio === 'm') {
      this.router.navigate(['/aquarium-m'], { state: { item } });
    } else if (item.tamanio === 'l') {
      this.router.navigate(['/aquarium-l'], { state: { item } });
    }
  }
}
