import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  Input,
  OnChanges,
} from '@angular/core';
import { EMPTY_DOM_RECT, Position } from 'src/types';

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
  @Input() posImageToMarkerDist: Position = { x: 0, y: 0 };

  posBountToMarkerDist: Position = { x: 0, y: 0 };

  constructor(public elRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.imageView.nativeElement, 'load', () => {
      this.initMarker();
    }); // this callback allows for a second argument, possibly for async loading.
  }

  updateMarkerPosition(): void {
    this.image = this.imageView.nativeElement.getBoundingClientRect();
    this.container = this.containerView.nativeElement.getBoundingClientRect();

    this.posBountToMarkerDist.x =
      this.image['left'] + this.posImageToMarkerDist.x * this.zoomFactor;
    this.posBountToMarkerDist.y =
      this.image['top'] + this.posImageToMarkerDist.y * this.zoomFactor;
  }

  initMarker(): void {
    this.updateMarkerPosition();
  }

  ngOnChanges(): void {
    this.updateMarkerPosition();
  }
}
