import { ElementType, FormulaElement } from '../types';
import { generateId } from './dom';

/**
 * 公式解析器类
 */
export class FormulaParser {
    /**
     * 将字符串解析为公式元素树
     * @param formula 公式字符串
     * @returns 公式元素树
     */
    static parse(formula: string): FormulaElement[] {
        if (!formula) {
            return [];
        }

        const elements: FormulaElement[] = [];
        let currentIndex = 0;

        while (currentIndex < formula.length) {
            const char = formula[currentIndex];

            // 解析数字
            if (/[0-9.]/.test(char)) {
                let numStr = '';
                let j = currentIndex;

                while (j < formula.length && /[0-9.]/.test(formula[j])) {
                    numStr += formula[j];
                    j++;
                }

                elements.push({
                    type: ElementType.NUMBER,
                    value: numStr,
                    id: generateId()
                });

                currentIndex = j;
                continue;
            }

            // 解析变量（字母）
            if (/[a-zA-Z]/.test(char)) {
                // 检查是否是预定义函数名
                if (formula.substring(currentIndex).match(/^(sin|cos|tan|log|ln)\(/)) {
                    const match = formula.substring(currentIndex).match(/^(sin|cos|tan|log|ln)/);
                    if (match) {
                        elements.push({
                            type: ElementType.FUNCTION,
                            value: match[0],
                            id: generateId()
                        });
                        currentIndex += match[0].length;
                        continue;
                    }
                }

                // 处理为单个字母变量
                elements.push({
                    type: ElementType.VARIABLE,
                    value: char,
                    id: generateId()
                });
                currentIndex++;
                continue;
            }

            // 解析运算符
            if (['+', '-', '×', '÷', '*', '/', '='].includes(char)) {
                elements.push({
                    type: ElementType.OPERATOR,
                    value: char,
                    id: generateId()
                });
                currentIndex++;
                continue;
            }

            // 解析括号
            if (['(', ')', '[', ']', '{', '}'].includes(char)) {
                elements.push({
                    type: ElementType.BRACKET,
                    value: char,
                    id: generateId()
                });
                currentIndex++;
                continue;
            }

            // 解析上标、下标
            if (char === '^') {
                const lastElement = elements[elements.length - 1];
                currentIndex++;

                // 找到上标内容
                let superscriptContent = '';

                if (formula[currentIndex] === '{') {
                    // 大括号中的内容作为一个整体
                    currentIndex++;
                    let braceCount = 1;

                    while (currentIndex < formula.length && braceCount > 0) {
                        if (formula[currentIndex] === '{') braceCount++;
                        if (formula[currentIndex] === '}') braceCount--;

                        if (braceCount > 0) {
                            superscriptContent += formula[currentIndex];
                        }

                        currentIndex++;
                    }
                } else {
                    // 单个字符作为上标
                    superscriptContent = formula[currentIndex];
                    currentIndex++;
                }

                if (lastElement) {
                    const superscriptElement: FormulaElement = {
                        type: ElementType.SUPERSCRIPT,
                        value: superscriptContent,
                        id: generateId()
                    };

                    if (!lastElement.children) {
                        lastElement.children = [];
                    }

                    lastElement.children.push(superscriptElement);
                }

                continue;
            }

            // 下标处理 (使用 _)
            if (char === '_') {
                const lastElement = elements[elements.length - 1];
                currentIndex++;

                // 找到下标内容
                let subscriptContent = '';

                if (formula[currentIndex] === '{') {
                    // 大括号中的内容作为一个整体
                    currentIndex++;
                    let braceCount = 1;

                    while (currentIndex < formula.length && braceCount > 0) {
                        if (formula[currentIndex] === '{') braceCount++;
                        if (formula[currentIndex] === '}') braceCount--;

                        if (braceCount > 0) {
                            subscriptContent += formula[currentIndex];
                        }

                        currentIndex++;
                    }
                } else {
                    // 单个字符作为下标
                    subscriptContent = formula[currentIndex];
                    currentIndex++;
                }

                if (lastElement) {
                    const subscriptElement: FormulaElement = {
                        type: ElementType.SUBSCRIPT,
                        value: subscriptContent,
                        id: generateId()
                    };

                    if (!lastElement.children) {
                        lastElement.children = [];
                    }

                    lastElement.children.push(subscriptElement);
                }

                continue;
            }

            // 其他符号当作普通符号处理
            elements.push({
                type: ElementType.SYMBOL,
                value: char,
                id: generateId()
            });

            currentIndex++;
        }

        return elements;
    }

    /**
     * 将公式元素树转换为字符串
     * @param elements 公式元素树
     * @returns 公式字符串
     */
    static stringify(elements: FormulaElement[]): string {
        let result = '';

        elements.forEach(element => {
            switch (element.type) {
                case ElementType.NUMBER:
                case ElementType.VARIABLE:
                case ElementType.SYMBOL:
                case ElementType.OPERATOR:
                case ElementType.BRACKET:
                    result += element.value;
                    break;
                case ElementType.FUNCTION:
                    result += element.value;
                    break;
                default:
                    result += element.value;
            }

            // 处理子元素
            if (element.children && element.children.length > 0) {
                element.children.forEach(child => {
                    switch (child.type) {
                        case ElementType.SUPERSCRIPT:
                            result += `^{${child.value}}`;
                            break;
                        case ElementType.SUBSCRIPT:
                            result += `_{${child.value}}`;
                            break;
                        default:
                            // 其他类型的子元素，可以根据需要添加处理
                            break;
                    }
                });
            }
        });

        return result;
    }
} 