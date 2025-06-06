import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-comp-tong',
  standalone: false,
  templateUrl: './comp-tong.component.html',
  styleUrl: './comp-tong.component.css'
})
export class CompTongComponent {

  constructor(private router: Router, private route: ActivatedRoute) { }

  goToCompA() {
    this.router.navigate(['comp-a'], { relativeTo: this.route });
  }

  goToCompB() {
    this.router.navigate(['comp-b'], { relativeTo: this.route });
  }

}
