import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from '../services/shared-data.service';

@Component({
  selector: 'app-comp-a',
  standalone: false,
  templateUrl: './comp-a.component.html',
  styleUrl: './comp-a.component.css'
})
export class CompAComponent {

  inputA: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedData: SharedDataService
  ) { }

  ngOnInit() {
    this.inputA = this.sharedData.inputA;
  }

  ngOnDestroy() {
    this.sharedData.inputA = this.inputA;
  }

  goToCompB() {
    this.router.navigate(['demo/comp-b']);
  }


}
