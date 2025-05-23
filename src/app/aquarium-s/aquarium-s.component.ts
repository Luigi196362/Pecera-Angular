import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,

} from 'chart.js';
import { AquariumDataService } from '../service/aquarium-data.service';
import { Router } from '@angular/router';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend,);

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
  estadoResistencia: string = '';
}

@Component({
  selector: 'app-aquarium-s',
  imports: [],
  templateUrl: './aquarium-s.component.html',
  styleUrl: './aquarium-s.component.css'
})
export class AquariumSComponent implements OnInit {

  PeceraData: pecera = new pecera();


  @ViewChild('canvasTemp', { static: true }) canvasTemp!: ElementRef<HTMLCanvasElement>;
  chartTemp!: Chart;
  @ViewChild('canvasNivelAgua', { static: true }) canvasNivelAgua!: ElementRef<HTMLCanvasElement>;
  chartNivelAgua!: any;
  @ViewChild('canvasCalidadAgua', { static: true }) canvasCalidadAgua!: ElementRef<HTMLCanvasElement>;
  chartCalidadAgua!: any;

  constructor(private router: Router, private aquariumDataService: AquariumDataService, private cdr: ChangeDetectorRef
  ) {
  }

  mensajeRecibido = '';


  ngOnInit(): void {
    this.chartTemp = this.crearGrafico(this.canvasTemp.nativeElement, 'Temperatura (°C)', 'rgb(255, 166, 0)');
    this.chartNivelAgua = this.crearGrafico(this.canvasNivelAgua.nativeElement, 'Nivel de Agua (%)', 'rgb(0, 123, 255)');
    this.chartCalidadAgua = this.crearGrafico(this.canvasCalidadAgua.nativeElement, 'Calidad de Agua', 'rgb(40, 167, 69)');

    this.PeceraData = window.history.state.item;
    // console.log(this.PeceraData);

    //Suscribirse a los temas de la pecera
    this.aquariumDataService.subscribeToTopics(this.PeceraData.id);

    // Suscribirse a los mensajes
    this.aquariumDataService.obtenerMensajes().subscribe(({ topic, mensaje }) => {

      console.log(`💬 Mensaje en ${topic}: ${mensaje}`);
      this.mensajeRecibido = `💬 Mensaje en ${topic}: ${mensaje}`;

      if (topic === 'PC/pecera/' + this.PeceraData.id + '/temperatura/sensor/1') {
        this.PeceraData.temperatura = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.temperatura);
        this.actualizarGrafico(this.chartTemp, this.PeceraData.temperatura);
      }
      if (topic === 'PC/pecera/' + this.PeceraData.id + '/nivelAgua/sensor/1') {
        this.PeceraData.nivelAgua = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.nivelAgua);
        this.actualizarGrafico(this.chartNivelAgua, this.PeceraData.nivelAgua);
      }
      if (topic === 'PC/pecera/' + this.PeceraData.id + '/calidadAgua/sensor/1') {
        this.PeceraData.calidadAgua = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.calidadAgua);
        this.actualizarGrafico(this.chartCalidadAgua, this.PeceraData.calidadAgua);
      }
      if (topic === 'PC/pecera/' + this.PeceraData.id + '/movimiento/sensor/1') {
        this.PeceraData.movimiento = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.movimiento);
      }
      if (topic === 'PC/pecera/' + this.PeceraData.id + '/electricidad/sensor/1') {
        this.PeceraData.electricidad = parseFloat(mensaje);
        console.log('Temperatura recibida:', this.PeceraData.electricidad);
      }
      if (topic === 'PC/pecera/' + this.PeceraData.id + '/calidadAgua/actuador/1') {
        this.PeceraData.estadoBomba = mensaje;
        console.log('Estado:', this.PeceraData.estadoBomba);
      }
      if (topic === 'PC/pecera/' + this.PeceraData.id + '/Temperatura/actuador/1') {
        this.PeceraData.estadoResistencia = mensaje;
        console.log('Estado:', this.PeceraData.estadoResistencia);
      }
    });
  }


  enviarMensajeSensor(categoria: string, id: number, mensaje: string) {
    this.aquariumDataService.enviarMensajeSensor(this.PeceraData.id, categoria, id, mensaje);
  }

  enviarMensajeActuador(categoria: string, id: number, estado: string) {
    if (estado === 'true') {
      this.aquariumDataService.enviarMensajeActuador(this.PeceraData.id, categoria, id, 'false');
    } else {
      this.aquariumDataService.enviarMensajeActuador(this.PeceraData.id, categoria, id, 'true');
    }
  }

  crearGrafico(canvas: HTMLCanvasElement, label: string, color: string): Chart {
    return new Chart(canvas.getContext('2d')!, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: label,
          data: [],
          backgroundColor: color,
          borderColor: color,
          borderWidth: 2,
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        animation: {
          duration: 0,
          easing: 'easeOutQuad',
        },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            }
          },
          y: {

            beginAtZero: true,
          }
        },
        responsive: true,

      }
    });
  }
  actualizarGrafico(grafico: Chart, valor: number) {
    const tiempo = new Date().toLocaleTimeString();
    const data = grafico.data;

    data.labels!.push(tiempo);
    data.datasets[0].data.push(valor);

    if (data.labels!.length > 10) {
      grafico.update(); // Animar primero
      data.labels!.shift();
      data.datasets[0].data.shift();
    }

    grafico.update('none'); // Finaliza sin animación extra
  }

}