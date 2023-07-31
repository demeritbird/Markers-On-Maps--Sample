import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('ide', { static: true }) imageView!: ElementRef;
  imageDimension: Record<any, any> = {};
  @ViewChild('container', { static: true }) containerView!: ElementRef;
  containerDimension: Record<any, any> = {};

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
    this.imageDimension = this.imageView.nativeElement.getBoundingClientRect();
    this.containerDimension =
      this.containerView.nativeElement.getBoundingClientRect();

    if (!this.imageDimension || !this.containerDimension) return;
  }

  scale = 1; // zoom-in factor
  panning = false; // check whether mouse is currently clicking on image.
  pointX = 0; // distance from container left to image left --> x-coord OR markerLeft
  pointY = 0; // distance from container top to image top --> y-coord OR markerTOP
  start = { x: 0, y: 0 }; // {distance from client left to point (clicked), distance from client top to point (clicked)}

  setTransform() {
    const zoom = document.getElementById('zoom');
    if (zoom) {
      zoom.style.transform = `translate(${this.pointX}px, ${this.pointY}px) scale(${this.scale})`;
    }
  }

  /**
   * Function runs when mouseclick inside image
   */
  handleMouseDown(e: MouseEvent) {
    e.preventDefault();

    this.start = { x: e.clientX - this.pointX, y: e.clientY - this.pointY };
    console.log('mouse ON image', {
      start_x: this.start.x,
      start_y: this.start.y,
    });
    this.panning = true;
  }

  /**
   * Function runs when mouseclick stopped inside image.
   */
  handleMouseUp() {
    console.log('mouse OFF image', {
      start_x: this.start.x,
      start_y: this.start.y,
    });
    this.panning = false;
  }

  /**
   * Function runs when draggin image around
   * Happens only when MOUSE ON image.
   */
  handleMouseMove(e: MouseEvent) {
    e.preventDefault();
    if (!this.panning) {
      return;
    }

    this.pointX = e.clientX - this.start.x;
    this.pointY = e.clientY - this.start.y;

    console.log('SCROLL image', { point_x: this.pointX, point_y: this.pointY });
    this.setTransform();
  }

  handleWheel(e: WheelEvent) {
    e.preventDefault();
    const xs = (e.clientX - this.pointX) / this.scale;
    const ys = (e.clientY - this.pointY) / this.scale;
    const delta = e.deltaY || e.detail || (-e as any).wheelDelta;

    delta > 0 ? (this.scale *= 1.2) : (this.scale /= 1.2);
    this.pointX = e.clientX - xs * this.scale;
    this.pointY = e.clientY - ys * this.scale;

    this.setTransform();
  }
}

// Link for image scroll/zoom: https://dev.to/stackfindover/zoom-image-point-with-mouse-wheel-11n3
