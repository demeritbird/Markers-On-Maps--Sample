import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
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
  distBoundToImage: Position = { x: 0, y: 0 };

  constructor(public elRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.imageView.nativeElement, 'load', () => {
      this.initLayout();
    });
  }

  initLayout(): void {
    const initImageDimension =
      this.imageView.nativeElement.getBoundingClientRect();
    const initContainerDimension =
      this.containerView.nativeElement.getBoundingClientRect();

    this.distBoundToImage = {
      x: initImageDimension.x - initContainerDimension.x,
      y: initImageDimension.y - initContainerDimension.y,
    };
  }

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
  distInitImageToCurImageCenter: Position = { x: 0, y: 0 };
  distInitScreenToClick: Position = { x: 0, y: 0 };

  setTransform(): void {
    const bound = document.getElementById('bound');
    if (!bound) return;
    bound.style.transform = `translate(${this.distInitImageToCurImageCenter.x}px, ${this.distInitImageToCurImageCenter.y}px) scale(${this.zoomFactor})`;

    this.triggerImageMoveEvent();
  }

  /**
   * Function runs when mouseclick inside image
   */
  handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    if (this.isImagePanning) return;

    this.distInitScreenToClick = {
      x: event.clientX - this.distInitImageToCurImageCenter.x,
      y: event.clientY - this.distInitImageToCurImageCenter.y,
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

    this.distInitImageToCurImageCenter = {
      x: event.clientX - this.distInitScreenToClick.x,
      y: event.clientY - this.distInitScreenToClick.y,
    };

    this.setTransform();
  }

  handleWheel(event: WheelEvent): void {
    event.preventDefault();

    if (this.isImagePanning) return;
    const xs =
      (event.clientX - this.distInitImageToCurImageCenter.x) / this.zoomFactor;
    const ys =
      (event.clientY - this.distInitImageToCurImageCenter.y) / this.zoomFactor;
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
    this.distInitImageToCurImageCenter = {
      x: event.clientX - xs * this.zoomFactor,
      y: event.clientY - ys * this.zoomFactor,
    };

    this.snapbackImageOnOverflow();
  }

  snapbackImageOnOverflow(): void {
    const OVERFLOW_TOLERANCE = 0.5 + 0.05;
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

    let targetX = this.distInitImageToCurImageCenter.x;
    let targetY = this.distInitImageToCurImageCenter.y;

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
      let dx = targetX - this.distInitImageToCurImageCenter.x;
      let dy = targetY - this.distInitImageToCurImageCenter.y;

      if (isTopOverFlow || isBottomOverflow) {
        dy =
          targetY -
          this.distInitImageToCurImageCenter.y -
          this.distBoundToImage.y;
      }
      if (isLeftOverflow || isRightOverflow) {
        dx =
          targetX -
          this.distInitImageToCurImageCenter.x -
          this.distBoundToImage.x;
      }

      this.distInitImageToCurImageCenter.x += dx;
      this.distInitImageToCurImageCenter.y += dy;

      this.setTransform();
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
