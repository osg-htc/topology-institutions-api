import { Routes } from '@angular/router';
import { InstitutionsComponent } from './institutions-list/institutions.component';
import { InstitutionsEditorComponent } from './institutions-editor/institutions-editor.component';

export const routes: Routes = [
  {path: '', component: InstitutionsComponent },
  {path: 'add', component: InstitutionsEditorComponent },
  {path: 'edit/:id', component: InstitutionsEditorComponent }
];
