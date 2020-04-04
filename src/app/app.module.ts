import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductComponent } from './product/product.component';
import { RestserviceService } from './restservice.service';
import { HttpClientModule } from '@angular/common/http';
import { BigvaluePipe } from './bigvalue.pipe';
import { ModalComponent } from './modal/modal.component';
import { ToastrModule } from 'ngx-toastr';
import { NotificationService } from './notification.service';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatProgressBarModule} from '@angular/material/progress-bar';


@NgModule({
  declarations: [
    AppComponent,
    ProductComponent,
    BigvaluePipe,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    FormsModule,
    BrowserAnimationsModule,
    MatProgressBarModule
  ],
  providers: [RestserviceService, NotificationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
