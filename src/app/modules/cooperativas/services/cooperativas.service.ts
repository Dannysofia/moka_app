import { Injectable } from '@angular/core';
import { Cooperativa } from '../model/cooperativas.model';

@Injectable({
  providedIn: 'root'
})
export class CooperativasService {

  private cooperativas: Cooperativa[] = [
    {
      id: 1,
      nombre: 'Cooperativa Agrícola del Valle',
      ubicacion: 'Cali, Valle del Cauca',
      telefono: '(2) 555-0123',
      email: 'info@coopvalle.com',
      sitioWeb: 'https://coopvalle.com',
      servicios: ['Compra de café', 'Venta de insumos', 'Asesoría técnica', 'Créditos agrícolas']
    },
    {
      id: 2,
      nombre: 'Cooperativa Cafetera del Sur',
      ubicacion: 'Popayán, Cauca',
      telefono: '(2) 555-0456',
      email: 'contacto@coopcafe.com',
      sitioWeb: 'https://coopcafe.com',
      servicios: ['Comercialización de café', 'Capacitaciones', 'Maquinaria compartida']
    },
    {
      id: 3,
      nombre: 'Asociación de Productores Unidos',
      ubicacion: 'Palmira, Valle del Cauca',
      telefono: '(2) 555-0789',
      email: 'apu@productores.com',
      servicios: ['Venta de productos orgánicos', 'Certificaciones', 'Transporte']
    },
    {
      id: 4,
      nombre: 'Cooperativa Integral del Pacífico',
      ubicacion: 'Buenaventura, Valle del Cauca',
      telefono: '(2) 555-0321',
      email: 'info@cooppacifico.com',
      sitioWeb: 'https://cooppacifico.com',
      servicios: ['Acopio de productos', 'Exportaciones', 'Almacenamiento', 'Seguros']
    },
    {
      id: 5,
      nombre: 'Red de Agricultores Sostenibles',
      ubicacion: 'Tuluá, Valle del Cauca',
      telefono: '(2) 555-0654',
      email: 'ras@agricultores.org',
      servicios: ['Agricultura sostenible', 'Semillas certificadas', 'Compostaje']
    }
  ];

  constructor() { }

  /**
   * Obtener todas las cooperativas (simula llamada a BD con delay)
   */
  getCooperativas(): Promise<Cooperativa[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula éxito
        resolve([...this.cooperativas]);
        
        // Para simular error, descomenta:
        // reject(new Error('Error de conexión con la base de datos'));
      }, 1500);
    });
  }

  /**
   * Obtener cooperativa por ID
   */
  getCooperativaPorId(id: number): Cooperativa | undefined {
    return this.cooperativas.find(c => c.id === id);
  }

  /**
   * Filtrar cooperativas por término de búsqueda
   */
  filtrarCooperativas(cooperativas: Cooperativa[], termino: string): Cooperativa[] {
    const terminoLower = termino.toLowerCase().trim();
    
    if (!terminoLower) {
      return cooperativas;
    }
    
    return cooperativas.filter(coop =>
      coop.nombre.toLowerCase().includes(terminoLower) ||
      coop.ubicacion.toLowerCase().includes(terminoLower) ||
      coop.servicios.some(s => s.toLowerCase().includes(terminoLower))
    );
  }

  /**
   * Obtener estadísticas
   */
  getEstadisticas(): { total: number, conEmail: number, conWeb: number } {
    return {
      total: this.cooperativas.length,
      conEmail: this.cooperativas.filter(c => c.email).length,
      conWeb: this.cooperativas.filter(c => c.sitioWeb).length
    };
  }
}