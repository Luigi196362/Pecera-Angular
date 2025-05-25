import { Injectable } from '@angular/core';
import mqtt from 'mqtt';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AquariumDataService {


  private client = mqtt.connect('ws://localhost:8083/mqtt', {
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
      //console.log(`📩 Mensaje recibido en ${topic}: ${msg}`);

      // Emitimos el mensaje a los que estén escuchando el Subject
      this.mensajes$.next({ topic, mensaje: msg });
    });
  }


  public subscribeToTopics(peceraID: number) {
    const topic = `PC/pecera/${peceraID}/#`;

    // 1) Si ya existía, desuscribe
    this.client.unsubscribe(topic, () => {
      console.log('🛑 Desuscrito (antes de renovar):', topic);

      // 2) Ahora suscribe y así el broker volverá a enviar retenido
      this.client.subscribe(topic, err => {
        if (err) console.error('❌ Error al suscribir:', err);
        else console.log('✅ Suscrito a:', topic);
      });
    });
  }

  public enviarMensajeSensor(peceraID: number, categoria: string, id: number, mensaje: string) {
    this.client.publish('PC/pecera/' + peceraID + '/' + categoria + '/sensor/' + id, mensaje, { qos: 1 }, (error) => {
      if (error) {
        console.error('Error al enviar el mensaje:', error);
      } else {
        console.log('Mensaje enviado correctamente');
      }
    });
  }

  public enviarMensajeActuador(peceraID: number, categoria: string, id: number, mensaje: string) {
    this.client.publish('PC/pecera/' + peceraID + '/' + categoria + '/actuador/' + id, mensaje, { retain: true, qos: 1 }, (error) => {
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
  public desuscribirseDeTodosLosTopics(): void {
    // Usamos comodín para cancelar todas las suscripciones bajo PC/pecera
    const topicWildcard = 'PC/pecera/#';
    this.client.unsubscribe(topicWildcard, (err) => {
      if (err) {
        console.error('❌ Error al desuscribirse de todos los tópicos:', err);
      } else {
        console.log('🛑 Desuscripción completa de:', topicWildcard);
      }
    });
  }

}

