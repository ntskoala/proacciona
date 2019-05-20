import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparaRecetaComponent } from './prepara-receta.component';

describe('PreparaRecetaComponent', () => {
  let component: PreparaRecetaComponent;
  let fixture: ComponentFixture<PreparaRecetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreparaRecetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreparaRecetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
