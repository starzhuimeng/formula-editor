import { FormulaEditorOptions, EditorStyles, ElementType, EventType, FormulaElement, SymbolItem, ValidationConfig, ValidationRule, ValidationResult, ValidationRuleType } from '../types';
import { createElement, appendChildren, setStyles, addEventListeners, generateId } from '../utils/dom';
import { FormulaParser } from '../utils/parser';
import { FormulaValidator } from '../utils/validator';
import { SymbolPanel } from './SymbolPanel';

/**
 * 默认符号配置
 */
const DEFAULT_SYMBOLS = {
    basic: [
        { value: '=', type: ElementType.OPERATOR, description: '等号' },
        { value: '+', type: ElementType.OPERATOR, description: '加号' },
        { value: '-', type: ElementType.OPERATOR, description: '减号' },
        { value: '×', type: ElementType.OPERATOR, description: '乘号', insertValue: '*' },
        { value: '÷', type: ElementType.OPERATOR, description: '除号', insertValue: '/' },
        { value: '±', type: ElementType.OPERATOR, description: '正负号' },
        { value: '(', type: ElementType.BRACKET, description: '左圆括号' },
        { value: ')', type: ElementType.BRACKET, description: '右圆括号' },
        { value: '[', type: ElementType.BRACKET, description: '左方括号' },
        { value: ']', type: ElementType.BRACKET, description: '右方括号' },
        { value: '{', type: ElementType.BRACKET, description: '左花括号' },
        { value: '}', type: ElementType.BRACKET, description: '右花括号' },
        { value: ',', type: ElementType.SYMBOL, description: '逗号' },
        { value: '.', type: ElementType.NUMBER, description: '小数点' }
    ],
    greek: [
        { value: 'α', type: ElementType.VARIABLE, description: 'Alpha' },
        { value: 'β', type: ElementType.VARIABLE, description: 'Beta' },
        { value: 'γ', type: ElementType.VARIABLE, description: 'Gamma' },
        { value: 'δ', type: ElementType.VARIABLE, description: 'Delta' },
        { value: 'ε', type: ElementType.VARIABLE, description: 'Epsilon' },
        { value: 'η', type: ElementType.VARIABLE, description: 'Eta' },
        { value: 'θ', type: ElementType.VARIABLE, description: 'Theta' },
        { value: 'λ', type: ElementType.VARIABLE, description: 'Lambda' },
        { value: 'μ', type: ElementType.VARIABLE, description: 'Mu' },
        { value: 'π', type: ElementType.VARIABLE, description: 'Pi' },
        { value: 'ρ', type: ElementType.VARIABLE, description: 'Rho' },
        { value: 'σ', type: ElementType.VARIABLE, description: 'Sigma' },
        { value: 'τ', type: ElementType.VARIABLE, description: 'Tau' },
        { value: 'φ', type: ElementType.VARIABLE, description: 'Phi' },
        { value: 'ω', type: ElementType.VARIABLE, description: 'Omega' },
        { value: 'Γ', type: ElementType.VARIABLE, description: 'Gamma(大写)' },
        { value: 'Δ', type: ElementType.VARIABLE, description: 'Delta(大写)' },
        { value: 'Θ', type: ElementType.VARIABLE, description: 'Theta(大写)' },
        { value: 'Λ', type: ElementType.VARIABLE, description: 'Lambda(大写)' },
        { value: 'Π', type: ElementType.VARIABLE, description: 'Pi(大写)' },
        { value: 'Σ', type: ElementType.VARIABLE, description: 'Sigma(大写)' },
        { value: 'Φ', type: ElementType.VARIABLE, description: 'Phi(大写)' },
        { value: 'Ψ', type: ElementType.VARIABLE, description: 'Psi(大写)' },
        { value: 'Ω', type: ElementType.VARIABLE, description: 'Omega(大写)' }
    ],
    functions: [
        { value: 'sin', type: ElementType.FUNCTION, description: '正弦函数' },
        { value: 'cos', type: ElementType.FUNCTION, description: '余弦函数' },
        { value: 'tan', type: ElementType.FUNCTION, description: '正切函数' },
        { value: 'log', type: ElementType.FUNCTION, description: '对数函数' },
        { value: 'ln', type: ElementType.FUNCTION, description: '自然对数' },
        { value: 'lim', type: ElementType.FUNCTION, description: '极限' },
        { value: 'max', type: ElementType.FUNCTION, description: '最大值' },
        { value: 'min', type: ElementType.FUNCTION, description: '最小值' }
    ],
    special: [
        { value: '∞', type: ElementType.SYMBOL, description: '无穷大' },
        { value: '∫', type: ElementType.INTEGRAL, description: '积分' },
        { value: '∬', type: ElementType.INTEGRAL, description: '二重积分' },
        { value: '∭', type: ElementType.INTEGRAL, description: '三重积分' },
        { value: '∮', type: ElementType.INTEGRAL, description: '曲线积分' },
        { value: '∇', type: ElementType.SYMBOL, description: 'Nabla算子' },
        { value: '∂', type: ElementType.SYMBOL, description: '偏导数' },
        { value: '∑', type: ElementType.SYMBOL, description: '求和' },
        { value: '∏', type: ElementType.SYMBOL, description: '求积' },
        { value: '√', type: ElementType.ROOT, description: '平方根' },
        { value: '∛', type: ElementType.ROOT, description: '立方根' },
        { value: '∜', type: ElementType.ROOT, description: '4次方根' },
        { value: '≠', type: ElementType.OPERATOR, description: '不等于' },
        { value: '≈', type: ElementType.OPERATOR, description: '约等于' },
        { value: '≤', type: ElementType.OPERATOR, description: '小于等于' },
        { value: '≥', type: ElementType.OPERATOR, description: '大于等于' },
        { value: '∈', type: ElementType.SYMBOL, description: '属于' },
        { value: '∉', type: ElementType.SYMBOL, description: '不属于' },
        { value: '⊂', type: ElementType.SYMBOL, description: '子集' },
        { value: '⊃', type: ElementType.SYMBOL, description: '超集' }
    ]
};

/**
 * 默认样式配置
 */
const DEFAULT_STYLES: EditorStyles = {
    fontSize: '16px',
    color: '#333',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    height: 'auto',
    width: '100%',
    symbolPanel: {
        backgroundColor: '#fff',
        symbolColor: '#333',
        borderColor: '#ddd'
    }
};

/**
 * 公式编辑器类
 */
export class FormulaEditor {
    private container: HTMLElement;
    private editorContainer: HTMLElement;
    private editArea: HTMLElement;
    private symbolButton: HTMLElement;
    private symbolPanel: SymbolPanel;
    private options: FormulaEditorOptions;
    private formulaElements: FormulaElement[] = [];
    private elementTags: HTMLElement[] = [];
    private currentFocus: number = -1;
    private textInputElement: HTMLInputElement | null = null;
    private eventListeners: { [key in EventType]?: Function[] } = {};
    private errorMessageElement: HTMLElement | null = null;
    private lastValidationResult: ValidationResult | null = null;

    /**
     * 构造函数
     * @param options 编辑器选项
     */
    constructor(options: FormulaEditorOptions) {
        this.options = this.mergeWithDefaults(options);
        this.container = options.container;

        // 创建编辑器容器
        this.editorContainer = createElement<HTMLDivElement>('div', 'formula-editor-container');

        // 初始化symbolButton，会在createToolbar中被赋值
        this.symbolButton = createElement<HTMLButtonElement>('button');

        // 创建工具栏
        const toolbar = this.createToolbar();

        // 创建编辑区域
        this.editArea = this.createEditArea();

        // 组合编辑器
        appendChildren(this.editorContainer, toolbar, this.editArea);

        // 添加到容器
        this.container.appendChild(this.editorContainer);

        // 创建文本输入框 - 确保在编辑区域初始化后创建
        this.createTextInput();

        // 添加键盘和点击事件监听
        addEventListeners(this.editArea, {
            keydown: (e) => this.handleKeyDown(e),
            click: (e) => this.handleAreaClick(e)
        });

        // 创建符号面板
        this.symbolPanel = new SymbolPanel({
            symbols: this.options.symbols || DEFAULT_SYMBOLS,
            onSymbolClick: (symbol) => this.insertSymbol(symbol),
            container: this.editorContainer,
            styles: this.options.styles?.symbolPanel
        });

        // 初始化编辑器
        this.init();
    }

    /**
     * 合并默认配置
     */
    private mergeWithDefaults(options: FormulaEditorOptions): FormulaEditorOptions {
        return {
            ...options,
            symbols: options.symbols || DEFAULT_SYMBOLS,
            styles: {
                ...DEFAULT_STYLES,
                ...(options.styles || {})
            }
        };
    }

    /**
     * 初始化编辑器
     */
    private init(): void {
        try {
            // 设置初始公式
            if (this.options.initialFormula) {
                this.setFormula(this.options.initialFormula);
            }

            // 设置只读模式
            if (this.options.readOnly) {
                this.setReadOnly(true);
            }

            // 隐藏符号面板
            this.symbolPanel.hide();

            // 确保文本输入框隐藏
            this.hideTextInput();

            // 创建错误信息显示元素
            this.createErrorMessageElement();

            // 如果配置了自动验证，验证初始公式
            if (this.options.validation?.autoValidate) {
                this.validateFormula();
            }
        } catch (error) {
            console.error('Error initializing editor:', error);
        }
    }

    /**
     * 处理区域点击事件
     */
    private handleAreaClick(e: MouseEvent): void {
        try {
            // 确保编辑区域获得焦点
            this.editArea.focus();

            // 获取点击事件的坐标位置
            const clickX = e.clientX;
            const clickY = e.clientY;

            // 如果点击的是编辑区域而不是标签
            if (e.target === this.editArea) {
                // 找到最近的标签位置
                let closestIndex = 0;
                let minDistance = Number.MAX_VALUE;

                // 处理空编辑区域的情况
                if (this.elementTags.length === 0) {
                    this.currentFocus = 0;
                    this.updateFocusIndicator();
                    return;
                }

                // 遍历所有标签，找到水平距离最近的位置
                this.elementTags.forEach((tag, index) => {
                    const rect = tag.getBoundingClientRect();
                    const tagCenter = rect.left + (rect.width / 2);
                    const distance = Math.abs(clickX - tagCenter);

                    // 如果这个标签是点击位置右侧的第一个标签，且距离比当前记录的最小距离小
                    if (distance < minDistance) {
                        minDistance = distance;

                        // 如果点击位置在标签的左半部分，则光标应在标签之前
                        if (clickX < tagCenter) {
                            closestIndex = index;
                        } else {
                            // 否则光标应在标签之后
                            closestIndex = index + 1;
                        }
                    }
                });

                // 设置焦点到最近的位置
                this.currentFocus = closestIndex;
                this.updateFocusIndicator();

                // 不再自动显示文本输入框，等待用户开始输入
            }
        } catch (error) {
            console.error('Error in handleAreaClick:', error);
        }
    }

    /**
     * 将焦点设置到末尾
     */
    private setFocusToEnd(): void {
        this.currentFocus = this.elementTags.length;
        this.updateFocusIndicator();
    }

    /**
     * 处理键盘事件
     */
    private handleKeyDown(e: KeyboardEvent): void {
        if (this.options.readOnly) {
            e.preventDefault();
            return;
        }

        try {
            // 输出调试信息
            console.log('Keyboard event detected:', e.key);

            switch (e.key) {
                case 'Backspace':
                case 'Delete':
                    e.preventDefault();
                    this.deleteElement();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveFocusLeft();
                    this.hideTextInput(); // 导航时隐藏输入框
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveFocusRight();
                    this.hideTextInput(); // 导航时隐藏输入框
                    break;
                case 'Home':
                    e.preventDefault();
                    this.currentFocus = 0;
                    this.updateFocusIndicator();
                    this.hideTextInput(); // 导航时隐藏输入框
                    break;
                case 'End':
                    e.preventDefault();
                    this.setFocusToEnd();
                    this.hideTextInput(); // 导航时隐藏输入框
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.textInputElement && this.textInputElement.style.display === 'block') {
                        // 如果输入框已显示，则提交内容
                        this.commitTextInput();
                    } else {
                        // 否则显示空白输入框
                        console.log('Enter key pressed, showing text input');
                        this.forceShowTextInput();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.hideTextInput();
                    break;
                case ' ': // 空格键
                    e.preventDefault();
                    // 空格键直接插入空格符号
                    this.insertSymbol(' ');
                    break;
                // 直接处理常用运算符
                case '+':
                case '-':
                case '*':
                case '/':
                case '=':
                    e.preventDefault();
                    console.log('Operator key detected, inserting directly:', e.key);
                    this.insertSymbol(e.key);
                    break;
                // 直接处理括号
                case '(':
                case ')':
                case '[':
                case ']':
                case '{':
                case '}':
                    e.preventDefault();
                    console.log('Bracket key detected, inserting directly:', e.key);
                    this.insertSymbol(e.key);
                    break;
                case '.': // 小数点
                case ',': // 逗号
                    e.preventDefault();
                    console.log('Punctuation key detected, inserting directly:', e.key);
                    this.insertSymbol(e.key);
                    break;
                default:
                    // 检查是否为数字
                    if (/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                        // 数字直接插入，不显示文本框
                        console.log('Number key detected, inserting directly:', e.key);
                        this.insertSymbol(e.key);
                    }
                    // 对于其他可打印字符，显示文本输入框并预填充该字符
                    else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                        e.preventDefault();
                        console.log('Printable character detected:', e.key);
                        this.forceShowTextInput(e.key);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error in handleKeyDown:', error);
        }
    }

    /**
     * 强制显示文本输入框（跳过常规检查）
     */
    private forceShowTextInput(initialText: string = ''): void {
        console.log('Force showing text input with:', initialText);

        try {
            // 确保文本输入框存在
            if (!this.textInputElement) {
                console.warn('Text input element is null, creating a new one');
                this.createTextInput();
                if (!this.textInputElement) {
                    console.error('Failed to create text input element');
                    return;
                }
            }

            // 获取光标元素和位置
            const cursorElement = document.getElementById('formula-cursor-active');
            console.log('Cursor element found:', !!cursorElement);

            if (!cursorElement) {
                console.warn('No cursor found, using default positioning');
                // 如果没有找到光标，就在编辑区域中间显示
                const editAreaRect = this.editArea.getBoundingClientRect();

                // 使用fixed定位，相对于视口
                this.textInputElement.style.position = 'fixed';
                this.textInputElement.style.left = `${editAreaRect.left + editAreaRect.width / 2 - 75}px`;
                this.textInputElement.style.top = `${editAreaRect.top + 30}px`;
            } else {
                // 获取光标位置
                const cursorRect = cursorElement.getBoundingClientRect();

                // 定位到光标位置，确保输入框出现在光标下方
                this.textInputElement.style.position = 'fixed';
                this.textInputElement.style.left = `${cursorRect.left}px`;
                this.textInputElement.style.top = `${cursorRect.bottom + 2}px`;
            }

            // 设置输入框样式和内容
            this.textInputElement.style.width = '150px';
            this.textInputElement.style.padding = '5px';
            this.textInputElement.style.display = 'block';
            this.textInputElement.value = initialText;
            this.textInputElement.placeholder = '输入公式内容...';

            // 确保输入框有很高的z-index值
            this.textInputElement.style.zIndex = '9999';

            // 确保输入框样式明显但不过分干扰
            this.textInputElement.style.border = '1px solid #2196f3';
            this.textInputElement.style.backgroundColor = '#e3f2fd';
            this.textInputElement.style.borderRadius = '3px';
            this.textInputElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

            // 移到body中，确保不受编辑器DOM操作影响
            if (this.textInputElement.parentNode !== document.body) {
                document.body.appendChild(this.textInputElement);
            }

            // 设置文本输入框的事件监听
            this.textInputElement.onkeydown = (e) => {
                console.log('Text input keydown:', e.key);
                this.handleTextInputKeyDown(e);
            };

            this.textInputElement.onblur = () => {
                console.log('Text input blur event');
                setTimeout(() => {
                    this.commitTextInput();
                }, 200);
            };

            // 聚焦并设置光标到文本末尾
            this.textInputElement.focus();
            if (initialText && this.textInputElement.selectionStart !== null) {
                this.textInputElement.selectionStart = initialText.length;
            }
        } catch (error) {
            console.error('Error in forceShowTextInput:', error);
        }
    }

    /**
     * 显示文本输入框
     */
    private showTextInput(initialText: string = ''): void {
        console.log('showTextInput called with:', initialText);

        if (!this.textInputElement || this.options.readOnly) {
            console.warn('Cannot show text input: input is null or editor is readonly');
            return;
        }

        try {
            // 防止重复调用，如果已经显示，则更新值
            if (this.textInputElement.style.display === 'block') {
                console.log('Text input already visible, updating value');
                this.textInputElement.value += initialText;
                this.textInputElement.focus();
                return;
            }

            // 获取光标位置
            const cursorElement = this.editArea.querySelector('.formula-cursor');
            const editAreaRect = this.editArea.getBoundingClientRect();

            // 将输入框移到body中，确保不受编辑器DOM操作影响
            document.body.appendChild(this.textInputElement);

            // 设置为固定定位
            this.textInputElement.style.position = 'fixed';

            if (!cursorElement) {
                console.warn('No cursor found, using default positioning');
                // 基本定位 - 放在编辑器顶部中央
                this.textInputElement.style.left = `${editAreaRect.left + 20}px`;
                this.textInputElement.style.top = `${editAreaRect.top + 20}px`;
            } else {
                console.log('Cursor found, positioning relative to cursor');
                const cursorRect = cursorElement.getBoundingClientRect();

                // 定位到光标位置
                this.textInputElement.style.left = `${cursorRect.left}px`;
                this.textInputElement.style.top = `${cursorRect.bottom + 5}px`;
            }

            // 显示输入框
            this.textInputElement.style.width = '150px';
            this.textInputElement.style.margin = '0';
            this.textInputElement.style.display = 'block';

            // 设置输入框样式确保可见
            this.textInputElement.style.backgroundColor = '#e3f2fd';
            this.textInputElement.style.zIndex = '9999';
            this.textInputElement.style.padding = '5px';
            this.textInputElement.style.border = '2px solid #2196f3';

            // 设置输入框值
            this.textInputElement.value = initialText;
            console.log('Input value set to:', initialText);

            // 设置事件监听
            this.textInputElement.onkeydown = (e) => {
                console.log('Text input keydown:', e.key);
                this.handleTextInputKeyDown(e);
            };

            this.textInputElement.onblur = () => {
                console.log('Text input blur event');
                setTimeout(() => {
                    this.commitTextInput();
                }, 200);
            };

            // 聚焦
            setTimeout(() => {
                if (this.textInputElement) {
                    console.log('Focusing text input (delayed)');
                    this.textInputElement.focus();

                    if (initialText && this.textInputElement.selectionStart !== null) {
                        this.textInputElement.selectionStart = initialText.length;
                    }
                }
            }, 50);
        } catch (error) {
            console.error('Error showing text input:', error);
            this.forceShowTextInput(initialText);
        }
    }

    /**
     * 隐藏文本输入框
     */
    private hideTextInput(): void {
        try {
            if (this.textInputElement) {
                this.textInputElement.style.display = 'none';
                this.textInputElement.value = '';

                // 如果文本输入框被移到了body中，需要移回编辑区域
                if (this.textInputElement.parentNode === document.body) {
                    document.body.removeChild(this.textInputElement);
                    this.editArea.appendChild(this.textInputElement);
                }
            }
        } catch (error) {
            console.error('Error hiding text input:', error);
        }
    }

    /**
     * 处理文本输入框的键盘事件
     */
    private handleTextInputKeyDown(e: KeyboardEvent): void {
        console.log('Text input keydown handler called with key:', e.key);

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                // Enter键提交输入
                this.commitTextInput();
                break;
            case 'Escape':
                e.preventDefault();
                // Escape键取消输入
                this.hideTextInput();
                this.editArea.focus();
                break;
            case 'Tab':
                e.preventDefault();
                // Tab键提交输入并移动到下一位置
                this.commitTextInput();
                this.moveFocusRight();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                // 输入框为空时允许方向键移动光标
                if (this.textInputElement && this.textInputElement.value.length === 0) {
                    e.preventDefault();
                    this.hideTextInput();

                    switch (e.key) {
                        case 'ArrowLeft':
                            this.moveFocusLeft();
                            break;
                        case 'ArrowRight':
                            this.moveFocusRight();
                            break;
                    }

                    this.editArea.focus();
                }
                break;
            case 'Backspace':
                // 如果输入框为空并且按下Backspace，则删除前一个元素
                if (this.textInputElement && this.textInputElement.value.length === 0) {
                    e.preventDefault();
                    this.hideTextInput();
                    this.deleteElement();
                    // 在删除后重新显示光标
                    this.updateFocusIndicator();
                }
                break;
            default:
                // 对于其他按键，使用默认处理
                break;
        }
    }

    /**
     * 提交文本输入框的内容
     */
    private commitTextInput(): void {
        if (!this.textInputElement) return;

        const text = this.textInputElement.value.trim();
        if (text) {
            // 作为单个文本标签插入
            this.insertText(text);
        }

        this.hideTextInput();
        this.editArea.focus();
    }

    /**
     * 插入整个文本作为一个标签
     * @param text 要插入的文本
     */
    private insertText(text: string): void {
        if (this.options.readOnly) return;

        // 确定元素类型
        let type = ElementType.VARIABLE; // 默认为变量类型

        // 检查是否为数字
        if (/^[0-9.]+$/.test(text)) {
            type = ElementType.NUMBER;
        }
        // 检查是否为运算符
        else if (/^[+\-*/=÷×±]+$/.test(text)) {
            type = ElementType.OPERATOR;
        }
        // 检查是否为函数
        else if (['sin', 'cos', 'tan', 'log', 'ln', 'max', 'min'].includes(text)) {
            type = ElementType.FUNCTION;
        }
        // 检查是否为括号
        else if (/^[\(\)\[\]\{\}]+$/.test(text)) {
            type = ElementType.BRACKET;
        }
        // 检查是否为特殊符号
        else if (!/^[a-zA-Z0-9]+$/.test(text)) {
            type = ElementType.SYMBOL;
        }

        const newElement: FormulaElement = {
            type,
            value: text,
            id: generateId()
        };

        // 在当前焦点位置插入元素
        if (this.currentFocus === -1) {
            this.currentFocus = this.formulaElements.length;
        }

        this.formulaElements.splice(this.currentFocus, 0, newElement);

        // 创建元素标签
        const elementTag = this.createElementTag(newElement);

        // 插入到DOM
        if (this.currentFocus === this.elementTags.length) {
            this.editArea.appendChild(elementTag);
            this.elementTags.push(elementTag);
        } else {
            this.editArea.insertBefore(elementTag, this.elementTags[this.currentFocus]);
            this.elementTags.splice(this.currentFocus, 0, elementTag);
        }

        // 更新焦点位置
        this.currentFocus++;
        this.updateFocusIndicator();

        // 触发变更事件
        this.triggerChangeEvent();
    }

    /**
     * 插入符号
     */
    private insertSymbol(symbolInput: string | SymbolItem): void {
        // 检查是否为只读模式
        if (this.options.readOnly) {
            return;
        }

        // 处理符号对象或字符串
        let symbol: string;
        let type: ElementType = ElementType.SYMBOL;

        if (typeof symbolInput === 'string') {
            symbol = symbolInput;

            // 根据符号类型判断
            if (/[0-9.]/.test(symbol)) {
                type = ElementType.NUMBER;
            } else if (/[a-zA-Z]/.test(symbol)) {
                type = ElementType.VARIABLE;
            } else if (['+', '-', '×', '÷', '*', '/', '='].includes(symbol)) {
                type = ElementType.OPERATOR;
            } else if (['(', ')', '[', ']', '{', '}'].includes(symbol)) {
                type = ElementType.BRACKET;
            }
        } else {
            // 使用传入的插入值或显示值
            symbol = symbolInput.insertValue || symbolInput.value;
            // 使用传入的类型或默认类型
            type = symbolInput.type || ElementType.SYMBOL;
        }

        const newElement: FormulaElement = {
            type,
            value: symbol,
            id: generateId()
        };

        // 在当前焦点位置插入元素
        if (this.currentFocus === -1) {
            this.currentFocus = this.formulaElements.length;
        }

        this.formulaElements.splice(this.currentFocus, 0, newElement);

        // 创建元素标签
        const elementTag = this.createElementTag(newElement);

        // 添加插入动画类
        elementTag.classList.add('formula-element-inserted');

        // 动画结束后移除类
        setTimeout(() => {
            elementTag.classList.remove('formula-element-inserted');
        }, 300);

        // 插入到DOM
        if (this.currentFocus === this.elementTags.length) {
            this.editArea.appendChild(elementTag);
            this.elementTags.push(elementTag);
        } else {
            this.editArea.insertBefore(elementTag, this.elementTags[this.currentFocus]);
            this.elementTags.splice(this.currentFocus, 0, elementTag);
        }

        // 更新焦点位置
        this.currentFocus++;
        this.updateFocusIndicator();

        // 触发事件
        this.triggerChangeEvent();
        this.triggerEvent(EventType.SYMBOL_CLICK, { symbol });
    }

    /**
     * 创建元素标签
     */
    private createElementTag(element: FormulaElement): HTMLElement {
        const tag = createElement<HTMLSpanElement>('span', `formula-element formula-element-${element.type.toLowerCase()}`);
        tag.textContent = element.value;
        tag.dataset.id = element.id;
        tag.dataset.type = element.type;

        // 添加点击事件
        addEventListeners(tag, {
            click: (e) => {
                e.stopPropagation();
                // 找到当前标签的索引
                const index = this.elementTags.indexOf(tag);
                if (index !== -1) {
                    this.currentFocus = index + 1; // 将焦点设置到该元素后面
                    this.updateFocusIndicator();
                }
            }
        });

        return tag;
    }

    /**
     * 触发变更事件
     */
    private triggerChangeEvent(): void {
        const formula = FormulaParser.stringify(this.formulaElements);
        this.triggerEvent(EventType.CHANGE, {
            formula,
            elements: [...this.formulaElements]
        });

        // 如果配置了自动验证，则在变更时验证
        if (this.options.validation?.autoValidate) {
            this.validateFormula();
        }
    }

    /**
     * 设置公式
     * @param formula 公式字符串
     */
    public setFormula(formula: string): void {
        // 清空现有内容
        this.clear();

        // 解析公式
        this.formulaElements = FormulaParser.parse(formula);

        // 创建元素标签
        this.formulaElements.forEach(element => {
            const tag = this.createElementTag(element);
            this.editArea.appendChild(tag);
            this.elementTags.push(tag);
        });

        // 更新焦点
        this.setFocusToEnd();

        // 触发变更事件
        this.triggerChangeEvent();
    }

    /**
     * 获取公式字符串
     * @returns 公式字符串
     */
    public getFormula(): string {
        return FormulaParser.stringify(this.formulaElements);
    }

    /**
     * 获取公式元素数组
     * @returns 公式元素数组
     */
    public getFormulaElements(): FormulaElement[] {
        return [...this.formulaElements];
    }

    /**
     * 获取指定索引位置的公式元素
     * @param index 元素索引
     * @returns 公式元素，如果索引无效则返回null
     */
    public getElementAt(index: number): FormulaElement | null {
        if (index >= 0 && index < this.formulaElements.length) {
            return { ...this.formulaElements[index] };
        }
        return null;
    }

    /**
     * 在指定位置插入新元素
     * @param element 要插入的元素
     * @param index 插入位置索引，默认为当前焦点位置
     * @returns 成功插入的元素
     */
    public insertElement(element: Omit<FormulaElement, 'id'>, index: number = this.currentFocus): FormulaElement {
        const newElement: FormulaElement = {
            ...element,
            id: generateId()
        };

        // 确保索引在有效范围内
        const insertIndex = Math.max(0, Math.min(index, this.formulaElements.length));

        // 插入元素
        this.formulaElements.splice(insertIndex, 0, newElement);

        // 创建并插入新标签
        const newTag = this.createElementTag(newElement);
        if (insertIndex >= this.elementTags.length) {
            this.editArea.appendChild(newTag);
        } else {
            this.editArea.insertBefore(newTag, this.elementTags[insertIndex]);
        }

        // 更新标签数组
        this.elementTags.splice(insertIndex, 0, newTag);

        // 更新焦点
        this.currentFocus = insertIndex + 1;
        this.updateFocusIndicator();

        // 触发变更事件
        this.triggerChangeEvent();

        // 自动验证
        if (this.options.validation?.autoValidate) {
            this.validateFormula();
        }

        return newElement;
    }

    /**
     * 更新指定索引位置的元素
     * @param index 元素索引
     * @param elementUpdate 元素更新数据
     * @returns 成功返回true，失败返回false
     */
    public updateElement(index: number, elementUpdate: Partial<Omit<FormulaElement, 'id'>>): boolean {
        if (index < 0 || index >= this.formulaElements.length) {
            return false;
        }

        // 更新元素
        const updatedElement = {
            ...this.formulaElements[index],
            ...elementUpdate
        };
        this.formulaElements[index] = updatedElement;

        // 更新DOM标签
        const oldTag = this.elementTags[index];
        const newTag = this.createElementTag(updatedElement);
        this.editArea.replaceChild(newTag, oldTag);
        this.elementTags[index] = newTag;

        // 触发变更事件
        this.triggerChangeEvent();

        // 自动验证
        if (this.options.validation?.autoValidate) {
            this.validateFormula();
        }

        return true;
    }

    /**
     * 从指定位置删除元素
     * @param index 要删除的元素索引
     * @returns 成功返回true，失败返回false
     */
    public removeElement(index: number): boolean {
        if (index < 0 || index >= this.formulaElements.length) {
            return false;
        }

        // 从数组中删除元素
        this.formulaElements.splice(index, 1);

        // 从DOM中删除标签
        const tag = this.elementTags[index];
        this.editArea.removeChild(tag);

        // 从标签数组中删除
        this.elementTags.splice(index, 1);

        // 调整焦点
        this.currentFocus = Math.min(index, this.formulaElements.length);
        this.updateFocusIndicator();

        // 触发变更事件
        this.triggerChangeEvent();

        // 自动验证
        if (this.options.validation?.autoValidate) {
            this.validateFormula();
        }

        return true;
    }

    /**
     * 添加元素到公式末尾
     * @param element 要添加的元素
     * @returns 添加的元素
     */
    public appendElement(element: Omit<FormulaElement, 'id'>): FormulaElement {
        return this.insertElement(element, this.formulaElements.length);
    }

    /**
     * 查找符合条件的元素
     * @param predicate 查找条件函数
     * @returns 满足条件的元素索引数组
     */
    public findElements(predicate: (element: FormulaElement, index: number) => boolean): number[] {
        return this.formulaElements
            .map((element, index) => ({ element, index }))
            .filter(({ element, index }) => predicate(element, index))
            .map(({ index }) => index);
    }

    /**
     * 移动焦点到指定索引位置
     * @param index 目标索引
     * @returns 成功返回true，失败返回false
     */
    public setFocusToIndex(index: number): boolean {
        if (index < 0 || index > this.formulaElements.length) {
            return false;
        }

        this.currentFocus = index;
        this.updateFocusIndicator();
        return true;
    }

    /**
     * 获取当前焦点位置
     * @returns 当前焦点索引
     */
    public getCurrentFocusIndex(): number {
        return this.currentFocus;
    }

    /**
     * 批量更新公式元素
     * @param elements 新的元素数组
     */
    public setElements(elements: Omit<FormulaElement, 'id'>[]): void {
        // 清空当前元素
        this.clear();

        // 添加新元素
        elements.forEach(element => {
            this.appendElement(element);
        });
    }

    /**
     * 复制指定元素到剪贴板
     * @param index 要复制的元素索引
     * @returns 成功返回true，失败返回false
     */
    public copyElement(index: number): boolean {
        if (index < 0 || index >= this.formulaElements.length) {
            return false;
        }

        try {
            const element = this.formulaElements[index];
            navigator.clipboard.writeText(element.value);
            return true;
        } catch (error) {
            console.error('Failed to copy element:', error);
            return false;
        }
    }

    /**
     * 获取公式的纯文本表示
     * @returns 公式的纯文本
     */
    public getFormulaText(): string {
        return this.formulaElements.map(el => el.value).join('');
    }

    /**
     * 公开的删除当前选中元素的方法
     * @returns 成功返回true，失败返回false
     */
    public deleteCurrentElement(): boolean {
        if (this.currentFocus > 0 && this.currentFocus <= this.formulaElements.length) {
            this.deleteElement();
            return true;
        }
        return false;
    }

    /**
     * 设置只读模式
     */
    public setReadOnly(readOnly: boolean): void {
        this.options.readOnly = readOnly;
        this.symbolButton.style.display = readOnly ? 'none' : 'inline-block';

        // 更新tabindex
        if (readOnly) {
            this.editArea.removeAttribute('tabindex');
        } else {
            this.editArea.setAttribute('tabindex', '0');
        }
    }

    /**
     * 清空编辑器
     */
    public clear(): void {
        this.formulaElements = [];
        this.elementTags = [];
        this.editArea.innerHTML = '';
        this.currentFocus = -1;

        this.triggerEvent(EventType.CHANGE, {
            formula: '',
            elements: []
        });
    }

    /**
     * 添加事件监听器
     */
    public addEventListener(event: EventType, callback: Function): void {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }

        this.eventListeners[event]?.push(callback);
    }

    /**
     * 移除事件监听器
     */
    public removeEventListener(event: EventType, callback: Function): void {
        const listeners = this.eventListeners[event];

        if (listeners) {
            const index = listeners.indexOf(callback);

            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     */
    private triggerEvent(event: EventType, data?: any): void {
        const listeners = this.eventListeners[event];

        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    /**
     * 移动焦点到左边
     */
    private moveFocusLeft(): void {
        if (this.currentFocus > 0) {
            this.currentFocus--;
            this.updateFocusIndicator();
        }
    }

    /**
     * 移动焦点到右边
     */
    private moveFocusRight(): void {
        if (this.currentFocus < this.elementTags.length) {
            this.currentFocus++;
            this.updateFocusIndicator();
        }
    }

    /**
     * 更新焦点指示器
     */
    private updateFocusIndicator(): void {
        try {
            // 移除所有标签的焦点样式
            this.elementTags.forEach(tag => {
                tag.classList.remove('formula-element-focused');
            });

            // 清除可能存在的光标指示器
            const existingCursor = this.editArea.querySelector('.formula-cursor');
            if (existingCursor) {
                this.editArea.removeChild(existingCursor);
            }

            // 当焦点在标签之间时，插入光标指示器
            if (this.currentFocus >= 0 && this.currentFocus <= this.elementTags.length) {
                const cursor = createElement<HTMLDivElement>('div', 'formula-cursor');
                setStyles(cursor, {
                    display: 'inline-block',
                    width: '2px',
                    height: '1.5em',  // 稍微增加高度使其更明显
                    backgroundColor: '#ff0000',  // 使用红色使其更加明显，便于调试
                    verticalAlign: 'middle',
                    animation: 'blink 1s infinite',
                    position: 'relative',  // 相对定位，便于文本输入框定位参考
                    marginLeft: '2px',
                    marginRight: '2px'
                });

                // 在当前位置插入光标
                if (this.currentFocus === this.elementTags.length) {
                    this.editArea.appendChild(cursor);
                } else {
                    this.editArea.insertBefore(cursor, this.elementTags[this.currentFocus]);
                }

                // 添加ID以便更容易找到
                cursor.id = 'formula-cursor-active';

                // 确保光标可见 - 滚动到视图
                setTimeout(() => {
                    cursor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 10);
            }
        } catch (error) {
            console.error('Error updating focus indicator:', error);
        }
    }

    /**
     * 删除元素
     */
    private deleteElement(): void {
        if (this.currentFocus > 0 && this.currentFocus <= this.formulaElements.length) {
            // 删除当前位置前的元素
            const index = this.currentFocus - 1;
            this.formulaElements.splice(index, 1);

            // 移除对应的标签
            this.editArea.removeChild(this.elementTags[index]);
            this.elementTags.splice(index, 1);

            // 更新焦点位置
            this.currentFocus--;
            this.updateFocusIndicator();

            // 触发变更事件
            this.triggerChangeEvent();
        }
    }

    /**
     * 创建工具栏
     */
    private createToolbar(): HTMLElement {
        const toolbar = createElement<HTMLDivElement>('div', 'formula-editor-toolbar');

        setStyles(toolbar, {
            display: 'flex',
            padding: '8px',
            borderBottom: this.options.styles?.border || DEFAULT_STYLES.border,
            backgroundColor: '#f5f5f5'
        });

        // 创建符号按钮
        this.symbolButton = createElement<HTMLButtonElement>('button', 'formula-editor-symbol-btn');
        this.symbolButton.innerHTML = '&#931;'; // Sigma symbol

        setStyles(this.symbolButton, {
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
        });

        addEventListeners(this.symbolButton, {
            click: () => this.symbolPanel.toggle()
        });

        // 添加按钮到工具栏
        toolbar.appendChild(this.symbolButton);

        return toolbar;
    }

    /**
     * 创建编辑区域
     */
    private createEditArea(): HTMLElement {
        const editArea = createElement<HTMLDivElement>('div', 'formula-editor-edit-area');

        // 设置样式
        setStyles(editArea, {
            padding: '10px',
            minHeight: '100px',
            outline: 'none',
            fontSize: this.options.styles?.fontSize || DEFAULT_STYLES.fontSize,
            color: this.options.styles?.color || DEFAULT_STYLES.color,
            backgroundColor: this.options.styles?.backgroundColor || DEFAULT_STYLES.backgroundColor,
            width: this.options.styles?.width || DEFAULT_STYLES.width,
            boxSizing: 'border-box',
            fontFamily: 'Arial, sans-serif',
            cursor: 'text',
            position: 'relative',  // 添加相对定位，便于放置绝对定位的文本输入框
            overflow: 'auto'       // 确保滚动时位置计算正确
        });

        // 添加tabindex以便能够获取焦点
        editArea.setAttribute('tabindex', '0');

        // 添加事件监听
        addEventListeners(editArea, {
            focus: () => {
                this.triggerEvent(EventType.FOCUS);
                if (this.currentFocus === -1) {
                    this.setFocusToEnd();
                }
            },
            blur: (e) => {
                // 如果不是点击了文本输入框，才触发失焦事件
                const relatedTarget = e.relatedTarget as HTMLElement;
                if (!relatedTarget || !relatedTarget.classList.contains('formula-text-input')) {
                    this.hideTextInput();
                    this.triggerEvent(EventType.BLUR);
                }
            }
        });

        // 添加CSS样式支持光标动画和文本输入框
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            .formula-element {
                display: inline-block;
                padding: 3px 6px;
                margin: 3px;
                border-radius: 4px;
                background-color: #f0f0f0;
                border: 1px solid #ddd;
                user-select: none;
                transition: all 0.2s ease;
                font-family: 'Arial', sans-serif;
            }
            .formula-element:hover {
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                transform: translateY(-1px);
            }
            .formula-element-focused {
                background-color: #e3f2fd;
                border-color: #2196f3;
                box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
            }
            .formula-element-error {
                background-color: #ffebee;
                border-color: #f44336;
                box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.3);
            }
            .formula-element-symbol { 
                background-color: #e3f2fd; 
                color: #1565c0;
            }
            .formula-element-number { 
                background-color: #e8f5e9; 
                color: #2e7d32;
                font-weight: 500;
            }
            .formula-element-variable { 
                background-color: #fff8e1; 
                color: #ff8f00;
                font-style: italic;
            }
            .formula-element-operator { 
                background-color: #fce4ec; 
                color: #c2185b;
                font-weight: bold;
            }
            .formula-element-function { 
                background-color: #f3e5f5; 
                color: #7b1fa2;
                font-weight: 500;
            }
            .formula-element-bracket { 
                background-color: #ede7f6; 
                color: #512da8;
                font-weight: bold;
            }
            .formula-text-input {
                position: absolute;
                min-width: 50px;
                max-width: 150px;
                z-index: 10;
                padding: 4px 8px;
                margin: 2px;
                border-radius: 4px;
                background-color: #e3f2fd;
                border: 1px solid #2196f3;
                font-size: inherit;
                font-family: inherit;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                outline: none;
                animation: fadeIn 0.2s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .formula-cursor {
                display: inline-block;
                width: 2px;
                height: 1.5em;
                background-color: #ff0000;
                vertical-align: middle;
                animation: blink 1s infinite;
                position: relative;
                margin-left: 2px;
                margin-right: 2px;
            }
            /* 添加插入反馈动画 */
            @keyframes elementInserted {
                0% { transform: scale(0.8); opacity: 0.5; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .formula-element-inserted {
                animation: elementInserted 0.3s ease;
            }
            .formula-error-message {
                background-color: #ffebee;
                color: #b71c1c;
                padding: 8px 12px;
                margin-top: 8px;
                border-radius: 4px;
                border-left: 4px solid #f44336;
                font-size: 14px;
                line-height: 1.5;
                display: none;
                animation: fadeIn 0.3s ease;
            }
        `;
        document.head.appendChild(style);

        return editArea;
    }

    /**
     * 创建文本输入组件
     */
    private createTextInput(): void {
        console.log('Creating text input element');

        // 确保编辑区域已经初始化
        if (!this.editArea) {
            console.error('Cannot create text input: editArea not initialized');
            return;
        }

        try {
            // 如果已经存在，先移除它
            if (this.textInputElement) {
                if (this.textInputElement.parentNode) {
                    this.textInputElement.parentNode.removeChild(this.textInputElement);
                }
            }

            const input = createElement<HTMLInputElement>('input', 'formula-text-input');
            input.type = 'text';
            input.style.display = 'none';
            input.placeholder = '输入文本...';

            // 确保输入框样式明显
            input.style.fontSize = '16px';
            input.style.padding = '5px';
            input.style.borderRadius = '4px';
            input.style.border = '2px solid #2196f3';
            input.style.backgroundColor = '#e3f2fd';
            input.style.zIndex = '9999';

            this.textInputElement = input;

            // 添加到编辑区域的末尾
            this.editArea.appendChild(input);
            console.log('Text input element created and appended to edit area');
        } catch (error) {
            console.error('Error creating text input:', error);
        }
    }

    /**
     * 创建错误信息显示元素
     */
    private createErrorMessageElement(): void {
        this.errorMessageElement = createElement<HTMLDivElement>('div', 'formula-error-message');
        this.errorMessageElement.style.display = 'none';
        this.editorContainer.appendChild(this.errorMessageElement);
    }

    /**
     * 显示错误信息
     */
    private showErrorMessage(message: string): void {
        if (!this.errorMessageElement) {
            this.createErrorMessageElement();
        }

        if (this.errorMessageElement) {
            this.errorMessageElement.textContent = message;
            this.errorMessageElement.style.display = 'block';
        }
    }

    /**
     * 隐藏错误信息
     */
    private hideErrorMessage(): void {
        if (this.errorMessageElement) {
            this.errorMessageElement.style.display = 'none';
        }
    }

    /**
     * 验证公式
     */
    public validateFormula(): ValidationResult {
        // 清除之前的错误标记
        this.clearErrorHighlights();

        // 如果没有配置验证规则，则始终视为有效
        if (!this.options.validation ||
            (!this.options.validation.rules?.length && !this.options.validation.customValidator)) {
            return { valid: true, errors: [] };
        }

        const formula = this.getFormula();
        let result: ValidationResult = { valid: true, errors: [] };

        // 使用自定义验证器
        if (this.options.validation.customValidator) {
            result = this.options.validation.customValidator(formula, [...this.formulaElements]);
        }
        // 使用内置验证规则
        else if (this.options.validation.rules && this.options.validation.rules.length > 0) {
            result = FormulaValidator.validate(formula, [...this.formulaElements], this.options.validation.rules);
        }

        // 保存验证结果
        this.lastValidationResult = result;

        // 如果验证失败，处理错误
        if (!result.valid) {
            // 触发验证错误事件
            this.triggerEvent(EventType.VALIDATION_ERROR, result);

            // 显示第一个错误消息
            if (result.errors.length > 0) {
                this.showErrorMessage(result.errors[0].message);

                // 高亮错误元素
                if (result.errors[0].elementIndex !== undefined &&
                    result.errors[0].elementIndex >= 0 &&
                    result.errors[0].elementIndex < this.elementTags.length) {
                    this.highlightErrorElement(result.errors[0].elementIndex);
                }
            }
        } else {
            // 验证成功，触发验证成功事件
            this.triggerEvent(EventType.VALIDATION_SUCCESS, result);

            // 隐藏错误信息
            this.hideErrorMessage();
        }

        return result;
    }

    /**
     * 高亮显示错误元素
     */
    private highlightErrorElement(index: number): void {
        if (index >= 0 && index < this.elementTags.length) {
            this.elementTags[index].classList.add('formula-element-error');
        }
    }

    /**
     * 清除错误高亮
     */
    private clearErrorHighlights(): void {
        this.elementTags.forEach(tag => {
            tag.classList.remove('formula-element-error');
        });

        // 隐藏错误信息
        this.hideErrorMessage();
    }

    /**
     * 获取最后一次验证结果
     */
    public getLastValidationResult(): ValidationResult | null {
        return this.lastValidationResult;
    }

    /**
     * 设置验证规则
     */
    public setValidationRules(rules: ValidationRule[]): void {
        if (!this.options.validation) {
            this.options.validation = {};
        }
        this.options.validation.rules = rules;
    }

    /**
     * 启用/禁用自动验证
     */
    public setAutoValidate(autoValidate: boolean): void {
        if (!this.options.validation) {
            this.options.validation = {};
        }
        this.options.validation.autoValidate = autoValidate;
    }

    /**
     * 设置自定义验证器
     */
    public setCustomValidator(validator: (formula: string, elements: FormulaElement[]) => ValidationResult): void {
        if (!this.options.validation) {
            this.options.validation = {};
        }
        this.options.validation.customValidator = validator;
    }
} 