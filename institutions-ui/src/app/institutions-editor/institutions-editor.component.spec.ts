import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionsEditorComponent } from './institutions-editor.component';

describe('InstitutionsEditorComponent', () => {
  let component: InstitutionsEditorComponent;
  let fixture: ComponentFixture<InstitutionsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstitutionsEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstitutionsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
