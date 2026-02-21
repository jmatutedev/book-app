import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomListsPage } from './custom-lists.page';

describe('CustomListsPage', () => {
  let component: CustomListsPage;
  let fixture: ComponentFixture<CustomListsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomListsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
