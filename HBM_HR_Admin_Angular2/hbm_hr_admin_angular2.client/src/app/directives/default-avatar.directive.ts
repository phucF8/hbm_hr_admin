import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[defaultAvatar]',
  standalone: true
})
export class DefaultAvatarDirective implements OnInit {
  @Input('defaultAvatar') defaultImg: string = 'images/avatar_default.png';

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    const img = this.el.nativeElement;
    if (!img.src || img.src.trim() === '') {
      img.src = this.defaultImg;
    }
  }

  @HostListener('error')
  onError() {
    this.el.nativeElement.src = this.defaultImg;
  }
}
