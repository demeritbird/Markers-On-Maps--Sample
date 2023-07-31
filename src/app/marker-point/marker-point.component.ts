import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  Renderer2,
  Input,
  OnInit,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-marker-point',
  templateUrl: './marker-point.component.html',
  styleUrls: ['./marker-point.component.scss'],
})
export class MarkerPointComponent implements AfterViewInit, OnChanges {
  @Input() imageView!: ElementRef;
  @Input() image: any;
  @Input() containerView!: ElementRef;
  @Input() container: any;

  @Input() scaleFactor: number = 1;
  @Input() imageLeft: number = 0; // Distance from left of image to point
  @Input() imageTop: number = 0; // Distance from top of image to point
  @Input() markerLeft: number = 0; // Distance from left of window to point
  @Input() markerTop: number = 0; // Distance from top of window to point

  constructor(public elRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.imageView.nativeElement, 'load', () => {
      this.initMarker();
    });
  }

  updateMarkerPosition(): void {
    this.image = this.imageView.nativeElement.getBoundingClientRect();
    this.container = this.containerView.nativeElement.getBoundingClientRect();

    this.markerLeft = this.image.left + this.imageLeft * this.scaleFactor;
    this.markerTop = this.image.top + this.imageTop * this.scaleFactor;

    console.log('marker', { left: this.markerLeft, top: this.markerTop });
    console.log('image', { left: this.imageLeft, top: this.imageTop });
  }

  initMarker(): void {
    // You can access the element reference here and perform any necessary actions.
    this.updateMarkerPosition();
  }

  ngOnChanges(): void {
    this.updateMarkerPosition();
  }
}
