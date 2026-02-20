import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenresPage } from './genres.page';

describe('GenresPage', () => {
  let component: GenresPage;
  let fixture: ComponentFixture<GenresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GenresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
