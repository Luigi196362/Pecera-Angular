import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AquariumDataService } from '../service/aquarium-data.service';


class pecera {
  id: number = 0;
  nombre: string = '';
  descripcion: string = '';
  temperatura: number = 0;
  nivelAgua: number = 0;
  calidadAgua: number = 0;
  movimiento: number = 0;
  electricidad: number = 0;
  estadoBomba: string = '';
}

@Component({
  imports: [CommonModule],
  selector: 'app-aquarium',
  templateUrl: './aquarium.component.html',
  styleUrls: ['./aquarium.component.css']
})
export class AquariumComponent implements OnInit {
  PeceraData: pecera = new pecera();

  constructor(private router: Router, private aquariumDataService: AquariumDataService) {
  }

  // mensajeRecibido = '';

  enviarMensaje(categoria: string, tipo: string, id: number, mensaje: string) {
    this.aquariumDataService.enviarMensaje(this.PeceraData.id, categoria, tipo, id, mensaje);
  }

  ngOnInit(): void {

    // setInterval(() => {
    //   const randomNumber = Math.floor(Math.random() * 100); // Genera un número random entre 0 y 99
    //   this.enviarMensaje('temperatura', 'sensor', 1, randomNumber.toString());
    //   this.enviarMensaje('nivelAgua', 'sensor', 1, (randomNumber + 10).toString());
    //   this.enviarMensaje('calidadAgua', 'sensor', 1, (randomNumber + 20).toString());
    //   this.enviarMensaje('movimiento', 'sensor', 1, (randomNumber + 30).toString());
    //   this.enviarMensaje('electricidad', 'sensor', 1, (randomNumber + 40).toString());
    // }, 1000); // cada 10 segundos (10,000 ms)

    this.PeceraData = window.history.state.item;
    console.log(this.PeceraData);

    //Suscribirse a los temas de la pecera
    this.aquariumDataService.subscribeToTopics(this.PeceraData.id);

    // Suscribirse a los mensajes
    this.aquariumDataService.obtenerMensajes().subscribe(({ topic, mensaje }) => {
      // console.log(`💬 Mensaje en ${topic}: ${mensaje}`);
      // this.mensajeRecibido = `💬 Mensaje en ${topic}: ${mensaje}`;

      if (topic === 'PC/pecera' + this.PeceraData.id + '/temperatura/sensor/1') {
        this.PeceraData.temperatura = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.temperatura);
      }
      if (topic === 'PC/pecera' + this.PeceraData.id + '/nivelAgua/sensor/1') {
        this.PeceraData.nivelAgua = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.nivelAgua);
      }
      if (topic === 'PC/pecera' + this.PeceraData.id + '/calidadAgua/sensor/1') {
        this.PeceraData.calidadAgua = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.calidadAgua);
      }
      if (topic === 'PC/pecera' + this.PeceraData.id + '/movimiento/sensor/1') {
        this.PeceraData.movimiento = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.movimiento);
      }
      if (topic === 'PC/pecera' + this.PeceraData.id + '/electricidad/sensor/1') {
        this.PeceraData.electricidad = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.electricidad);
      }
      if (topic === 'PC/pecera' + this.PeceraData.id + '/calidadAgua/activador/1') {
        this.PeceraData.estadoBomba = mensaje;
        console.log('Estado:', this.PeceraData.estadoBomba);
      }
    });
  }


}