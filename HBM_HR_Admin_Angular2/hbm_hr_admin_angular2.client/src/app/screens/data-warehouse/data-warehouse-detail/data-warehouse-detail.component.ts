import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataWarehouseItem } from '../models/data-warehouse.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-data-warehouse-detail',
  standalone: true,
  templateUrl: './data-warehouse-detail.component.html',
  styleUrls: ['./data-warehouse-detail.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
})
export class DataWarehouseDetailComponent {

  constructor(
    private dialogRef: MatDialogRef<DataWarehouseDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DataWarehouseItem
  ) { }

  closePopup() {
    this.dialogRef.close();
  }

}
