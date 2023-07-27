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
  @Input() elementView!: ElementRef;
  @Input() image: any;
  @Input() imageLeft: number = 0;
  @Input() imageTop: number = 0;

  markerLeft = 0; // Distance from left of window
  markerTop = 0; // Distance from top of window.

  constructor(public elRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.elementView.nativeElement, 'load', () => {
      this.initMarker();
    });
  }
  initMarker(): void {
    // You can access the element reference here and perform any necessary actions.
    this.image = this.elementView.nativeElement.getBoundingClientRect();

    this.markerLeft = this.image.left + this.imageLeft;
    this.markerTop = this.image.top + this.imageTop;
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.image) {
      // You can access the element reference here and perform any necessary actions.
      this.markerLeft = this.image.left + this.imageLeft;
      this.markerTop = this.image.top + this.imageTop;
    }
  }
}
