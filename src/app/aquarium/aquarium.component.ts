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
    nivelOxigeno: [],
    movimiento: []
  };
  nombreSensores: { [key: string]: string } = {
    temperatura: 'Temperatura',
    flujoAgua: 'Flujo de Agua',
    calidadAgua: 'Calidad del Agua',
    nivelAgua: 'Nivel del Agua',
    nivelOxigeno: 'Nivel de Oxígeno',
    movimiento: 'Movimiento'
  };
  nombreActuadores: { [key: string]: string } = {
    calidadAgua: 'Purificador de Agua',
    temperatura: 'Resistencia Calefactora'
  };


  valoresActuadores: { [clave: string]: boolean[] } = {};

  chartTemps: Chart[] = [];
  chartFlujos: Chart[] = [];
  chartCalidades: Chart[] = [];
  chartNiveles: Chart[] = [];
  chartOxigenos: Chart[] = [];

  PeceraData: Pecera = new Pecera();
  sensorConfig!: SensorConfig;
  private mensajeSub!: Subscription;

  // Categorías de actuadores a generar
  actuadorTipos = ['calidadAgua', 'temperatura'];

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
    const idx = tamanio === 's' ? 0 : tamanio === 'm' ? 1 : 2;
    this.sensorConfig = SENSOR_CONFIGS[idx];

    Object.keys(this.valoresSensores).forEach(tipo => {
      const cnt = (this.sensorConfig as any)[tipo] || 0;
      this.valoresSensores[tipo] = Array(cnt).fill(0);
    });

    this.actuadorTipos.forEach(tipo => {
      const cnt = (this.sensorConfig as any)[tipo] || 0;
      this.valoresActuadores[tipo] = Array(cnt).fill(false);
    });

    const id = this.PeceraData.id;
    this.aquariumDataService.subscribeToTopics(id);
    this.mensajeSub = this.aquariumDataService.obtenerMensajes().subscribe(({ topic, mensaje }) => {
      this.procesarMensaje(topic, mensaje);
    });
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
    console.log('Destroy');
    const id = this.PeceraData.id;
    this.aquariumDataService.desuscribirseDeTodosLosTopics(id);
    this.mensajeSub.unsubscribe();

  }

  private procesarMensaje(topic: string, mensaje: string): void {
    const parts = topic.split('/');
    const categoria = parts[3];
    const tipo = parts[4];
    const id = parseInt(parts[5], 10) - 1;
    const valor = tipo === 'actuador' ? (mensaje === 'true') : parseFloat(mensaje);
    console.log(`📩 Mensaje recibido desde el topic: ${topic}`);

    if (tipo === 'sensor') {
      if (this.valoresSensores[categoria]?.[id] !== undefined) {
        this.valoresSensores[categoria][id] = valor as number;
      }
      switch (categoria) {
        case 'temperatura':
          if (this.chartTemps[id]) this.actualizarGrafico(this.chartTemps[id], valor as number);
          break;
        case 'flujoAgua':
          if (this.chartFlujos[id]) this.actualizarGrafico(this.chartFlujos[id], valor as number);
          break;
        case 'calidadAgua':
          if (this.chartCalidades[id]) this.actualizarGrafico(this.chartCalidades[id], valor as number);
          break;
        case 'nivelAgua':
          if (this.chartNiveles[id]) this.actualizarGrafico(this.chartNiveles[id], valor as number);
          break;
        case 'nivelOxigeno':
          if (this.chartOxigenos[id]) this.actualizarGrafico(this.chartOxigenos[id], valor as number);
          break;
      }
    } else if (tipo === 'actuador') {
      if (this.valoresActuadores[categoria]?.[id] !== undefined) {
        this.valoresActuadores[categoria][id] = valor as boolean;
      }
    }
  }


  enviarMensajeActuador(categoria: string, id: number, estado: string) {
    const nuevoEstado = estado === 'true' ? 'false' : 'true';
    this.valoresActuadores[categoria][id - 1] = nuevoEstado === 'true';
    this.aquariumDataService.enviarMensajeActuador(this.PeceraData.id, categoria, id, nuevoEstado);
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
