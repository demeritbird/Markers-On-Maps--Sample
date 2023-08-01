import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { EMPTY_DOM_RECT, Position } from 'src/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('image_ref', { static: true }) imageView!: ElementRef;
  imageDimension: Omit<DOMRect, 'toJSON'> = EMPTY_DOM_RECT;
  @ViewChild('container_ref', { static: true }) containerView!: ElementRef;
  containerDimension: Omit<DOMRect, 'toJSON'> = EMPTY_DOM_RECT;

  markerArray: Position[] = [
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

  redefineElements() {
    this.imageDimension = this.imageView.nativeElement.getBoundingClientRect();
    this.containerDimension =
      this.containerView.nativeElement.getBoundingClientRect();

    if (!this.imageDimension || !this.containerDimension) return;
  }
  triggerImageMoveEvent() {
    window.dispatchEvent(new CustomEvent('image-shift'));
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.redefineElements();
  }

  @HostListener('window:image-shift')
  onImageMove() {
    this.redefineElements();
  }

  zoomFactor: number = 1; // zoom-in factor
  isImagePanning: boolean = false; // check whether mouse is currently clicking on image.
  posBoundToImageDist: Position = { x: 0, y: 0 };
  posImageToClickDist: Position = { x: 0, y: 0 };

  setTransform() {
    const bound = document.getElementById('zoom');
    if (bound) {
      bound.style.transform = `translate(${this.posBoundToImageDist.x}px, ${this.posBoundToImageDist.y}px) scale(${this.zoomFactor})`;
    }

    this.triggerImageMoveEvent();
  }

  /**
   * Function runs when mouseclick inside image
   */
  handleMouseDown(event: MouseEvent) {
    event.preventDefault();

    this.posImageToClickDist = {
      x: event.clientX - this.posBoundToImageDist.x,
      y: event.clientY - this.posBoundToImageDist.y,
    };
    this.isImagePanning = true;
  }

  /**
   * Function runs when mouseclick stopped inside image.
   */
  handleMouseUp() {
    this.isImagePanning = false;
  }

  /**
   * Function runs when draggin image around
   * Happens only when MOUSE ON image.
   */
  handleMouseMove(event: MouseEvent) {
    event.preventDefault();
    if (!this.isImagePanning) return;

    this.posBoundToImageDist.x = event.clientX - this.posImageToClickDist.x;
    this.posBoundToImageDist.y = event.clientY - this.posImageToClickDist.y;

    this.setTransform();
  }

  handleWheel(event: WheelEvent) {
    event.preventDefault();
    const xs = (event.clientX - this.posBoundToImageDist.x) / this.zoomFactor;
    const ys = (event.clientY - this.posBoundToImageDist.y) / this.zoomFactor;
    const delta = event.deltaY || event.detail || (-event as any).wheelDelta;

    delta > 0 ? (this.zoomFactor *= 1.2) : (this.zoomFactor /= 1.2);
    this.posBoundToImageDist.x = event.clientX - xs * this.zoomFactor;
    this.posBoundToImageDist.y = event.clientY - ys * this.zoomFactor;

    this.setTransform();
  }
}

// Link for image scroll/zoom: https://dev.to/stackfindover/zoom-image-point-with-mouse-wheel-11n3
