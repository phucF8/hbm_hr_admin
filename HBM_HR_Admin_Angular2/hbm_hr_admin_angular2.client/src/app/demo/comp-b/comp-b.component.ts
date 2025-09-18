import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-comp-b',
  standalone: true,
  templateUrl: './comp-b.component.html',
  styleUrl: './comp-b.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule], 
})
export class CompBComponent {

inputB: string = '';

constructor(private router: Router, private route: ActivatedRoute) { }

  goToCompA() {
    this.router.navigate(['demo/comp-a']);
  }


}
