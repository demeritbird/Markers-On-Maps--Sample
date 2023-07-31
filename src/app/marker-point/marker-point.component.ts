import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  Renderer2,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-marker-point',
  templateUrl: './marker-point.component.html',
  styleUrls: ['./marker-point.component.scss'],
})
export class MarkerPointComponent implements AfterViewInit {
  @Input() imageView!: ElementRef;
  @Input() image: any;
  @Input() containerView!: ElementRef;
  @Input() container: any;

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
  initMarker(): void {
    // You can access the element reference here and perform any necessary actions.
    this.image = this.imageView.nativeElement.getBoundingClientRect();
    this.container = this.containerView.nativeElement.getBoundingClientRect();

    this.markerLeft = this.image.left + this.imageLeft;
    this.markerTop = this.image.top + this.imageTop;

    console.log('marker', { left: this.markerLeft, top: this.markerTop });
    console.log('image', { left: this.imageLeft, top: this.imageTop });
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.image) {
      // You can access the element reference here and perform any necessary actions.
      this.markerLeft = this.image.left + this.imageLeft;
      this.markerTop = this.image.top + this.imageTop;
    }

    console.log('marker', { left: this.markerLeft, top: this.markerTop });
    console.log('image', { left: this.imageLeft, top: this.imageTop });
  }
}
