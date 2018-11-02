import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule, MatExpansionModule } from '@angular/material';
import { LayoutModule } from '@angular/cdk/layout';
import { ContentComponent } from './content/content.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ToolsComponent } from './tools/tools.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Globals } from './globals';




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
    MatExpansionModule,
    MatButtonToggleModule
  ],
  providers: [Globals],
  bootstrap: [AppComponent]
})
export class AppModule { }
