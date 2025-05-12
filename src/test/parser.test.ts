import { FormulaParser } from '../utils/parser';
import { ElementType } from '../types';

describe('FormulaParser', () => {
    describe('parse', () => {
        it('should parse an empty string to an empty array', () => {
            const result = FormulaParser.parse('');
            expect(result).toEqual([]);
        });

        it('should parse numbers correctly', () => {
            const result = FormulaParser.parse('123.45');
            expect(result.length).toBe(1);
            expect(result[0].type).toBe(ElementType.NUMBER);
            expect(result[0].value).toBe('123.45');
        });

        it('should parse variables correctly', () => {
            const result = FormulaParser.parse('xyz');
            expect(result.length).toBe(3);
            expect(result[0].type).toBe(ElementType.VARIABLE);
            expect(result[0].value).toBe('x');
            expect(result[1].type).toBe(ElementType.VARIABLE);
            expect(result[1].value).toBe('y');
            expect(result[2].type).toBe(ElementType.VARIABLE);
            expect(result[2].value).toBe('z');
        });

        it('should parse operators correctly', () => {
            const result = FormulaParser.parse('+-×÷=');
            expect(result.length).toBe(5);
            expect(result.every(el => el.type === ElementType.OPERATOR)).toBe(true);
            expect(result.map(el => el.value).join('')).toBe('+-×÷=');
        });

        it('should parse brackets correctly', () => {
            const result = FormulaParser.parse('()[]{}');
            expect(result.length).toBe(6);
            expect(result.every(el => el.type === ElementType.BRACKET)).toBe(true);
            expect(result.map(el => el.value).join('')).toBe('()[]{}');
        });

        it('should parse functions correctly', () => {
            const result = FormulaParser.parse('sin(');
            expect(result.length).toBe(2);
            expect(result[0].type).toBe(ElementType.FUNCTION);
            expect(result[0].value).toBe('sin');
            expect(result[1].type).toBe(ElementType.BRACKET);
            expect(result[1].value).toBe('(');
        });

        it('should parse complex formulas correctly', () => {
            const result = FormulaParser.parse('E=mc^2');
            expect(result.length).toBe(4);
            expect(result[0].type).toBe(ElementType.VARIABLE);
            expect(result[0].value).toBe('E');
            expect(result[1].type).toBe(ElementType.OPERATOR);
            expect(result[1].value).toBe('=');
            expect(result[2].type).toBe(ElementType.VARIABLE);
            expect(result[2].value).toBe('m');
            expect(result[3].type).toBe(ElementType.VARIABLE);
            expect(result[3].value).toBe('c');

            // Check for superscript child
            expect(result[3].children?.length).toBe(1);
            expect(result[3].children?.[0].type).toBe(ElementType.SUPERSCRIPT);
            expect(result[3].children?.[0].value).toBe('2');
        });

        it('should parse superscripts with braces correctly', () => {
            const result = FormulaParser.parse('x^{y+z}');
            expect(result.length).toBe(1);
            expect(result[0].type).toBe(ElementType.VARIABLE);
            expect(result[0].value).toBe('x');

            // Check for superscript child
            expect(result[0].children?.length).toBe(1);
            expect(result[0].children?.[0].type).toBe(ElementType.SUPERSCRIPT);
            expect(result[0].children?.[0].value).toBe('y+z');
        });

        it('should parse subscripts correctly', () => {
            const result = FormulaParser.parse('a_i');
            expect(result.length).toBe(1);
            expect(result[0].type).toBe(ElementType.VARIABLE);
            expect(result[0].value).toBe('a');

            // Check for subscript child
            expect(result[0].children?.length).toBe(1);
            expect(result[0].children?.[0].type).toBe(ElementType.SUBSCRIPT);
            expect(result[0].children?.[0].value).toBe('i');
        });
    });

    describe('stringify', () => {
        it('should convert an empty array to an empty string', () => {
            const result = FormulaParser.stringify([]);
            expect(result).toBe('');
        });

        it('should stringify simple elements correctly', () => {
            const elements = FormulaParser.parse('a+b=c');
            const result = FormulaParser.stringify(elements);
            expect(result).toBe('a+b=c');
        });

        it('should stringify elements with superscripts correctly', () => {
            const elements = FormulaParser.parse('x^2+y^3');
            const result = FormulaParser.stringify(elements);
            expect(result).toBe('x^{2}+y^{3}');
        });

        it('should stringify elements with subscripts correctly', () => {
            const elements = FormulaParser.parse('a_i+b_j');
            const result = FormulaParser.stringify(elements);
            expect(result).toBe('a_{i}+b_{j}');
        });
    });
}); 