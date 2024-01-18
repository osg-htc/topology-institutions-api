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
    } else {
      this.instService.getNextInstitutionId().subscribe(({next_id})=>this.institution.id = next_id)
    }
  }

  extractErrorMessage(err: any) {
    // Try to extract a meaningful error message out of the object returned by the server
    return err?.error?.detail[0]?.msg || err?.error?.detail || err.message 
  }

  sanitizeFormData() {
    // clean up form data prior to submission
    let {name, id, ror_id } = this.institution
    this.institution = { name: name.trim(), id: id.trim(), ror_id: ror_id?.trim() }
  }

  submitInstitution(): void {
    this.sanitizeFormData()

    let submitAction;
    if(this.institutionId) {
      submitAction = this.instService.updateInstitution(this.institutionId, this.institution)
    } else {
      submitAction = this.instService.createInstitution(this.institution)
    }

    submitAction.subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => this.errorMessage = this.extractErrorMessage(err) 
    })
  }

  deleteInstitution(): void {
    this.instService.deleteInstitution(this.institutionId!).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => this.errorMessage = this.extractErrorMessage(err)
    })
  }

}
