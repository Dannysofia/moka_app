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
   * Cargar cooperativas desde el servicio
   */
  async cargarCooperativas() {
    this.cargando = true;
    this.error = false;
    this.mensajeError = '';

    try {
      this.cooperativas = await this.cooperativasService.getCooperativas();
      this.cooperativasFiltradas = [...this.cooperativas];
      this.cargando = false;
    } catch (err: any) {
      this.error = true;
      this.mensajeError = 'No fue posible cargar las cooperativas, inténtelo nuevamente';
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
   * Filtrar cooperativas por búsqueda
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
    const servicios = cooperativa.servicios.join('\n• ');
    const contacto = [];
    
    if (cooperativa.telefono) contacto.push(`Teléfono: ${cooperativa.telefono}`);
    if (cooperativa.email) contacto.push(`Email: ${cooperativa.email}`);
    if (cooperativa.sitioWeb) contacto.push(`Web: ${cooperativa.sitioWeb}`);
    
    const info = `
📍 Ubicación: ${cooperativa.ubicacion}

📞 Contacto:
${contacto.join('\n')}

📋 Servicios:
• ${servicios}
    `.trim();
    
    alert(`${cooperativa.nombre}\n\n${info}`);
  }
}