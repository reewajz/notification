import { ModelConstraintViolation } from './ModelConstraintViolation';

export abstract class ValidationResult {
    hasViolations: boolean;
    violations: Array<ModelConstraintViolation>;
}
