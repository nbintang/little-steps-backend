import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class MinAgeConstraint implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    const [minAge] = validationArguments.constraints;
    const birthDate = new Date(value);
    const today = new Date();
    let ageDiff = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      ageDiff--;
    }
    return ageDiff >= minAge;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Umur minimal ${validationArguments.constraints[0]} tahun`;
  }
}

export function MinAge(age: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'MinAge',
      target: object.constructor,
      propertyName,
      constraints: [age],
      options: validationOptions,
      validator: MinAgeConstraint,
    });
  };
}
