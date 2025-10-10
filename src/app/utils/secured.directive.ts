import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/service/auth.service';
import { Subscription, fromEvent } from 'rxjs';

@Directive({
  selector: '[secured]',
  standalone: true,
})
export class SecuredDirective implements OnInit, OnDestroy {
  @Input('permission') permission: string | undefined;
  private storageListener: Subscription | undefined;

  constructor(
    private el: ElementRef,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.checkPermission();

    this.storageListener = fromEvent(window, 'storage').subscribe(() => {
      this.checkPermission();
    });
  }

  ngOnDestroy() {
    if (this.storageListener) {
      this.storageListener.unsubscribe();
    }
  }

  private checkPermission() {
    if (!this.authService.hasPermission(this.permission!)) {
      this.el.nativeElement.style.display = 'none';
    } else {
      this.el.nativeElement.style.display = '';
    }
  }
}
