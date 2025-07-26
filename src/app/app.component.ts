import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core'
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterEvent, RouterOutlet,
} from '@angular/router'
import { MessageService } from 'primeng/api'
import { fromEvent, map, merge, of, Subscription } from 'rxjs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy, AfterContentChecked {
  title: any = document.querySelector('#appTitle')
  ready: boolean = false
  networkStatus: boolean = false
  networkStatus$: Subscription = Subscription.EMPTY

  constructor(
    private changeDetector: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router,
  ) {
    this.router.events.subscribe((e: any) => {
      this.navigationInterceptor(e)
    })

    localStorage.setItem('phone_pattern', '^[0-9]{9}$')
  }

  ngOnInit(): void {
    this.onNetworkStatusChange()
  }

  ngOnDestroy(): void {
    this.networkStatus$.unsubscribe()
  }

  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
    }
    if (event instanceof NavigationEnd) {
      setTimeout(() => {
      }, 1000)
    }

    if (event instanceof NavigationCancel) {
      setTimeout(() => {
      }, 1000)
    }
    if (event instanceof NavigationError) {
      setTimeout(() => {
      }, 1000)
    }
  }

  onNetworkStatusChange() {
    this.networkStatus = navigator.onLine
    this.networkStatus$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline'),
    )
      .pipe(map(() => navigator.onLine))
      .subscribe((status) => {
        this.networkStatus = status
        if (status) {
          setTimeout(() => {
            this.messageService.clear('internet-check')
          }, 4000)
        } else {
          this.messageService.clear('internet-check')
          this.messageService.add({
            key: 'internet-check',
            sticky: true,
          })
        }
      })
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges()
  }


}
