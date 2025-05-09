import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestdemoComponent } from './testdemo.component';

describe('TestdemoComponent', () => {
  let component: TestdemoComponent;
  let fixture: ComponentFixture<TestdemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestdemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestdemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
