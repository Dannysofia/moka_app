import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { FinanzasService } from '../services/finanzas.service';
import { ResumenFinanciero, DistribucionGastos, Transaccion } from '../model/finanzas.model';

Chart.register(...registerables);

@Component({
  selector: 'app-finance',
  templateUrl: './finance.page.html',
  styleUrls: ['./finance.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class FinancePage implements OnInit, AfterViewInit {

  @ViewChild('pieChart', { static: false }) pieChart!: ElementRef;

  ingresos: number = 0;
  gastos: number = 0;
  ahorro: number = 0;
  inversiones: number = 0;
  balanceTotal: number = 0;

  distribucionGastos: DistribucionGastos[] = [];
  listaGastos: Transaccion[] = [];
  listaIngresos: Transaccion[] = [];
  colores = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
  fechaActual: string = '';
  fechaMaxima: string = new Date().toISOString();
  private chart: any;

  // Estados de la vista
  cargando: boolean = false;
  error: boolean = false;
  mensajeError: string = '';

  // Control del modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  transaccionEditando: number | null = null;
  nuevaTransaccion: Transaccion = {
    tipo: 'gasto',
    fecha: new Date().toISOString(),
    monto: 0,
    categoria: '',
    notas: ''
  };

  constructor(private finanzasService: FinanzasService) { 
    this.establecerFecha();
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      console.log('ngAfterViewInit - pieChart:', this.pieChart);
      console.log('ngAfterViewInit - distribucionGastos:', this.distribucionGastos);
      if (this.distribucionGastos.length > 0) {
        this.crearGraficoPastel();
      }
    }, 1000);
  }

  /**
   * Cargar datos desde Supabase
   */
  async cargarDatos() {
    this.cargando = true;
    this.error = false;
    this.mensajeError = '';

    try {
      const resumen = await this.finanzasService.calcularResumenFinanciero();
      this.ingresos = resumen.ingresos;
      this.gastos = resumen.gastos;
      this.ahorro = resumen.ahorro;
      this.inversiones = resumen.inversiones;
      this.balanceTotal = resumen.balanceTotal;

      this.distribucionGastos = await this.finanzasService.calcularDistribucionGastos();

      const transacciones = await this.finanzasService.getTransaccionesMesActual();
      this.listaGastos = transacciones.filter(t => t.tipo === 'gasto');
      this.listaIngresos = transacciones.filter(t => t.tipo === 'ingreso');

      this.cargando = false;

      setTimeout(() => {
        if (this.distribucionGastos.length > 0) {
          console.log('Intentando crear gráfico después de cargar datos');
          this.crearGraficoPastel();
        } else {
          console.log('No hay distribución de gastos para mostrar');
        }
      }, 300);
    } catch (err: any) {
      this.error = true;
      this.mensajeError = err.message || 'No fue posible cargar los datos financieros';
      this.cargando = false;
      console.error('Error al cargar datos:', err);
    }
  }

  /**
   * Recargar datos (botón refresh)
   */
  recargarDatos() {
    this.cargarDatos();
  }

  establecerFecha() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fecha = new Date();
    this.fechaActual = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  abrirFormularioGasto() {
    this.modoEdicion = false;
    this.transaccionEditando = null;
    this.resetearFormulario();
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.transaccionEditando = null;
    this.resetearFormulario();
  }

  /**
   * Abrir modal para editar una transacción
   */
  editarTransaccion(transaccion: Transaccion) {
    this.modoEdicion = true;
    this.transaccionEditando = transaccion.id || null;
    this.nuevaTransaccion = {
      tipo: transaccion.tipo,
      fecha: transaccion.fecha,
      monto: transaccion.monto,
      categoria: transaccion.categoria,
      notas: transaccion.notas || ''
    };
    this.mostrarModal = true;
  }

  /**
   * Agregar o actualizar transacción en Supabase
   */
  async agregarGasto() {
    if (this.nuevaTransaccion.categoria && 
        this.nuevaTransaccion.notas && 
        this.nuevaTransaccion.monto > 0) {
      
      try {
        if (this.modoEdicion && this.transaccionEditando) {
          await this.finanzasService.actualizarTransaccion(
            this.transaccionEditando, 
            this.nuevaTransaccion
          );
          console.log('Transacción actualizada exitosamente');
        } else {
          await this.finanzasService.agregarTransaccion(this.nuevaTransaccion);
          console.log('Transacción agregada exitosamente');
        }
        
        await this.cargarDatos();
        this.cerrarModal();
      } catch (err: any) {
        console.error('Error al guardar transacción:', err);
        alert('Error al guardar la transacción: ' + err.message);
      }
    }
  }

  /**
   * Eliminar una transacción
   */
  async eliminarTransaccion(transaccion: Transaccion) {
    if (!transaccion.id) return;

    const tipoTexto = transaccion.tipo === 'ingreso' ? 'ingreso' : 'gasto';
    const confirmar = confirm(
      `¿Estás seguro de eliminar este ${tipoTexto}?\n\n` +
      `${transaccion.categoria}: ${transaccion.monto}\n` +
      `${transaccion.notas}`
    );

    if (confirmar) {
      try {
        await this.finanzasService.eliminarTransaccion(transaccion.id);
        console.log('Transacción eliminada exitosamente');
        await this.cargarDatos();
      } catch (err: any) {
        console.error('Error al eliminar transacción:', err);
        alert('Error al eliminar la transacción: ' + err.message);
      }
    }
  }

  /**
   * Cuando cambia el tipo de transacción, limpiar categoría
   */
  onTipoChange() {
    this.nuevaTransaccion.categoria = '';
  }

  resetearFormulario() {
    this.nuevaTransaccion = {
      tipo: 'gasto',
      fecha: new Date().toISOString(),
      monto: 0,
      categoria: '',
      notas: ''
    };
  }

  crearGraficoPastel() {
    if (!this.pieChart) {
      console.log('pieChart no está disponible aún');
      return;
    }
    
    if (this.distribucionGastos.length === 0) {
      console.log('No hay datos de distribución para mostrar');
      return;
    }
    
    const ctx = this.pieChart.nativeElement.getContext('2d');
    
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.distribucionGastos.map(d => d.categoria);
    const data = this.distribucionGastos.map(d => d.porcentaje);
    
    console.log('Creando gráfico con:', { labels, data });
    
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: this.colores.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const item = this.distribucionGastos[context.dataIndex];
                return `${context.label}: ${item.porcentaje}% ($${item.monto.toFixed(2)})`;
              }
            }
          }
        }
      }
    });
  }
}