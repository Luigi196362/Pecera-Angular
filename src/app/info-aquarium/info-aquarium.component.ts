import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AquariumDataService } from '../service/aquarium-data.service';
import { AcuarioService } from '../service/acuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-info-aquarium',
  imports: [CommonModule],
  templateUrl: './info-aquarium.component.html',
  styleUrl: './info-aquarium.component.css'
})
export class InfoAquariumComponent implements OnInit {
  // Aquí puedes definir las propiedades y métodos necesarios para tu componente
  idPecera = 0;
  constructor(private aquariumService: AcuarioService, private router: Router) { }

  ngOnInit(): void {
    this.idPecera = window.history.state.item
    if (!this.idPecera) {
      console.error('❌ ID de pecera no encontrado en el estado de la historia. Redirigiendo a la página principal.');
      this.router.navigate(['/']);
      return;
    }
    this.aquariumService.getPeceraById(this.idPecera).subscribe(data => {
      this.peceraData = data;
    });
  }

  peceraData: any = {
    // Asegúrate de copiar aquí el JSON que proporcionaste
    // O bien, obténlo desde una API y asígnalo dinámicamente
  };

  tiposSensores: string[] = [
    'registros_temperatura',
    'registros_calidad',
    'registros_movimiento',
    'registros_nivelagua',
    'registros_flujo',
    'registros_oxigeno'
  ];
}
