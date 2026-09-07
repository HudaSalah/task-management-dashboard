import { Injectable, Service, signal } from '@angular/core';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private usersSignal = signal<User[]>([
    { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
    { id: 'user-002', name: 'Sarah Smith', avatar: 'SS', email: 'sarah.smith@company.com' },
    { id: 'user-003', name: 'Mike Johnson', avatar: 'MJ', email: 'mike.johnson@company.com' },
    { id: 'user-004', name: 'Emily Davis', avatar: 'ED', email: 'emily.davis@company.com' }
  ]);
 
  users = this.usersSignal.asReadonly();
}
