import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { InstitutionsService } from './institutions/institutions.service';
import { mergeMap } from 'rxjs';
import { Institution } from './institutions/institutions.models';
import { InstitutionsComponent } from './institutions/institutions.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InstitutionsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'institutions-ui';

}
