import { Component, OnInit } from '@angular/core';
import { ThongBaoService, ThongBao } from '../../services/thong-bao.service';

@Component({
  selector: 'app-thong-bao',
  templateUrl: './thong-bao.component.html',
  styleUrls: ['./thong-bao.component.css'],
  standalone: false,
})
export class ThongBaoComponent implements OnInit {
  thongBaoList: ThongBao[] = [];

  constructor(private thongBaoService: ThongBaoService) {}

  ngOnInit(): void {
    this.thongBaoService.getThongBao().subscribe(data => {
      this.thongBaoList = data;
    });
  }
}
