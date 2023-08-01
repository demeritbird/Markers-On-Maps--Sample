import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EMPTY_DOM_RECT, Position } from 'src/types';

@Component({
  selector: 'app-marker-map',
  templateUrl: './marker-map.component.html',
  styleUrls: ['./marker-map.component.scss'],
})
export class MarkerMapComponent implements OnInit {
  @ViewChild('image_ref', { static: true }) imageView!: ElementRef;
  imageDimension: Omit<DOMRect, 'toJSON'> = EMPTY_DOM_RECT;
  @ViewChild('container_ref', { static: true }) containerView!: ElementRef;
  containerDimension: Omit<DOMRect, 'toJSON'> = EMPTY_DOM_RECT;

  markerArray: Position[] = [];

  constructor(public elRef: ElementRef) {}

  ngOnInit() {
    // Mock async calls from server
    setTimeout(() => {
      this.markerArray.push({ x: 100, y: 200 });
      this.markerArray.push({ x: 200, y: 150 });
      this.markerArray.push({ x: 400, y: 450 });
    }, 500); // Perhaps dispatch event if async functions don't load?
  }

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
  MAX_ZOOM_VALUE: number = 3;
  MIN_ZOOM_VALUE: number = 0.5;

  isImagePanning: boolean = false; // check whether mouse is currently clicking on image.
  posBoundToImageDist: Position = { x: 0, y: 0 };
  posImageToClickDist: Position = { x: 0, y: 0 };

  setTransform() {
    const bound = document.getElementById('bound');
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
  handleMouseLeave() {
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

    delta > 0
      ? (this.zoomFactor = Math.min(
          (this.zoomFactor *= 1.2),
          this.MAX_ZOOM_VALUE
        ))
      : (this.zoomFactor = Math.max(
          (this.zoomFactor /= 1.2),
          this.MIN_ZOOM_VALUE
        ));
    this.posBoundToImageDist.x = event.clientX - xs * this.zoomFactor;
    this.posBoundToImageDist.y = event.clientY - ys * this.zoomFactor;

    this.setTransform();
  }
}

// Link for image scroll/zoom: https://dev.to/stackfindover/zoom-image-point-with-mouse-wheel-11n3
