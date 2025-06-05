import { Component } from '@angular/core';
import { AcuarioService } from '../service/acuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Asegúrate de importar esto

@Component({
  selector: 'app-add-aquarium',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-aquarium.component.html',
  styleUrl: './add-aquarium.component.css'
})
export class AddAquariumComponent {
  nuevaPecera = {
    nombre: '',
    descripcion: '',
    tamano: ''
  };

  constructor(private servicio: AcuarioService) { } // Asegúrate de inyectar el servicio correcto


  crearPecera() {
    const { nombre, descripcion, tamano } = this.nuevaPecera;

    if (!nombre || !descripcion || !tamano) return;

    this.servicio.postPecera(nombre, descripcion, tamano).subscribe({
      next: (res) => {
        console.log('Pecera creada:', res);
        // Recarga o actualiza la lista si es necesario
      },
      error: (err) => {
        console.error('Error al crear pecera:', err);
      }
    });

    this.nuevaPecera = { nombre: '', descripcion: '', tamano: '' };
  }

}
