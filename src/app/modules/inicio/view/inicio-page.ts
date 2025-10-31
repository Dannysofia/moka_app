import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import type { DatetimeChangeEventDetail } from '@ionic/angular';
import { Router } from '@angular/router';
import { PerfilService } from '../../perfil/services/perfil-services';
import { InicioService } from '../services/inicio-services';
import { Bienvenida, Indicador, Cooperativa, CalendarioAg, TipoIndicador } from '../model/inicio-model';

interface IndicadorVm {
  tipo: TipoIndicador;
  label: string;
  subtitle: string;
  displayValue: string;
  mediaClass: string;
  icon: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './inicio-page.html',
  styleUrls: ['./inicio-page.scss'],
})
export class InicioPage implements OnInit {

  loading = {
    bienvenida: true,
    calendario: true,
    indicadores: true,
    cooperativas: true,
  };

  bienvenida: Bienvenida | null = null;
  calendario: any = null;
  indicadores: Indicador[] = [];
  cooperativas: Cooperativa[] = [];
  indicadoresVm: IndicadorVm[] = [];

  saludoPrincipal = '¡Bienvenid@ a Moka App!';
  saludoSecundario: string | null = null;

  private selectedDate = new Date();
  selectedDateIso = this.toIsoDate(this.selectedDate);

  toastMsg = '';
  toastColor: 'warning' | 'danger' | 'success' = 'warning';
  showToast = false;

  private srv = inject(InicioService);
  private perfilSrv = inject(PerfilService);
  private router = inject(Router);

  // Modal de calendario
  isCalendarioOpen = false;

  private readonly indicadorConfig: Record<TipoIndicador, { label: string; subtitle: string; mediaClass: string; icon: string; formatter: (valor: number) => string; }> = {
    cafe_interno: {
      label: 'Precio interno de referencia',
      subtitle: 'Por carga de 125 kg',
      mediaClass: 'media-cafe',
      icon: 'pricetag-outline',
      formatter: (valor) => this.formatCurrency(valor),
    },
    bolsa_ny: {
      label: 'Indicador',
      subtitle: 'Calidad del café',
      mediaClass: 'media-bolsa',
      icon: 'analytics-outline',
      formatter: (valor) => this.formatNumber(valor, 0),
    },
    tasa_cambio: {
      label: 'Tasa de cambio',
      subtitle: 'Pesos por dólar',
      mediaClass: 'media-divisa',
      icon: 'cash-outline',
      formatter: (valor) => this.formatNumber(valor, 0),
    },
  };

  async ngOnInit() {
    // Cargar datos del usuario para personalizar el saludo principal
    this.cargarUsuario();
    this.cargarBienvenida();
    this.cargarCalendario();
    this.cargarIndicadores();
    this.cargarCooperativas();
  }

  abrirCalendario() {
    this.isCalendarioOpen = true;
    if (!this.calendario?.url) {
      this.alert('No hay calendario agricola disponible', 'warning');
    }
  }

  cerrarCalendario() {
    this.isCalendarioOpen = false;
  }

  onDateChange(event: CustomEvent<DatetimeChangeEventDetail>) {
    const rawValue = event.detail?.value;
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (!value) {
      return;
    }

    const parsed = this.parseDateValue(value);
    if (!parsed) {
      return;
    }

    this.selectedDate = parsed;
    this.selectedDateIso = this.toIsoDate(parsed);
  }

  verMasCooperativas() {
    this.router.navigateByUrl('/cooperativas');
  }

  private async cargarBienvenida() {
    try {
      this.bienvenida = await this.srv.getBienvenida();
      this.updateSaludo();
    } catch (e: any) {
      this.alert('No fue posible cargar el saludo', 'danger');
    } finally {
      this.loading.bienvenida = false;
    }
  }

  private async cargarCalendario() {
    try {
      this.calendario = await this.srv.getCalendario();
      if (!this.calendario) {
        this.alert('No hay calendario agricola disponible', 'warning');
      }
    } catch (e: any) {
      this.alert('No fue posible cargar el calendario, intentelo nuevamente', 'danger');
    } finally {
      this.loading.calendario = false;
    }
  }

  private async cargarIndicadores() {
    try {
      this.indicadores = await this.srv.getIndicadores();
      if (!this.indicadores?.length) {
        this.alert('Indicador no disponible por el momento', 'warning');
      }
      this.indicadoresVm = (this.indicadores || []).map((ind) => this.toIndicadorVm(ind));
    } catch (e: any) {
      this.alert('No fue posible cargar los indicadores, intentelo nuevamente', 'danger');
    } finally {
      this.loading.indicadores = false;
    }
  }

  private async cargarCooperativas() {
    try {
      this.cooperativas = await this.srv.getCooperativasPreview(4);
      if (!this.cooperativas?.length) {
        this.alert('Por ahora no hay cooperativas disponibles', 'warning');
      }
    } catch (e: any) {
      this.alert('No fue posible cargar las cooperativas, intentelo nuevamente', 'danger');
    } finally {
      this.loading.cooperativas = false;
    }
  }

  private updateSaludo() {
    const texto = this.bienvenida?.texto?.trim();

    if (!texto) {
      this.saludoSecundario = null;
      return;
    }

    const partes = texto.split(/[\n\.]/).map((p) => p.trim()).filter(Boolean);
    const resto = partes.slice(1).join(' ').trim();

    if (resto.length) {
      this.saludoSecundario = resto;
      return;
    }

    const principal = partes[0] || texto;
    this.saludoSecundario = principal !== this.saludoPrincipal ? principal : null;
  }

  private async cargarUsuario() {
    try {
      const norm = await this.perfilSrv.getCurrentUserNormalized();
      const nombre = (norm?.nombre ?? '').trim();
      if (nombre) {
        const nombreCap = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
        // Sin dato de género en el perfil, usamos un saludo inclusivo por defecto
        this.saludoPrincipal = `¡Bienvenido/a, ${nombreCap}!`;
      } else {
        this.saludoPrincipal = '¡Bienvenid@ a Moka App!';
      }
    } catch {
      this.saludoPrincipal = '¡Bienvenid@ a Moka App!';
    }
  }

  private toIndicadorVm(ind: Indicador): IndicadorVm {
    const meta = this.indicadorConfig[ind.tipo];
    if (!meta) {
      return {
        tipo: ind.tipo,
        label: 'Indicador',
        subtitle: '',
        displayValue: this.formatNumber(ind.valor, 2),
        mediaClass: 'media-generico',
        icon: 'information-circle-outline',
      };
    }

    return {
      tipo: ind.tipo,
      label: meta.label,
      subtitle: meta.subtitle,
      displayValue: meta.formatter(ind.valor),
      mediaClass: meta.mediaClass,
      icon: meta.icon,
    };
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private formatNumber(value: number, maximumFractionDigits = 0) {
    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(value);
  }

  private parseDateValue(value: string) {
    const [datePart] = value.split('T');
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (!match) {
      return null;
    }

    const [, year, month, day] = match;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private toIsoDate(value: Date) {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  private alert(msg: string, color: 'warning' | 'danger' | 'success' = 'warning') {
    this.toastMsg = msg;
    this.toastColor = color;
    this.showToast = false;
    setTimeout(() => (this.showToast = true));
  }
}


























