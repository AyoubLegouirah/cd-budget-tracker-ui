import {
  Component, Input, OnChanges, SimpleChanges,
  ElementRef, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { CategoryStat } from '../../core/models/stats.model';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [`canvas { max-height: 260px; }`]
})
export class PieChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: CategoryStat[] = [];

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
      type: 'doughnut',
      data: this.toChartData(),
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.parsed as number;
                return ` ${ctx.label}: ${val.toFixed(2)} €`;
              }
            }
          }
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
      labels: this.data.map(c => c.categoryName),
      datasets: [{
        data: this.data.map(c => c.total),
        backgroundColor: this.data.map(c => c.color),
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  }
}
