import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
// 👇 IMPORTA MODEL Y SERVICE
import { FinanzasService } from '../services/finanzas.service';
import { ResumenFinanciero, DistribucionGastos } from '../model/finanzas.model';

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

  // 👇 USA LAS INTERFACES
  ingresos: number = 0;
  gastos: number = 0;
  ahorro: number = 0;
  inversiones: number = 0;
  balanceTotal: number = 0;

  distribucionGastos: DistribucionGastos[] = [];
  colores = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
  fechaActual: string = '';
  private chart: any;

  // 👇 INYECTA EL SERVICE
  constructor(private finanzasService: FinanzasService) { 
    this.establecerFecha();
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    setTimeout(() => this.crearGraficoPastel(), 100);
  }

  // 👇 USA EL SERVICE PARA CARGAR DATOS
  cargarDatos() {
    const resumen = this.finanzasService.getResumenFinanciero();
    this.ingresos = resumen.ingresos;
    this.gastos = resumen.gastos;
    this.ahorro = resumen.ahorro;
    this.inversiones = resumen.inversiones;
    this.balanceTotal = resumen.balanceTotal;

    this.distribucionGastos = this.finanzasService.getDistribucionGastos();
  }

  establecerFecha() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fecha = new Date();
    this.fechaActual = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

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
