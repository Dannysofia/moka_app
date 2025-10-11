import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-finance',
  templateUrl: './finance.page.html',
  styleUrls: ['./finance.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class FinancePage implements OnInit, AfterViewInit {

  @ViewChild('pieChart', { static: false }) pieChart!: ElementRef;

  // Datos quemados del resumen financiero
  ingresos: number = 5250.00;
  gastos: number = 3420.50;
  ahorro: number = 12800.00;
  inversiones: number = 8500.00;
  balanceTotal: number = 23129.50;

  // Distribución de gastos
  distribucionGastos = [
    { categoria: 'Comida', porcentaje: 35, monto: 1197.18 },
    { categoria: 'Transporte', porcentaje: 25, monto: 855.13 },
    { categoria: 'Servicios', porcentaje: 20, monto: 684.10 },
    { categoria: 'Entretenimiento', porcentaje: 12, monto: 410.46 },
    { categoria: 'Otros', porcentaje: 8, monto: 273.64 }
  ];

  // Colores para el gráfico
  colores = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  fechaActual: string = '';
  private chart: any;

  constructor() { 
    this.establecerFecha();
  }

  ngOnInit() {
    // Puedes agregar lógica adicional aquí si necesitas
  }

  ngAfterViewInit() {
    setTimeout(() => this.crearGraficoPastel(), 100);
  }

  /**
   * Establecer fecha actual formateada
   */
  establecerFecha() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fecha = new Date();
    this.fechaActual = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  /**
   * Crear gráfico de pastel con datos quemados
   */
  crearGraficoPastel() {
    if (!this.pieChart) return;

    const ctx = this.pieChart.nativeElement.getContext('2d');

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.distribucionGastos.map(d => d.categoria);
    const data = this.distribucionGastos.map(d => d.porcentaje);
    
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: this.colores,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
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