import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'pointer--demo';
  markerLeft = 0; // Distance from left of window
  markerTop = 0; // Distance from top of window.
  imageLeft = 350; // Initial left of dot from top-left of image.
  imageTop = 100; // Initial top of dot from top-left of image.
  imageDimension: any;

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

  @ViewChild('ide', { static: true }) elementView!: ElementRef;

  constructor(public elRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.elementView.nativeElement, 'load', () => {
      this.initMarker();
    });
  }

  initMarker(): void {
    this.imageDimension =
      this.elementView.nativeElement.getBoundingClientRect();
    // You can access the element reference here and perform any necessary actions.

    this.markerLeft = this.imageDimension.left + this.imageLeft;
    this.markerTop = this.imageDimension.top + this.imageTop;
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.imageDimension =
      this.elementView.nativeElement.getBoundingClientRect();
    if (this.imageDimension) {
      // You can access the element reference here and perform any necessary actions.
      this.markerLeft = this.imageDimension.left + this.imageLeft;
      this.markerTop = this.imageDimension.top + this.imageTop;
    }
  }

  handleClick(event: MouseEvent): void {
    // const imageElement = event.target as HTMLImageElement;
    //const imageElement = document.querySelector('.image') as HTMLImageElement;
    const imageElement = document.getElementById('ide') as HTMLImageElement;
    // const rect = imageElement.getBoundingClientRect();
    const xPosition = event.clientX;
    const yPosition = event.clientY;

    this.markerLeft = xPosition;
    this.markerTop = yPosition;
  }
}
