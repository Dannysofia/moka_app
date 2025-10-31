import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CooperativasService } from '../services/cooperativas.service';
import { Cooperativa } from '../model/cooperativas.model';

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

  constructor(private cooperativasService: CooperativasService) { }

  ngOnInit() {
    this.cargarCooperativas();
  }

  /**
   * Cargar cooperativas desde Supabase
   */
  async cargarCooperativas() {
    this.cargando = true;
    this.error = false;
    this.mensajeError = '';

    try {
      // Cargar solo cooperativas activas desde Supabase
      this.cooperativas = await this.cooperativasService.getCooperativasActivas();
      this.cooperativasFiltradas = [...this.cooperativas];
      this.cargando = false;
    } catch (err: any) {
      this.error = true;
      this.mensajeError = err.message || 'No fue posible cargar las cooperativas, inténtelo nuevamente';
      this.cargando = false;
      console.error('Error al cargar cooperativas:', err);
    }
  }

  /**
   * Recargar datos (botón refresh)
   */
  recargarDatos() {
    this.cargarCooperativas();
  }

  /**
   * Filtrar cooperativas por búsqueda (local)
   */
  filtrarCooperativas() {
    this.cooperativasFiltradas = this.cooperativasService.filtrarCooperativas(
      this.cooperativas,
      this.terminoBusqueda
    );
  }

  /**
   * Ver detalles de una cooperativa
   */
  verDetalles(cooperativa: Cooperativa) {
    let info = `📍 Ubicación: ${cooperativa.ubicacion || 'No disponible'}\n\n`;
    
    if (cooperativa.resumen) {
      info += `📄 Resumen:\n${cooperativa.resumen}\n\n`;
    }
    
    if (cooperativa.telefono) {
      info += `📞 Teléfono: ${cooperativa.telefono}\n`;
    }
    
    if (cooperativa.email) {
      info += `✉️ Email: ${cooperativa.email}\n`;
    }
    
    if (cooperativa.sitioWeb) {
      info += `🌐 Web: ${cooperativa.sitioWeb}\n`;
    }
    
    if (cooperativa.servicios && cooperativa.servicios.length > 0) {
      const servicios = cooperativa.servicios.join('\n• ');
      info += `\n📋 Servicios:\n• ${servicios}`;
    }
    
    alert(`${cooperativa.nombre}\n\n${info.trim()}`);
  }
}