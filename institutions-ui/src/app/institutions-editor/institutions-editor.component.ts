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

  institutionId?: string;

  institution: Institution = {name:'', id:'', ror_id:''};

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
      error: (err) => console.error(err)
    })
  }

  deleteInstitution(): void {
    this.instService.deleteInstitution(this.institutionId!).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => console.error(err)
    })
  }

}
