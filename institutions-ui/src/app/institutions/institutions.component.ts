import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Institution } from './institutions.models';
import { InstitutionsService } from './institutions.service';

@Component({
  selector: 'app-institutions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './institutions.component.html',
  styleUrl: './institutions.component.scss'
})
export class InstitutionsComponent implements OnInit{
  institutions : Institution[] = [
    {name:"University of Wisconsin-Madison", id: "https://osg-htc.org/iid/01y2jtd41", ror_id: "https://ror.org/01y2jtd41"}
  ]

  
  constructor(private instService: InstitutionsService) {}

  ngOnInit() {
    this.instService.getInstitutions().subscribe(institutions=>this.institutions = institutions)
  }

}
