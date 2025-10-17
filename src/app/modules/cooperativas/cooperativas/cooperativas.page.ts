import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface Cooperativa {
  id: number;
  nombre: string;
  ubicacion: string;
  telefono?: string;
  email?: string;
  sitioWeb?: string;
  servicios: string[];
}

@Component({
  selector: 'app-cooperativas',
  templateUrl: './cooperativas.page.html',
  styleUrls: ['./cooperativas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class CooperativasPage implements OnInit {

  cooperativas: Cooperativa[] = [];
  cooperativasFiltradas: Cooperativa[] = [];
  terminoBusqueda: string = '';
  
  // Estados de la vista
  cargando: boolean = false;
  error: boolean = false;
  mensajeError: string = '';

  constructor() { }

  ngOnInit() {
    this.cargarCooperativas();
  }

  /**
   * Paso 2: Consultar datos precargados (simulación de BD)
   */
  cargarCooperativas() {
    this.cargando = true;
    this.error = false;
    this.mensajeError = '';

    // Simula una llamada a la base de datos con delay
    setTimeout(() => {
      try {
        // Paso 3: Recibe información y prepara en formato tabla
        this.cooperativas = this.obtenerDatosPrecargados();
        this.cooperativasFiltradas = [...this.cooperativas];
        this.cargando = false;

        // Si quieres simular un error, descomenta:
        // throw new Error('Error de conexión');
        
      } catch (err) {
        // Validación: Error al consultar
        this.error = true;
        this.mensajeError = 'No fue posible cargar las cooperativas, inténtelo nuevamente';
        this.cargando = false;
        console.error('Error al cargar cooperativas:', err);
      }
    }, 1500); // Simula delay de red
  }

  /**
   * Datos precargados de cooperativas
   */
  obtenerDatosPrecargados(): Cooperativa[] {
    return [
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

    // Para simular "sin datos", retorna array vacío:
    // return [];
  }

  /**
   * Recargar datos (botón refresh)
   */
  recargarDatos() {
    this.cargarCooperativas();
  }

  /**
   * Filtrar cooperativas por búsqueda
   */
  filtrarCooperativas() {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    
    if (!termino) {
      this.cooperativasFiltradas = [...this.cooperativas];
    } else {
      this.cooperativasFiltradas = this.cooperativas.filter(coop =>
        coop.nombre.toLowerCase().includes(termino) ||
        coop.ubicacion.toLowerCase().includes(termino) ||
        coop.servicios.some(s => s.toLowerCase().includes(termino))
      );
    }
  }

  /**
   * Ver detalles de una cooperativa
   */
  verDetalles(cooperativa: Cooperativa) {
    console.log('Ver detalles de:', cooperativa);
    // Aquí puedes navegar a una página de detalle o abrir un modal
    alert(`Detalles de ${cooperativa.nombre}\n\nUbicación: ${cooperativa.ubicacion}\nServicios: ${cooperativa.servicios.join(', ')}`);
  }

}