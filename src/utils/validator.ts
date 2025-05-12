import { FormulaElement, ValidationRule, ValidationRuleType, ValidationResult, ValidationError } from '../types';

/**
 * 公式验证器
 */
export class FormulaValidator {
    /**
     * 验证公式
     * @param formula 公式字符串
     * @param elements 公式元素
     * @param rules 验证规则
     * @returns 验证结果
     */
    static validate(
        formula: string,
        elements: FormulaElement[],
        rules: ValidationRule[]
    ): ValidationResult {
        const errors: ValidationError[] = [];

        // 应用所有规则
        for (const rule of rules) {
            const validationError = this.applyRule(formula, elements, rule);
            if (validationError) {
                errors.push(validationError);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 应用单个验证规则
     * @param formula 公式字符串
     * @param elements 公式元素
     * @param rule 验证规则
     * @returns 验证错误，如果验证通过则返回undefined
     */
    private static applyRule(
        formula: string,
        elements: FormulaElement[],
        rule: ValidationRule
    ): ValidationError | undefined {
        // 自定义验证函数
        if (rule.type === ValidationRuleType.CUSTOM && rule.validate) {
            if (!rule.validate(formula, elements)) {
                return {
                    message: rule.message || '验证失败',
                    ruleType: rule.type
                };
            }
            return undefined;
        }

        // 内置规则
        let isValid = true;
        let elementIndex: number | undefined = undefined;

        switch (rule.type) {
            case ValidationRuleType.BRACKETS_MATCH:
                const bracketResult = this.validateBracketsMatch(formula);
                isValid = bracketResult.isValid;
                elementIndex = bracketResult.elementIndex;
                break;

            case ValidationRuleType.OPERATORS_SURROUNDED:
                const operatorResult = this.validateOperatorsSurrounded(elements);
                isValid = operatorResult.isValid;
                elementIndex = operatorResult.elementIndex;
                break;

            case ValidationRuleType.NON_EMPTY:
                isValid = formula.trim().length > 0;
                break;

            case ValidationRuleType.HAS_EQUALS:
                isValid = formula.includes('=');
                break;

            case ValidationRuleType.NO_CONSECUTIVE_OPERANDS:
                const consecutiveResult = this.validateNoConsecutiveOperands(elements);
                isValid = consecutiveResult.isValid;
                elementIndex = consecutiveResult.elementIndex;
                break;
        }

        if (!isValid) {
            return {
                message: rule.message || this.getDefaultMessage(rule.type),
                ruleType: rule.type,
                elementIndex
            };
        }

        return undefined;
    }

    /**
     * 验证括号匹配
     */
    private static validateBracketsMatch(formula: string): { isValid: boolean; elementIndex?: number } {
        const stack: { char: string, index: number }[] = [];
        const brackets = {
            '(': ')',
            '[': ']',
            '{': '}'
        };

        for (let i = 0; i < formula.length; i++) {
            const char = formula[i];

            // 左括号压栈
            if (char === '(' || char === '[' || char === '{') {
                stack.push({ char, index: i });
            }
            // 右括号出栈
            else if (char === ')' || char === ']' || char === '}') {
                if (stack.length === 0) {
                    return { isValid: false, elementIndex: i };
                }

                const lastBracket = stack.pop();
                if (!lastBracket || brackets[lastBracket.char as keyof typeof brackets] !== char) {
                    return { isValid: false, elementIndex: i };
                }
            }
        }

        // 如果栈不为空，说明有未匹配的左括号
        if (stack.length > 0) {
            return { isValid: false, elementIndex: stack[0].index };
        }

        return { isValid: true };
    }

    /**
     * 验证操作符周围必须有操作数
     */
    private static validateOperatorsSurrounded(elements: FormulaElement[]): { isValid: boolean; elementIndex?: number } {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            if (element.type === 'operator' && element.value !== '=' && element.value !== '±') {
                // 检查前后是否有操作数
                const hasPrev = i > 0 && this.isOperand(elements[i - 1]);
                const hasNext = i < elements.length - 1 && this.isOperand(elements[i + 1]);

                // 如果是一元操作符（如负号），只需检查后面有操作数
                const isUnary = element.value === '-' || element.value === '+';

                if ((!isUnary && (!hasPrev || !hasNext)) || (isUnary && !hasNext)) {
                    return { isValid: false, elementIndex: i };
                }
            }
        }

        return { isValid: true };
    }

    /**
     * 判断元素是否为操作数（数字、变量等）
     */
    private static isOperand(element: FormulaElement): boolean {
        return element.type === 'number' || element.type === 'variable' ||
            element.type === 'function' || element.type === 'bracket';
    }

    /**
     * 验证操作数不能连续
     */
    private static validateNoConsecutiveOperands(elements: FormulaElement[]): { isValid: boolean; elementIndex?: number } {
        for (let i = 1; i < elements.length; i++) {
            const currentElement = elements[i];
            const prevElement = elements[i - 1];

            // 如果当前元素和前一个元素都是操作数（数字、变量）
            if (this.isOperand(currentElement) && this.isOperand(prevElement)) {
                return {
                    isValid: false,
                    elementIndex: i
                };
            }
        }

        return { isValid: true };
    }

    /**
     * 获取默认错误消息
     */
    private static getDefaultMessage(ruleType: ValidationRuleType): string {
        switch (ruleType) {
            case ValidationRuleType.BRACKETS_MATCH:
                return '括号不匹配';
            case ValidationRuleType.OPERATORS_SURROUNDED:
                return '操作符两侧必须有操作数';
            case ValidationRuleType.NON_EMPTY:
                return '公式不能为空';
            case ValidationRuleType.HAS_EQUALS:
                return '公式必须包含等号';
            case ValidationRuleType.NO_CONSECUTIVE_OPERANDS:
                return '操作数不能连续出现，需要用运算符连接';
            case ValidationRuleType.CUSTOM:
                return '自定义验证失败';
            default:
                return '验证失败';
        }
    }
} 