import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule, MatExpansionModule } from '@angular/material';
import { LayoutModule } from '@angular/cdk/layout';
import { ContentComponent } from './content/content.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ToolsComponent } from './tools/tools.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ContentComponent,
    ToolsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
