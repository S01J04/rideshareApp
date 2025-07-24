// This file provides a custom implementation of the zodResolver
// to avoid import issues in the codebase

import type { ZodSchema } from 'zod';
import type { Resolver } from 'react-hook-form';

// Custom implementation of zodResolver that doesn't rely on @hookform/resolvers
export const zodResolver = <T>(schema: ZodSchema<T>): Resolver<T> => {
  return async (values, context, options) => {
    try {
      const result = await schema.parseAsync(values);
      return {
        values: result,
        errors: {}
      };
    } catch (error) {
      const formErrors = {};

      if (error.errors) {
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!formErrors[path]) {
            formErrors[path] = {
              type: 'validation',
              message: err.message
            };
          }
        });
      }

      return {
        values: {},
        errors: formErrors
      };
    }
  };
};

export default zodResolver;
