import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadInformeComponent } from './download-informe.component';

describe('DownloadInformeComponent', () => {
  let component: DownloadInformeComponent;
  let fixture: ComponentFixture<DownloadInformeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadInformeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadInformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
