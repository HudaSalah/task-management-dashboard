import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Fails if the control's value is empty or contains only whitespace.
 * `Validators.required` alone would accept a title of "   ", which is
 * visually indistinguishable from an empty task title.
 */
export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '') as string;
    return value.trim().length === 0 ? { whitespace: true } : null;
  };
}

/**
 * Fails if the given date string (YYYY-MM-DD, as produced by a
 * `<input type="date">` or Material datepicker) is earlier than today.
 * Used on the "due date" field when creating a task — you shouldn't be
 * able to create a task that's already overdue on day one.
 */
export function notInPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // let `Validators.required` handle empty values
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(control.value);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() < today.getTime() ? { pastDate: true } : null;
  };
}
