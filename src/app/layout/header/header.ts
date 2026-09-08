import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  imports: [MatIconModule, MatButtonModule, ReactiveFormsModule],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
   private destroyRef = inject(DestroyRef);
 
  /** Initials shown in the avatar circle, e.g. "JD". */
  userInitials = input<string>('JD');
 
  /** Emits the trimmed search text, debounced by 250ms and only on actual changes. */
  search = output<string>();
 
  searchControl = new FormControl('', { nonNullable: true });
 
  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        // Unsubscribes automatically when this component is destroyed
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => this.search.emit(value.trim()));
  }
}
