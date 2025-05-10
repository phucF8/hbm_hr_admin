import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-user-form',
  standalone: false,
  templateUrl: './search-user-form.component.html',
  styleUrl: './search-user-form.component.css'
})

export class SearchUserFormComponent {
  @Input() donvis: any[] = [];
  @Input() selectedDonVi: any;
  @Input() selectedUsers: any[] = [];
  @Input() filteredUsers: any[] = [];
  @Input() isSearching: boolean = false;

  @Output() donViSelected = new EventEmitter<any>();
  @Output() userSelected = new EventEmitter<any>();
  @Output() userRemoved = new EventEmitter<any>();
  @Output() searchUser = new EventEmitter<string>();
  @Output() blurInput = new EventEmitter<string>();

  searchUserForm: FormGroup;
  isFocused: boolean = false;
  showDonVisPopup: boolean = false;

  constructor(private fb: FormBuilder) {
    this.searchUserForm = this.fb.group({
      search: ['']
    });
  }

  onSubmit() {
    const searchValue = this.searchUserForm.value.search;
    this.searchUser.emit(searchValue);
  }

  selectDonVi(item: any) {
    this.donViSelected.emit(item);
  }

  selectUser(user: any) {
    this.userSelected.emit(user);
  }

  removeUser(user: any) {
    this.userRemoved.emit(user);
  }

  onBlurInput(value: string) {
    this.blurInput.emit(value);
    this.isFocused = false;
  }
}
