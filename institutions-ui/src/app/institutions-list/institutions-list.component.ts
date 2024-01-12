import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Institution } from '../institutions/institutions.models';
import { InstitutionsService } from '../institutions/institutions.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-institutions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './institutions-list.component.html',
  styleUrl: './institutions-list.component.scss'
})
export class InstitutionsListComponent implements OnInit{
  institutions : Institution[] = [
    {name:"University of Wisconsin-Madison", id: "https://osg-htc.org/iid/01y2jtd41", ror_id: "https://ror.org/01y2jtd41"}
  ]

  
  constructor(private instService: InstitutionsService, private router: Router) {}

  ngOnInit() {
    this.instService.getInstitutions().subscribe(institutions=>this.institutions = institutions)
  }

  editRouteFor(inst: Institution) {
    return `edit/${this.instService.shortId(inst.id)}`
  }
}
