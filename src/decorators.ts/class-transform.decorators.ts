import { cloneDeep } from 'lodash';
import { Transform } from 'class-transformer';

export function Default(defaultValue: unknown): PropertyDecorator {
  return Transform(
    ({ value }: { value: unknown }) => value ?? cloneDeep(defaultValue),
  );
}
