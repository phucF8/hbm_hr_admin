import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-comp-b',
  standalone: false,
  templateUrl: './comp-b.component.html',
  styleUrl: './comp-b.component.css'
})
export class CompBComponent {

inputB: string = '';

constructor(private router: Router, private route: ActivatedRoute) { }

  goToCompA() {
    this.router.navigate(['demo/comp-a']);
  }


}
