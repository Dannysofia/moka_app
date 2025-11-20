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

  // Control del modal
  mostrarModal: boolean = false;
  cooperativaSeleccionada: Cooperativa | null = null;

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
   * Ver detalles de una cooperativa en modal
   */
  verDetalles(cooperativa: Cooperativa) {
    this.cooperativaSeleccionada = cooperativa;
    this.mostrarModal = true;
  }

  /**
   * Cerrar modal
   */
  cerrarModal() {
    this.mostrarModal = false;
    this.cooperativaSeleccionada = null;
  }
}