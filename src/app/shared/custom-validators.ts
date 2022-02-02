import { AbstractControl } from '@angular/forms';

export function validatePANNumber(control: AbstractControl) {
  const regexOne = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (
    control.value.length &&
    (!regexOne.test(control.value) || control.value.length != 10)
  ) {
    return { invalidPanNumber: true };
  } else {
    return null;
  }
}
