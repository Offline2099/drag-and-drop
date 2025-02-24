import { Component, HostBinding, input } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent {

  @HostBinding('class.checked') get _isChecked() { return this.isChecked() }
  
  isChecked = input.required<boolean>();
  label = input<string>('');

}
