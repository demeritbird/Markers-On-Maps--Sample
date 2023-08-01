import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarkerPointComponent } from './marker-point/marker-point.component';
import { MarkerMapComponent } from './marker-map/marker-map.component';

@NgModule({
  declarations: [
    AppComponent,
    MarkerPointComponent,
    MarkerMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
