import { Routes } from '@angular/router';
import { InstitutionsListComponent } from './institutions-list/institutions-list.component';
import { InstitutionsEditorComponent } from './institutions-editor/institutions-editor.component';

export const routes: Routes = [
  {path: '', component: InstitutionsListComponent },
  {path: 'add', component: InstitutionsEditorComponent },
  {path: 'edit/:id', component: InstitutionsEditorComponent }
];
