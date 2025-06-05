import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAquariumComponent } from './add-aquarium.component';

describe('AddAquariumComponent', () => {
  let component: AddAquariumComponent;
  let fixture: ComponentFixture<AddAquariumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAquariumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAquariumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
