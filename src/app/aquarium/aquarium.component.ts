import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList
} from '@angular/core';

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
class Pecera {
  id: number = 0;
  nombre: string = '';
  descripcion: string = '';
  estadoBomba: string = '';
  estadoResistencia: string = '';
  tamanio: string = '';
  // Add other properties as needed
}

import { AquariumDataService } from '../service/aquarium-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend);

interface SensorConfig {
  temperatura: number;
  flujoAgua: number;
  movimiento: number;
  calidadAgua: number;
  nivelAgua: number;
  nivelOxigeno: number;

}

const SENSOR_CONFIGS: SensorConfig[] = [
  { temperatura: 1, flujoAgua: 1, movimiento: 1, calidadAgua: 1, nivelAgua: 1, nivelOxigeno: 1 },
  { temperatura: 4, flujoAgua: 2, movimiento: 2, calidadAgua: 4, nivelAgua: 2, nivelOxigeno: 2 },
  { temperatura: 8, flujoAgua: 4, movimiento: 4, calidadAgua: 8, nivelAgua: 4, nivelOxigeno: 3 }
];

@Component({
  selector: 'app-aquarium-m',
  templateUrl: './aquarium.component.html',
  imports: [CommonModule],
  styleUrls: ['./aquarium.component.css']
})
export class AquariumComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('canvasTemperatura') canvasTemperatura!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('canvasFlujoAgua') canvasFlujoAgua!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('canvasCalidadAgua') canvasCalidadAgua!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('canvasNivelAgua') canvasNivelAgua!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('canvasNivelOxigeno') canvasNivelOxigeno!: QueryList<ElementRef<HTMLCanvasElement>>;
  valoresSensores: { [clave: string]: number[] } = {
    temperatura: [],
    flujoAgua: [],
    calidadAgua: [],
    nivelAgua: [],
    nivelOxigeno: []
  };

  chartTemps: Chart[] = [];
  chartFlujos: Chart[] = [];
  chartCalidades: Chart[] = [];
  chartNiveles: Chart[] = [];
  chartOxigenos: Chart[] = [];


  PeceraData: Pecera = new Pecera();
  sensorConfig!: SensorConfig;
  private mensajeSub!: Subscription;

  constructor(
    private router: Router,
    private aquariumDataService: AquariumDataService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.PeceraData = window.history.state.item;
    if (!this.PeceraData) {
      this.router.navigate(['/']);
      return;
    }
    const tamanio = this.PeceraData.tamanio;
    // Selección de configuración según ID de ventana previa
    const configIndex = tamanio === 's' ? 0 : tamanio === 'm' ? 1 : tamanio === 'l' ? 2 : 0;
    this.sensorConfig = SENSOR_CONFIGS[configIndex] || SENSOR_CONFIGS[0];
    Object.keys(this.valoresSensores).forEach((tipo: string) => {
      const cantidad = (this.sensorConfig as any)[tipo] || 0;
      this.valoresSensores[tipo] = new Array(cantidad).fill(0);
    });

    // Suscribirse a MQTT con base en la pecera
    const peceraId = this.PeceraData.id;
    if (peceraId != null) {
      this.aquariumDataService.subscribeToTopics(peceraId);
      this.mensajeSub = this.aquariumDataService.obtenerMensajes().subscribe(({ topic, mensaje }) => {
        this.procesarMensaje(topic, mensaje);
      });
    }
  }

  ngAfterViewInit(): void {
    // Crear gráficos dinámicos
    this.canvasTemperatura.forEach((canv, i) => {
      this.chartTemps[i] = this.crearGrafico(canv.nativeElement, `Temperatura ${i + 1} (°C)`, 'rgb(255, 166, 0)');
    });
    this.canvasFlujoAgua.forEach((canv, i) => {
      this.chartFlujos[i] = this.crearGrafico(canv.nativeElement, `Flujo Agua ${i + 1} (L/min)`, 'rgb(255, 38, 0)');
    });
    this.canvasCalidadAgua.forEach((canv, i) => {
      this.chartCalidades[i] = this.crearGrafico(canv.nativeElement, `Calidad Agua ${i + 1}`, 'rgb(40, 167, 69)');
    });
    this.canvasNivelAgua.forEach((canv, i) => {
      this.chartNiveles[i] = this.crearGrafico(canv.nativeElement, `Nivel Agua ${i + 1} (%)`, 'rgb(0, 123, 255)');
    });
    this.canvasNivelOxigeno.forEach((canv, i) => {
      this.chartOxigenos[i] = this.crearGrafico(canv.nativeElement, `Nivel Oxígeno ${i + 1}`, 'rgb(174, 0, 255)');
    });
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.mensajeSub) this.mensajeSub.unsubscribe();
    this.aquariumDataService.desuscribirseDeTodosLosTopics();
  }

  private procesarMensaje(topic: string, mensaje: string) {
    const parts = topic.split('/');
    const categoria = parts[3];
    const sensorId = parseInt(parts[5], 10) - 1;
    const valor = parseFloat(mensaje);

    if (this.valoresSensores[categoria] && this.valoresSensores[categoria][sensorId] !== undefined) {
      this.valoresSensores[categoria][sensorId] = valor;
    }

    switch (categoria) {
      case 'temperatura':
        if (this.chartTemps[sensorId]) this.actualizarGrafico(this.chartTemps[sensorId], valor);
        break;
      case 'flujoAgua':
        if (this.chartFlujos[sensorId]) this.actualizarGrafico(this.chartFlujos[sensorId], valor);
        break;
      case 'calidadAgua':
        if (this.chartCalidades[sensorId]) this.actualizarGrafico(this.chartCalidades[sensorId], valor);
        break;
      case 'nivelAgua':
        if (this.chartNiveles[sensorId]) this.actualizarGrafico(this.chartNiveles[sensorId], valor);
        break;
      case 'nivelOxigeno':
        if (this.chartOxigenos[sensorId]) this.actualizarGrafico(this.chartOxigenos[sensorId], valor);
        break;
      default:
        break;
    }
  }



  enviarMensajeSensor(categoria: string, id: number, mensaje: string) {
    this.aquariumDataService.enviarMensajeSensor(window.history.state.item.id, categoria, id, mensaje);
  }

  enviarMensajeActuador(categoria: string, id: number, estado: string) {
    const nuevoEstado = estado === 'true' ? 'false' : 'true';
    this.aquariumDataService.enviarMensajeActuador(window.history.state.item.id, categoria, id, nuevoEstado);
  }

  private crearGrafico(canvas: HTMLCanvasElement, label: string, color: string): Chart {
    return new Chart(canvas.getContext('2d')!, {
      type: 'line',
      data: { labels: [], datasets: [{ label, data: [], backgroundColor: color, borderColor: color, borderWidth: 2, fill: false, tension: 0.1 }] },
      options: { animation: { duration: 0 }, scales: { x: { ticks: { autoSkip: true, maxTicksLimit: 10 } }, y: { beginAtZero: true } }, responsive: true }
    });
  }

  private actualizarGrafico(grafico: Chart, valor: number) {
    const tiempo = new Date().toLocaleTimeString();
    const data = grafico.data;
    data.labels!.push(tiempo);
    data.datasets[0].data.push(valor);
    if (data.labels!.length > 10) {
      data.labels!.shift();
      data.datasets[0].data.shift();
    }
    grafico.update('none');
  }
}
