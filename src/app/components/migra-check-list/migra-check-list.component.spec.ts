import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigraCheckListComponent } from './migra-check-list.component';
import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS } from '../../models/urls';
import { Checklist } from '../../models/checklist';
import { ControlChecklist } from '../../models/controlchecklist';
import { Modal } from '../../models/modal';


describe('MigraCheckListComponent', () => {
  let component: MigraCheckListComponent;
  let fixture: ComponentFixture<MigraCheckListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigraCheckListComponent ],
      providers: [EmpresasService,Servidor]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigraCheckListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

it('should contain checklists', () => {
  expect(component.checklists).toBe(Array);
});

});
