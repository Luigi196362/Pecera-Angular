import { Injectable } from '@angular/core';
import mqtt from 'mqtt';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AquariumDataService {


  private client = mqtt.connect('ws://192.168.251.147:8083/mqtt', {
    clientId: 'cliente-angular'
  });

  private mensajes$ = new Subject<{ topic: string; mensaje: string }>();


  constructor() {
    this.client.on('connect', () => {
      console.log('✅ Conectado al broker MQTT');
    });

    this.client.on('error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    // Escucha todos los mensajes entrantes
    this.client.on('message', (topic, message) => {
      const msg = message.toString();
      console.log(`📩 Mensaje recibido en ${topic}: ${msg}`);

      // Emitimos el mensaje a los que estén escuchando el Subject
      this.mensajes$.next({ topic, mensaje: msg });
    });
  }


  public subscribeToTopics(peceraID: number) {

    this.client.subscribe('PC/pecera' + peceraID + '/#', (error) => {
      if (error) {
        console.error('Error al suscribirse al tema:', error);
      } else {
        console.log('Suscrito al tema: PC/pecera' + peceraID + '/#');
      }
    });

  }



  public enviarMensaje(peceraID: number, categoria: string, tipo: string, id: number, mensaje: string) {
    this.client.publish('PC/pecera' + peceraID + '/' + categoria + '/' + tipo + '/' + id, mensaje, { qos: 1 }, (error) => {
      if (error) {
        console.error('Error al enviar el mensaje:', error);
      } else {
        console.log('Mensaje enviado correctamente');
      }
    });
  }

  public obtenerMensajes() {
    return this.mensajes$.asObservable();
  }

}

