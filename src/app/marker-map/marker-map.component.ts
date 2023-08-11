import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

import { EMPTY_DOM_RECT } from 'src/utils/constants';
import { Position } from 'src/utils/types';

enum ImageOverflow {
  NO_OVERFLOW,
  OVERFLOW,
}

@Component({
  selector: 'app-marker-map',
  templateUrl: './marker-map.component.html',
  styleUrls: ['./marker-map.component.scss'],
})
export class MarkerMapComponent implements OnInit {
  @ViewChild('image_ref', { static: true })
  imageView!: ElementRef;
  imageDimension: Omit<DOMRect, 'toJSON'> = EMPTY_DOM_RECT;
  @ViewChild('container__image_ref', { static: true })
  containerView!: ElementRef;
  containerDimension: Omit<DOMRect, 'toJSON'> = EMPTY_DOM_RECT;

  imageOverflowStatus: ImageOverflow = ImageOverflow.NO_OVERFLOW;

  markerArray: Position[] = [];

  constructor(public elRef: ElementRef) {}

  ngOnInit(): void {
    // Mock async calls from server
    setTimeout(() => {
      this.markerArray.push({ x: 100, y: 200 });
      this.markerArray.push({ x: 200, y: 150 });
      this.markerArray.push({ x: 400, y: 450 });
    }, 500); // Perhaps dispatch event if async functions don't load?
  }

  redefineElements(): void {
    this.imageDimension = this.imageView.nativeElement.getBoundingClientRect();
    this.containerDimension =
      this.containerView.nativeElement.getBoundingClientRect();
    this.imageOverflowStatus = ImageOverflow.NO_OVERFLOW;
  }
  triggerImageMoveEvent(): void {
    window.dispatchEvent(new CustomEvent('image-shift'));
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.redefineElements();
  }

  @HostListener('window:image-shift')
  onImageMove(): void {
    this.redefineElements();
  }

  zoomFactor: number = 1; // zoom-in factor
  MAX_ZOOM_VALUE: number = 3;
  MIN_ZOOM_VALUE: number = 0.5;

  isImagePanning: boolean = false; // check whether mouse is currently clicking on image.
  distBoundToImage: Position = { x: 0, y: 0 };
  distImageToClick: Position = { x: 0, y: 0 };

  setTransform(): void {
    const bound = document.getElementById('bound');
    if (!bound) return;
    bound.style.transform = `translate(${this.distBoundToImage.x}px, ${this.distBoundToImage.y}px) scale(${this.zoomFactor})`;

    this.triggerImageMoveEvent();
  }

  /**
   * Function runs when mouseclick inside image
   */
  handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    if (this.isImagePanning) return;

    this.distImageToClick = {
      x: event.clientX - this.distBoundToImage.x,
      y: event.clientY - this.distBoundToImage.y,
    };
    this.isImagePanning = true;
  }

  /**
   * Function runs when mouseclick stopped inside image.
   */
  handleMouseLeave(): void {
    if (!this.isImagePanning) return;

    const bound = document.getElementById('bound');
    if (!bound) return;
    if (!this.imageDimension || !this.containerDimension) return;

    this.snapbackImageOnOverflow();
    this.isImagePanning = false;
  }

  /**
   * Function runs when draggin image around
   * Happens only when MOUSE ON image.
   */
  handleMouseMove(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isImagePanning) return;

    this.distBoundToImage = {
      x: event.clientX - this.distImageToClick.x,
      y: event.clientY - this.distImageToClick.y,
    };

    this.setTransform();
  }

  handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const xs = (event.clientX - this.distBoundToImage.x) / this.zoomFactor;
    const ys = (event.clientY - this.distBoundToImage.y) / this.zoomFactor;
    const delta = event.deltaY || event.detail || (-event as any).wheelDelta;

    delta > 0
      ? (this.zoomFactor = Math.min(
          (this.zoomFactor *= 1.1),
          this.MAX_ZOOM_VALUE ** 0.5
        ))
      : (this.zoomFactor = Math.max(
          (this.zoomFactor /= 1.1),
          this.MIN_ZOOM_VALUE ** 0.5
        ));
    this.distBoundToImage = {
      x: event.clientX - xs * this.zoomFactor,
      y: event.clientY - ys * this.zoomFactor,
    };

    this.snapbackImageOnOverflow();
  }

  snapbackImageOnOverflow(): void {
    const OVERFLOW_TOLERANCE = 0.5;
    const isTopOverFlow =
      this.imageDimension.bottom -
        this.imageDimension.height * OVERFLOW_TOLERANCE <
      this.containerDimension.top;
    const isBottomOverflow =
      this.imageDimension.top +
        this.imageDimension.height * OVERFLOW_TOLERANCE >
      this.containerDimension.bottom;
    const isLeftOverflow =
      this.imageDimension.right -
        this.imageDimension.width * OVERFLOW_TOLERANCE <
      this.containerDimension.left;
    const isRightOverflow =
      this.imageDimension.left +
        this.imageDimension.width * OVERFLOW_TOLERANCE >
      this.containerDimension.right;

    if (
      isTopOverFlow ||
      isBottomOverflow ||
      isLeftOverflow ||
      isRightOverflow
    ) {
      this.imageOverflowStatus = ImageOverflow.OVERFLOW;
    } else {
      this.imageOverflowStatus = ImageOverflow.NO_OVERFLOW;
    }

    let targetX = this.distBoundToImage.x;
    let targetY = this.distBoundToImage.y;

    if (isTopOverFlow) {
      targetY = -(this.imageDimension.height * 0.5);
    }
    if (isBottomOverflow) {
      targetY =
        -(this.imageDimension.height * 0.5) + this.containerDimension.height;
    }
    if (isLeftOverflow) {
      targetX = -(this.imageDimension.width * 0.5);
    }
    if (isRightOverflow) {
      targetX =
        -(this.imageDimension.width * 0.5) + this.containerDimension.width;
    }

    const animateImage = (): void => {
      const dx = targetX - this.distBoundToImage.x;
      const dy = targetY - this.distBoundToImage.y;

      // FIXME: setting this below 1 might give an error where new animation input
      // is entered while old animation is playing, hanging the image pan.
      const EASING_FACTOR = 1;

      this.distBoundToImage.x += dx * EASING_FACTOR;
      this.distBoundToImage.y += dy * EASING_FACTOR;

      this.setTransform();
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        requestAnimationFrame(animateImage.bind(this));
      }
    };

    if (this.imageOverflowStatus !== ImageOverflow.NO_OVERFLOW) {
      animateImage.call(this);
    } else {
      this.setTransform();
    }
  }

  selectedPos: Position = { x: 0, y: 0 };

  receiveNewPositionEvent(newPos: Position): void {
    this.selectedPos = newPos;
  }
}

// Link for image scroll/zoom: https://dev.to/stackfindover/zoom-image-point-with-mouse-wheel-11n3
