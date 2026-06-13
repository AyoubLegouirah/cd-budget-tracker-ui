import {
  Component, Input, OnChanges, SimpleChanges,
  ElementRef, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import {
  Chart, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, BarController
} from 'chart.js';
import { MonthlyStat } from '../../core/models/stats.model';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, BarController);

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [`canvas { max-height: 260px; }`]
})
export class BarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: MonthlyStat[] = [];

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.toChartData(),
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(2)} €`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { callback: v => `${v} €` } }
        }
      }
    });
  }

  private updateChart(): void {
    if (!this.chart) return;
    const d = this.toChartData();
    this.chart.data.labels = d.labels;
    this.chart.data.datasets = d.datasets;
    this.chart.update();
  }

  private toChartData() {
    return {
      labels: this.data.map(m => m.month),
      datasets: [
        {
          label: 'Revenus',
          data: this.data.map(m => m.totalIncome),
          backgroundColor: '#22c55e',
          borderRadius: 6
        },
        {
          label: 'Dépenses',
          data: this.data.map(m => m.totalExpense),
          backgroundColor: '#ef4444',
          borderRadius: 6
        }
      ]
    };
  }
}
