import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TbchitietDialogComponent } from './tbchitiet-dialog.component';

describe('TbchitietDialogComponent', () => {
  let component: TbchitietDialogComponent;
  let fixture: ComponentFixture<TbchitietDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TbchitietDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TbchitietDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
