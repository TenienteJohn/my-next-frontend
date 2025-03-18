// src/validators/product-option-validator.ts

export interface ProductOptionValidationError {
  field: string;
  message: string;
}

export class ProductOptionValidator {
  private errors: ProductOptionValidationError[] = [];

  validateProductOption(option: {
    product_id: number;
    name: string;
    required: boolean;
    multiple: boolean;
    max_selections?: number;
    items?: Array<{
      name: string;
      price_addition?: number;
      available?: boolean;
    }>;
  }): boolean {
    this.errors = [];

    // Validar product_id
    if (!option.product_id || option.product_id <= 0) {
      this.addError('product_id', 'ID de producto inválido');
    }

    // Validar nombre
    if (!option.name || option.name.trim() === '') {
      this.addError('name', 'El nombre de la opción es obligatorio');
    }

    // Validar múltiples selecciones
    if (option.multiple) {
      if (!option.max_selections || option.max_selections <= 0) {
        this.addError('max_selections', 'Debe especificar un número máximo de selecciones mayor a 0');
      }
    }

    // Validar items
    if (option.items && option.items.length > 0) {
      if (option.items.length > 10) {
        this.addError('items', 'No puede tener más de 10 items por opción');
      }

      option.items.forEach((item, index) => {
        // Validar nombre de cada item
        if (!item.name || item.name.trim() === '') {
          this.addError(`items[${index}].name`, 'El nombre del item es obligatorio');
        }

        // Validar precio adicional
        if (item.price_addition && item.price_addition < 0) {
          this.addError(`items[${index}].price_addition`, 'El precio adicional no puede ser negativo');
        }
      });
    }

    return this.errors.length === 0;
  }

  private addError(field: string, message: string) {
    this.errors.push({ field, message });
  }

  getErrors(): ProductOptionValidationError[] {
    return this.errors;
  }
}

// Función de ayuda para validación rápida
export function validateProductOption(option: any): {
  isValid: boolean;
  errors?: ProductOptionValidationError[];
} {
  const validator = new ProductOptionValidator();
  const isValid = validator.validateProductOption(option);

  return {
    isValid,
    errors: isValid ? undefined : validator.getErrors()
  };
}