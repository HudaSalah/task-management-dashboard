import { TestBed } from '@angular/core/testing';
import { UserService } from './user-service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('provides a non-empty list of users', () => {
    expect(service.users().length).toBeGreaterThan(0);
  });

  it('gives every user a non-empty id, name, avatar, and a valid-looking email', () => {
    for (const user of service.users()) {
      expect(user.id).toBeTruthy();
      expect(user.name).toBeTruthy();
      expect(user.avatar).toBeTruthy();
      expect(user.email).toContain('@');
    }
  });

  it('gives every user a unique id', () => {
    const ids = service.users().map((u) => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
