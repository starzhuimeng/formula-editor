/**
 * 公式编辑器配置选项
 */
export interface FormulaEditorOptions {
    /** 挂载编辑器的DOM容器 */
    container: HTMLElement;
    /** 可用符号配置 */
    symbols?: SymbolsConfig;
    /** 初始公式内容 */
    initialFormula?: string;
    /** 是否只读模式 */
    readOnly?: boolean;
    /** 自定义样式 */
    styles?: Partial<EditorStyles>;
    /** 验证配置 */
    validation?: ValidationConfig;
}

/**
 * 符号项配置
 */
export interface SymbolItem {
    /** 符号显示值 */
    value: string;
    /** 符号描述 */
    description?: string;
    /** 符号插入值，如果未提供则使用value */
    insertValue?: string;
    /** 符号类型，用于确定标签样式 */
    type?: ElementType;
    /** 显示风格 */
    style?: {
        backgroundColor?: string;
        color?: string;
        fontSize?: string;
        [key: string]: string | undefined;
    };
    /** 附加数据 */
    [key: string]: any;
}

/**
 * 符号组配置
 */
export interface SymbolGroup {
    /** 组名 */
    name: string;
    /** 显示名称 */
    displayName?: string;
    /** 符号列表 */
    symbols: (string | SymbolItem)[];
    /** 组样式 */
    style?: {
        backgroundColor?: string;
        color?: string;
        fontWeight?: string;
        [key: string]: string | undefined;
    };
}

/**
 * 符号配置
 */
export interface SymbolsConfig {
    /** 基础运算符号 */
    basic?: (string | SymbolItem)[];
    /** 希腊字母 */
    greek?: (string | SymbolItem)[];
    /** 数学函数 */
    functions?: (string | SymbolItem)[];
    /** 特殊符号 */
    special?: (string | SymbolItem)[];
    /** 自定义分类与符号 */
    [category: string]: (string | SymbolItem)[] | SymbolGroup | undefined;
}

/**
 * 编辑器样式配置
 */
export interface EditorStyles {
    /** 字体大小 */
    fontSize: string;
    /** 文本颜色 */
    color: string;
    /** 背景颜色 */
    backgroundColor: string;
    /** 边框样式 */
    border: string;
    /** 编辑器高度 */
    height: string;
    /** 编辑器宽度 */
    width: string;
    /** 符号面板样式 */
    symbolPanel?: {
        backgroundColor: string;
        symbolColor: string;
        borderColor: string;
    };
}

/**
 * 公式元素类型
 */
export enum ElementType {
    SYMBOL = 'symbol',
    NUMBER = 'number',
    VARIABLE = 'variable',
    FUNCTION = 'function',
    BRACKET = 'bracket',
    OPERATOR = 'operator',
    SUPERSCRIPT = 'superscript',
    SUBSCRIPT = 'subscript',
    FRACTION = 'fraction',
    ROOT = 'root',
    INTEGRAL = 'integral'
}

/**
 * 编辑器事件类型
 */
export enum EventType {
    CHANGE = 'change',
    FOCUS = 'focus',
    BLUR = 'blur',
    SYMBOL_CLICK = 'symbolClick',
    VALIDATION_ERROR = 'validationError',
    VALIDATION_SUCCESS = 'validationSuccess'
}

/**
 * 公式元素接口
 */
export interface FormulaElement {
    type: ElementType;
    value: string;
    id: string;
    children?: FormulaElement[];
}

/**
 * 验证配置
 */
export interface ValidationConfig {
    /** 自动验证(值变化时) */
    autoValidate?: boolean;
    /** 验证规则 */
    rules?: ValidationRule[];
    /** 自定义验证函数 */
    customValidator?: (formula: string, elements: FormulaElement[]) => ValidationResult;
}

/**
 * 验证规则类型
 */
export enum ValidationRuleType {
    /** 括号匹配 */
    BRACKETS_MATCH = 'bracketsMatch',
    /** 操作符周围必须有操作数 */
    OPERATORS_SURROUNDED = 'operatorsSurrounded',
    /** 表达式不能为空 */
    NON_EMPTY = 'nonEmpty',
    /** 表达式必须有等号 */
    HAS_EQUALS = 'hasEquals',
    /** 操作数不能连续出现 */
    NO_CONSECUTIVE_OPERANDS = 'noConsecutiveOperands',
    /** 自定义规则 */
    CUSTOM = 'custom'
}

/**
 * 验证规则
 */
export interface ValidationRule {
    /** 规则类型 */
    type: ValidationRuleType;
    /** 规则错误信息 */
    message?: string;
    /** 自定义验证函数 */
    validate?: (formula: string, elements: FormulaElement[]) => boolean;
}

/**
 * 验证结果
 */
export interface ValidationResult {
    /** 是否验证通过 */
    valid: boolean;
    /** 错误信息列表 */
    errors: ValidationError[];
}

/**
 * 验证错误
 */
export interface ValidationError {
    /** 错误消息 */
    message: string;
    /** 错误规则类型 */
    ruleType: ValidationRuleType;
    /** 错误元素索引，可选 */
    elementIndex?: number;
} 