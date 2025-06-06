import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorUserReportComponent } from './error-user-report.component';

describe('ErrorUserReportComponent', () => {
  let component: ErrorUserReportComponent;
  let fixture: ComponentFixture<ErrorUserReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorUserReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorUserReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
