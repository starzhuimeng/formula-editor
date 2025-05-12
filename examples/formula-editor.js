// Formula Editor - 包装模块
(function (global) {
    // 定义ElementType枚举
    const ElementType = {
        SYMBOL: 'symbol',
        NUMBER: 'number',
        VARIABLE: 'variable',
        FUNCTION: 'function',
        BRACKET: 'bracket',
        OPERATOR: 'operator',
        SUPERSCRIPT: 'superscript',
        SUBSCRIPT: 'subscript',
        FRACTION: 'fraction',
        ROOT: 'root',
        INTEGRAL: 'integral'
    };

    // 定义EventType枚举
    const EventType = {
        CHANGE: 'change',
        FOCUS: 'focus',
        BLUR: 'blur',
        SYMBOL_CLICK: 'symbolClick',
        VALIDATION_ERROR: 'validationError',
        VALIDATION_SUCCESS: 'validationSuccess'
    };

    // 定义ValidationRuleType枚举
    const ValidationRuleType = {
        BRACKETS_MATCH: 'bracketsMatch',
        OPERATORS_SURROUNDED: 'operatorsSurrounded',
        NON_EMPTY: 'nonEmpty',
        HAS_EQUALS: 'hasEquals',
        NO_CONSECUTIVE_OPERANDS: 'noConsecutiveOperands',
        CUSTOM: 'custom'
    };

    // 创建基本的FormulaEditor类
    class FormulaEditor {
        constructor(options) {
            this.container = options.container;
            this.symbols = options.symbols || {};
            this.validation = options.validation;
            this.formulaElements = [];
            this.eventListeners = {};

            // 初始化DOM结构
            this.initDOM();

            if (options.initialFormula) {
                this.setFormula(options.initialFormula);
            }
        }

        // 初始化DOM结构
        initDOM() {
            this.container.innerHTML = `
                <div class="formula-editor-container">
                    <div class="formula-editor-toolbar">
                        <button class="formula-editor-symbol-btn">∑</button>
                    </div>
                    <div class="formula-editor-edit-area" tabindex="0"></div>
                </div>
            `;

            // 添加基本样式
            const style = document.createElement('style');
            style.textContent = `
                .formula-editor-container {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-family: Arial, sans-serif;
                }
                .formula-editor-toolbar {
                    padding: 8px;
                    background-color: #f5f5f5;
                    border-bottom: 1px solid #ddd;
                }
                .formula-editor-edit-area {
                    min-height: 100px;
                    padding: 10px;
                    outline: none;
                }
                .formula-element {
                    display: inline-block;
                    padding: 3px 6px;
                    margin: 3px;
                    border-radius: 4px;
                    background-color: #f0f0f0;
                    border: 1px solid #ddd;
                }
                .formula-element-variable { background-color: #fff8e1; color: #ff8f00; }
                .formula-element-number { background-color: #e8f5e9; color: #2e7d32; }
                .formula-element-operator { background-color: #fce4ec; color: #c2185b; }
                .formula-element-bracket { background-color: #ede7f6; color: #512da8; }
            `;
            document.head.appendChild(style);

            // 获取DOM引用
            this.editArea = this.container.querySelector('.formula-editor-edit-area');
            this.symbolButton = this.container.querySelector('.formula-editor-symbol-btn');

            // 添加基本事件处理
            this.editArea.addEventListener('click', () => {
                this.triggerEvent(EventType.FOCUS);
            });

            this.editArea.addEventListener('blur', () => {
                this.triggerEvent(EventType.BLUR);
            });
        }

        // API: 设置公式
        setFormula(formula) {
            this.editArea.innerHTML = '';
            this.formulaElements = [];

            // 简单解析公式为元素（实际应用中需要更复杂的解析器）
            for (let i = 0; i < formula.length; i++) {
                const char = formula[i];
                let type = ElementType.VARIABLE;

                if (/[0-9]/.test(char)) {
                    type = ElementType.NUMBER;
                } else if (/[+\-*\/=]/.test(char)) {
                    type = ElementType.OPERATOR;
                } else if (/[\(\)\[\]\{\}]/.test(char)) {
                    type = ElementType.BRACKET;
                }

                const element = {
                    type: type,
                    value: char,
                    id: 'element-' + Math.random().toString(36).substring(2, 9)
                };

                this.formulaElements.push(element);
                this.appendElementToDOM(element);
            }

            this.triggerEvent(EventType.CHANGE, { formula });
        }

        // 向DOM添加元素
        appendElementToDOM(element) {
            const tag = document.createElement('span');
            tag.className = `formula-element formula-element-${element.type}`;
            tag.textContent = element.value;
            tag.dataset.id = element.id;
            this.editArea.appendChild(tag);
        }

        // API: 获取公式
        getFormula() {
            return this.formulaElements.map(el => el.value).join('');
        }

        // API: 获取公式元素
        getFormulaElements() {
            return [...this.formulaElements];
        }

        // API: 获取指定位置的元素
        getElementAt(index) {
            if (index >= 0 && index < this.formulaElements.length) {
                return { ...this.formulaElements[index] };
            }
            return null;
        }

        // API: 插入元素
        insertElement(element, index = this.formulaElements.length) {
            const newElement = {
                ...element,
                id: 'element-' + Math.random().toString(36).substring(2, 9)
            };

            // 插入到数组
            this.formulaElements.splice(index, 0, newElement);

            // 更新DOM
            this.updateDOM();

            this.triggerEvent(EventType.CHANGE, { formula: this.getFormula() });
            return newElement;
        }

        // API: 添加元素到末尾
        appendElement(element) {
            return this.insertElement(element, this.formulaElements.length);
        }

        // API: 更新元素
        updateElement(index, update) {
            if (index < 0 || index >= this.formulaElements.length) {
                return false;
            }

            this.formulaElements[index] = {
                ...this.formulaElements[index],
                ...update
            };

            this.updateDOM();
            this.triggerEvent(EventType.CHANGE, { formula: this.getFormula() });
            return true;
        }

        // API: 删除元素
        removeElement(index) {
            if (index < 0 || index >= this.formulaElements.length) {
                return false;
            }

            this.formulaElements.splice(index, 1);
            this.updateDOM();
            this.triggerEvent(EventType.CHANGE, { formula: this.getFormula() });
            return true;
        }

        // API: 删除当前选中元素
        deleteCurrentElement() {
            return this.removeElement(this.formulaElements.length - 1);
        }

        // 更新DOM以匹配模型
        updateDOM() {
            this.editArea.innerHTML = '';
            this.formulaElements.forEach(element => {
                this.appendElementToDOM(element);
            });
        }

        // API: 清空公式
        clear() {
            this.formulaElements = [];
            this.editArea.innerHTML = '';
            this.triggerEvent(EventType.CHANGE, { formula: '' });
        }

        // API: 设置只读模式
        setReadOnly(readOnly) {
            this.symbolButton.style.display = readOnly ? 'none' : 'block';
            if (readOnly) {
                this.editArea.removeAttribute('tabindex');
            } else {
                this.editArea.setAttribute('tabindex', '0');
            }
        }

        // API: 查找元素
        findElements(predicate) {
            return this.formulaElements
                .map((element, index) => ({ element, index }))
                .filter(({ element, index }) => predicate(element, index))
                .map(({ index }) => index);
        }

        // API: 设置光标位置
        setFocusToIndex(index) {
            if (index < 0 || index > this.formulaElements.length) {
                return false;
            }
            return true;
        }

        // API: 获取光标位置
        getCurrentFocusIndex() {
            return this.formulaElements.length;
        }

        // API: 批量设置元素
        setElements(elements) {
            this.clear();
            elements.forEach(element => {
                this.appendElement(element);
            });
        }

        // API: 获取纯文本
        getFormulaText() {
            return this.getFormula();
        }

        // API: 复制元素
        copyElement(index) {
            if (index < 0 || index >= this.formulaElements.length) {
                return false;
            }
            try {
                navigator.clipboard.writeText(this.formulaElements[index].value);
                return true;
            } catch (error) {
                return false;
            }
        }

        // API: 验证公式
        validateFormula() {
            const isValid = true; // 简化版，始终返回有效
            const result = {
                valid: isValid,
                errors: []
            };

            if (isValid) {
                this.triggerEvent(EventType.VALIDATION_SUCCESS, result);
            } else {
                this.triggerEvent(EventType.VALIDATION_ERROR, result);
            }

            return result;
        }

        // API: 获取验证结果
        getLastValidationResult() {
            return { valid: true, errors: [] };
        }

        // API: 设置验证规则
        setValidationRules(rules) {
            // 简化实现
        }

        // API: 设置自动验证
        setAutoValidate(autoValidate) {
            // 简化实现
        }

        // 事件处理
        addEventListener(event, callback) {
            if (!this.eventListeners[event]) {
                this.eventListeners[event] = [];
            }
            this.eventListeners[event].push(callback);
        }

        removeEventListener(event, callback) {
            if (this.eventListeners[event]) {
                this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
            }
        }

        triggerEvent(event, data) {
            if (this.eventListeners[event]) {
                this.eventListeners[event].forEach(callback => callback(data));
            }
        }
    }

    // 为全局对象添加命名空间
    global.FormulaEditor = {
        FormulaEditor,
        ElementType,
        EventType,
        ValidationRuleType
    };

})(typeof window !== 'undefined' ? window : this);
