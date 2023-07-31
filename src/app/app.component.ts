import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('ide', { static: true }) elementView!: ElementRef;
  imageDimension: Record<any, any> = {};
  markerArray = [
    {
      x: 100,
      y: 200,
    },
    {
      x: 200,
      y: 150,
    },
    {
      x: 400,
      y: 450,
    },
  ];

  constructor(public elRef: ElementRef) {}

  @HostListener('window:resize')
  onWindowResize() {
    this.imageDimension =
      this.elementView.nativeElement.getBoundingClientRect();
    if (!this.imageDimension) return;
  }
}
