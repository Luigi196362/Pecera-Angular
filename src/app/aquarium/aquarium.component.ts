// aquarium.component.ts
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild
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
  ChartDataset
} from 'chart.js';

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

interface ActuadorConfig {
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

const ACTUADOR_CONFIG: ActuadorConfig[] = [
  { temperatura: 1, flujoAgua: 1, movimiento: 1, calidadAgua: 1, nivelAgua: 1, nivelOxigeno: 1 },
  { temperatura: 2, flujoAgua: 2, movimiento: 2, calidadAgua: 2, nivelAgua: 2, nivelOxigeno: 2 },
  { temperatura: 3, flujoAgua: 3, movimiento: 3, calidadAgua: 3, nivelAgua: 3, nivelOxigeno: 3 }
];
// Paleta fija para identificar sensores
const PALETTE: string[] = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(83, 255, 76, 1)',
  'rgba(83, 102, 255, 1)'
];

class Pecera {
  id: number = 0;
  nombre: string = '';
  descripcion: string = '';
  estadoBomba: string = '';
  estadoResistencia: string = '';
  tamano: string = '';
}

@Component({
  selector: 'app-aquarium-m',
  templateUrl: './aquarium.component.html',
  imports: [CommonModule],
  styleUrls: ['./aquarium.component.css']
})
export class AquariumComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('canvasTemperatura', { static: false }) canvasTemperatura!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasFlujoAgua', { static: false }) canvasFlujoAgua!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasCalidadAgua', { static: false }) canvasCalidadAgua!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasNivelAgua', { static: false }) canvasNivelAgua!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasNivelOxigeno', { static: false }) canvasNivelOxigeno!: ElementRef<HTMLCanvasElement>;

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
    temperatura: 'Resistencia Calefactora',
    flujoAgua: 'Bomba de Agua',
  };

  valoresActuadores: { [clave: string]: boolean[] } = {};

  chartTemp!: Chart;
  chartFlujo!: Chart;
  chartCalidad!: Chart;
  chartNivel!: Chart;
  chartOxigeno!: Chart;

  PeceraData: Pecera = new Pecera();
  sensorConfig!: SensorConfig;
  actuadorConfig!: ActuadorConfig;
  private mensajeSub!: Subscription;

  actuadorTipos = ['calidadAgua', 'temperatura', 'flujoAgua'];

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

    const tamano = this.PeceraData.tamano;
    const idx = tamano === 's' ? 0 : tamano === 'm' ? 1 : 2;
    this.sensorConfig = SENSOR_CONFIGS[idx];
    this.actuadorConfig = ACTUADOR_CONFIG[idx];
    Object.keys(this.valoresSensores).forEach(tipo => {
      const cnt = (this.sensorConfig as any)[tipo] || 0;
      this.valoresSensores[tipo] = Array(cnt).fill(0);
    });

    this.actuadorTipos.forEach(tipo => {
      const cnt = (this.actuadorConfig as any)[tipo] || 0;
      this.valoresActuadores[tipo] = Array(cnt).fill(false);
    });

    const id = this.PeceraData.id;
    this.aquariumDataService.subscribeToTopics(id);
    this.mensajeSub = this.aquariumDataService.obtenerMensajes().subscribe(({ topic, mensaje }) => {
      this.procesarMensaje(topic, mensaje);
    });
  }

  ngAfterViewInit(): void {
    // 1) Temperatura
    if (this.sensorConfig.temperatura > 0) {
      const count = this.sensorConfig.temperatura;
      const datasetsTemp: ChartDataset<'line'>[] = [];
      for (let i = 0; i < count; i++) {
        const color = PALETTE[i % PALETTE.length];
        const bg = color.replace(', 1)', ', 0.2)');
        datasetsTemp.push({
          label: `Sensor ${i + 1}`,
          data: [],
          borderColor: color,
          backgroundColor: bg,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          spanGaps: true
        });
      }
      this.chartTemp = new Chart(
        this.canvasTemperatura.nativeElement.getContext('2d')!,
        {
          type: 'line',
          data: { labels: [], datasets: datasetsTemp },
          options: {
            animation: { duration: 0 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Temperatura (°C)' },
              legend: { position: 'bottom' }
            },
            scales: {
              x: { ticks: { autoSkip: true, maxTicksLimit: 8 } },
              y: { beginAtZero: true }
            }
          }
        }
      );
    }

    // 2) Flujo de Agua
    if (this.sensorConfig.flujoAgua > 0) {
      const count = this.sensorConfig.flujoAgua;
      const datasetsFlujo: ChartDataset<'line'>[] = [];
      for (let i = 0; i < count; i++) {
        const color = PALETTE[i % PALETTE.length];
        const bg = color.replace(', 1)', ', 0.2)');
        datasetsFlujo.push({
          label: `Sensor ${i + 1}`,
          data: [],
          borderColor: color,
          backgroundColor: bg,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          spanGaps: true
        });
      }
      this.chartFlujo = new Chart(
        this.canvasFlujoAgua.nativeElement.getContext('2d')!,
        {
          type: 'line',
          data: { labels: [], datasets: datasetsFlujo },
          options: {
            animation: { duration: 0 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Flujo de Agua (L/min)' },
              legend: { position: 'bottom' }
            },
            scales: {
              x: { ticks: { autoSkip: true, maxTicksLimit: 8 } },
              y: { beginAtZero: true }
            }
          }
        }
      );
    }

    // 3) Calidad de Agua
    if (this.sensorConfig.calidadAgua > 0) {
      const count = this.sensorConfig.calidadAgua;
      const datasetsCalidad: ChartDataset<'line'>[] = [];
      for (let i = 0; i < count; i++) {
        const color = PALETTE[i % PALETTE.length];
        const bg = color.replace(', 1)', ', 0.2)');
        datasetsCalidad.push({
          label: `Sensor ${i + 1}`,
          data: [],
          borderColor: color,
          backgroundColor: bg,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          spanGaps: true
        });
      }
      this.chartCalidad = new Chart(
        this.canvasCalidadAgua.nativeElement.getContext('2d')!,
        {
          type: 'line',
          data: { labels: [], datasets: datasetsCalidad },
          options: {
            animation: { duration: 0 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Calidad del Agua' },
              legend: { position: 'bottom' }
            },
            scales: {
              x: { ticks: { autoSkip: true, maxTicksLimit: 8 } },
              y: { beginAtZero: true }
            }
          }
        }
      );
    }

    // 4) Nivel de Agua
    if (this.sensorConfig.nivelAgua > 0) {
      const count = this.sensorConfig.nivelAgua;
      const datasetsNivel: ChartDataset<'line'>[] = [];
      for (let i = 0; i < count; i++) {
        const color = PALETTE[i % PALETTE.length];
        const bg = color.replace(', 1)', ', 0.2)');
        datasetsNivel.push({
          label: `Sensor ${i + 1}`,
          data: [],
          borderColor: color,
          backgroundColor: bg,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          spanGaps: true
        });
      }
      this.chartNivel = new Chart(
        this.canvasNivelAgua.nativeElement.getContext('2d')!,
        {
          type: 'line',
          data: { labels: [], datasets: datasetsNivel },
          options: {
            animation: { duration: 0 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Nivel del Agua (%)' },
              legend: { position: 'bottom' }
            },
            scales: {
              x: { ticks: { autoSkip: true, maxTicksLimit: 8 } },
              y: { beginAtZero: true }
            }
          }
        }
      );
    }

    // 5) Nivel de Oxígeno
    if (this.sensorConfig.nivelOxigeno > 0) {
      const count = this.sensorConfig.nivelOxigeno;
      const datasetsOxigeno: ChartDataset<'line'>[] = [];
      for (let i = 0; i < count; i++) {
        const color = PALETTE[i % PALETTE.length];
        const bg = color.replace(', 1)', ', 0.2)');
        datasetsOxigeno.push({
          label: `Sensor ${i + 1}`,
          data: [],
          borderColor: color,
          backgroundColor: bg,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          spanGaps: true
        });
      }
      this.chartOxigeno = new Chart(
        this.canvasNivelOxigeno.nativeElement.getContext('2d')!,
        {
          type: 'line',
          data: { labels: [], datasets: datasetsOxigeno },
          options: {
            animation: { duration: 0 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Nivel de Oxígeno' },
              legend: { position: 'bottom' }
            },
            scales: {
              x: { ticks: { autoSkip: true, maxTicksLimit: 8 } },
              y: { beginAtZero: true }
            }
          }
        }
      );
    }

    this.cdr.detectChanges();
  }

  private procesarMensaje(topic: string, mensaje: string): void {
    const parts = topic.split('/');
    const categoria = parts[3];
    const tipo = parts[4];
    const id = parseInt(parts[5], 10) - 1;
    const valor = tipo === 'actuador'
      ? (mensaje === 'true')
      : parseFloat(mensaje);

    if (tipo === 'sensor' && this.valoresSensores[categoria]?.[id] !== undefined) {
      this.valoresSensores[categoria][id] = valor as number;
      this.actualizarGraficoPorTipo(categoria);
    } else if (tipo === 'actuador') {
      if (this.valoresActuadores[categoria]?.[id] !== undefined) {
        this.valoresActuadores[categoria][id] = valor as boolean;
      }
    }
  }

  private actualizarGraficoPorTipo(categoria: string): void {
    const now = new Date();
    // Formato HH:MM:SS:ms para evitar repeticiones
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const tiempo = `${h}:${m}:${s}:${ms}`;

    let chartObj: Chart | undefined;
    let valores: number[];

    switch (categoria) {
      case 'temperatura':
        chartObj = this.chartTemp;
        valores = this.valoresSensores[categoria];
        break;
      case 'flujoAgua':
        chartObj = this.chartFlujo;
        valores = this.valoresSensores[categoria];
        break;
      case 'calidadAgua':
        chartObj = this.chartCalidad;
        valores = this.valoresSensores[categoria];
        break;
      case 'nivelAgua':
        chartObj = this.chartNivel;
        valores = this.valoresSensores[categoria];
        break;
      case 'nivelOxigeno':
        chartObj = this.chartOxigeno;
        valores = this.valoresSensores[categoria];
        break;
      default:
        return;
    }

    if (!chartObj) return;

    const data = chartObj.data;
    data.labels!.push(tiempo);

    data.datasets!.forEach((ds: any, idx: number) => {
      // Insertar siempre el valor actual del sensor idx
      const ultimo = valores[idx];
      ds.data.push(ultimo !== undefined ? ultimo : null);
    });

    if (data.labels!.length > 10) {
      data.labels!.shift();
      data.datasets!.forEach((ds: any) => {
        ds.data.shift();
      });
    }

    chartObj.update('none');
  }

  enviarMensajeActuador(categoria: string, id: number, estado: string) {
    const nuevoEstado = estado === 'true' ? 'false' : 'true';
    this.valoresActuadores[categoria][id - 1] = nuevoEstado === 'true';
    this.aquariumDataService.enviarMensajeActuador(this.PeceraData.id, categoria, id, nuevoEstado);
  }

  ngOnDestroy(): void {
    const id = this.PeceraData.id;
    this.aquariumDataService.desuscribirseDeTodosLosTopics(id);
    this.mensajeSub.unsubscribe();
  }
}
