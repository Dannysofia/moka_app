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

  constructor() { }

  ngOnInit() {
    this.calcularBalance();
  }

  ngAfterViewInit() {
    this.crearGraficoPastel();
  }

  calcularBalance() {
    this.balanceTotal = this.ingresos - this.gastos + this.ahorro + this.inversiones;
  }

  crearGraficoPastel() {
    const ctx = this.pieChart.nativeElement.getContext('2d');
    
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Otros'],
        datasets: [{
          data: [35, 25, 20, 12, 8],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b',
            '#8b5cf6',
            '#ef4444'
          ],
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
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    });
  }

  actualizarDatos() {
    // Lógica para actualizar datos desde API
  }

  verDetalles(tipo: string) {
    console.log('Ver detalles de:', tipo);
  }

}