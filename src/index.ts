// 导出所有需要对外暴露的类和接口
export { FormulaEditor } from './core/FormulaEditor';
export type {
    FormulaEditorOptions,
    SymbolsConfig,
    SymbolItem,
    SymbolGroup,
    ValidationRule,
    ValidationConfig,
    ValidationResult,
    ValidationError,
    FormulaElement,
    EditorStyles
} from './types';

// 导出枚举类型
export { ElementType, ValidationRuleType, EventType } from './types';

// 导出工具类
export { FormulaParser } from './utils/parser';
export { FormulaValidator } from './utils/validator'; 