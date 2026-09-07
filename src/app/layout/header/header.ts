import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatIconModule, MatButtonModule],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  userInitials = input<string>('JD');
}
