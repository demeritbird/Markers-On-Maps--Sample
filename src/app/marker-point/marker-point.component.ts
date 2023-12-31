import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  Input,
  OnChanges,
  EventEmitter,
  Output,
} from '@angular/core';

import { EMPTY_DOM_RECT } from 'src/utils/constants';
import { Position } from 'src/utils/types';

@Component({
  selector: 'app-marker-point',
  templateUrl: './marker-point.component.html',
  styleUrls: ['./marker-point.component.scss'],
})
export class MarkerPointComponent implements AfterViewInit, OnChanges {
  @Input() imageView!: ElementRef;
  @Input() image: Omit<DOMRect, 'toJSON'> = EMPTY_DOM_RECT;
  @Input() containerView!: ElementRef;
  @Input() container: Omit<DOMRect, 'toJSON'> = EMPTY_DOM_RECT;

  @Input() zoomFactor: number = 1;
  @Input() distImageToMarker: Position = { x: 0, y: 0 };

  @Output() selectPosEvent: EventEmitter<Position> = new EventEmitter();

  distBoundToMarker: Position = { x: 0, y: 0 };

  constructor(public elRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.imageView.nativeElement, 'load', () => {
      this.initMarker();
    }); // this callback allows for a second argument, possibly for async loading.
  }

  updateMarkerPosition(): void {
    this.image = this.imageView.nativeElement.getBoundingClientRect();
    this.container = this.containerView.nativeElement.getBoundingClientRect();

    this.distBoundToMarker = {
      x:
        this.image['left'] -
        this.container.x +
        this.distImageToMarker.x * this.zoomFactor,
      y:
        this.image['top'] -
        this.container.y +
        this.distImageToMarker.y * this.zoomFactor,
    };
  }

  initMarker(): void {
    this.updateMarkerPosition();
  }

  ngOnChanges(): void {
    this.updateMarkerPosition();
  }

  emitNewPositionEvent(): void {
    this.selectPosEvent.emit(this.distBoundToMarker);
  }
}
