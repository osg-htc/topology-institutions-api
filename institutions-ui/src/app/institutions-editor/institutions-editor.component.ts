import { Component, Input, OnInit } from '@angular/core';
import { InstitutionsService } from '../institutions/institutions.service';
import { Institution } from '../institutions/institutions.models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';


@Component({
  selector: 'app-institutions-editor',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './institutions-editor.component.html',
  styleUrl: './institutions-editor.component.scss'
})
export class InstitutionsEditorComponent implements OnInit {

  OSG_ID_PREFIX = "https://osg-htc.org/iid/"
  ROR_ID_PREFIX = "https://ror.org/"

  institutionId?: string;

  institution: Institution = {name:'', id: this.OSG_ID_PREFIX , ror_id: this.ROR_ID_PREFIX };

  errorMessage?: string;

  constructor(private instService: InstitutionsService, private router: Router) {}

  @Input()
  set id(instId: string) {
    console.log(instId)
    this.institutionId = instId;
  }
  
  ngOnInit(): void {
    if(this.institutionId) {
      this.instService.getInstitutionDetails(this.institutionId).subscribe(inst=>this.institution=inst)
    }
  }

  submitInstitution(): void {
    let submitAction;
    if(this.institutionId) {
      submitAction = this.instService.updateInstitution(this.institutionId, this.institution)
    } else {
      submitAction = this.instService.createInstitution(this.institution)
    }

    submitAction.subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => this.errorMessage = err.message || err.msg
    })
  }

  deleteInstitution(): void {
    this.instService.deleteInstitution(this.institutionId!).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => this.errorMessage = err.message || err.msg
    })
  }

}
