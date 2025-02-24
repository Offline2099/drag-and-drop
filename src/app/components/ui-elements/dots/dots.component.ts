import { Component, HostBinding, input, computed } from '@angular/core';

@Component({
  selector: 'app-dots',
  imports: [],
  templateUrl: './dots.component.html',
  styleUrl: './dots.component.scss'
})
export class DotsComponent {

  @HostBinding('class.before-5') get before5(): boolean { return this.amount() < 5 }
  @HostBinding('class.before-10') get before10(): boolean { return this.amount() < 10 }

  amount = input.required<number>();
  dots = computed<unknown[]>(() => Array(this.amount()));

}
