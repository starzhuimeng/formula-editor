# Formula Editor

一个基于TypeScript的数学公式编辑器，支持公式编辑、验证和展示功能。

## 功能特点

- 直观的公式编辑器界面
- 支持各种数学符号和函数
- 自定义符号配置
- 公式验证功能
- 可自定义样式

## 安装

```bash
npm install formula-editor
```

## 基本使用

```javascript
import { FormulaEditor } from 'formula-editor';

// 创建编辑器实例
const editor = new FormulaEditor({
  container: document.getElementById('editor-container')
});
```

## 配置选项

```javascript
const editor = new FormulaEditor({
  container: document.getElementById('editor-container'),
  initialFormula: 'a+b=c',
  readOnly: false,
  symbols: {
    basic: ['+', '-', '×', '÷', '='],
    greek: ['α', 'β', 'γ']
  },
  styles: {
    fontSize: '16px',
    color: '#333',
    backgroundColor: '#fff'
  },
  validation: {
    autoValidate: true,
    rules: [
      { type: 'bracketsMatch', message: '括号不匹配' },
      { type: 'operatorsSurrounded', message: '运算符两侧必须有操作数' }
    ]
  }
});
```

## API参考

### 基本操作

```javascript
// 设置公式
editor.setFormula('x^2+y^2=z^2');

// 获取公式
const formula = editor.getFormula();

// 清空编辑器
editor.clear();

// 设置只读模式
editor.setReadOnly(true);
```

### 元素操作API

```javascript
// 获取所有公式元素
const elements = editor.getFormulaElements();

// 获取指定位置的元素
const element = editor.getElementAt(2);

// 在指定位置插入元素
editor.insertElement({
  type: 'number',
  value: '42'
}, 3);

// 更新指定位置的元素
editor.updateElement(1, {
  value: '×',
  type: 'operator'
});

// 删除指定位置的元素
editor.removeElement(4);

// 添加元素到末尾
editor.appendElement({
  type: 'variable',
  value: 'x'
});

// 查找符合条件的元素
const operators = editor.findElements((el) => el.type === 'operator');

// 设置焦点到指定位置
editor.setFocusToIndex(2);

// 获取当前焦点位置
const focusIndex = editor.getCurrentFocusIndex();

// 批量设置元素
editor.setElements([
  { type: 'variable', value: 'a' },
  { type: 'operator', value: '+' },
  { type: 'variable', value: 'b' }
]);

// 复制元素到剪贴板
editor.copyElement(3);

// 获取公式的纯文本表示
const text = editor.getFormulaText();

// 删除当前选中的元素
editor.deleteCurrentElement();
```

### 验证相关

```javascript
// 验证公式
const result = editor.validateFormula();

// 获取最近一次验证结果
const lastResult = editor.getLastValidationResult();

// 设置验证规则
editor.setValidationRules([
  { type: 'bracketsMatch', message: '括号不匹配' }
]);

// 设置自动验证
editor.setAutoValidate(true);

// 设置自定义验证器
editor.setCustomValidator((formula, elements) => {
  // 自定义验证逻辑
  return {
    valid: true,
    errors: []
  };
});
```

### 事件监听

```javascript
// 添加变更事件监听
editor.addEventListener('change', (formula) => {
  console.log('Formula changed:', formula);
});

// 添加验证错误事件监听
editor.addEventListener('validationError', (errors) => {
  console.log('Validation errors:', errors);
});

// 移除事件监听
editor.removeEventListener('change', callback);
```

## 自定义符号

```javascript
const editor = new FormulaEditor({
  container: document.getElementById('editor-container'),
  symbols: {
    basic: [
      { value: '+', type: 'operator', description: '加法' },
      { value: '-', type: 'operator', description: '减法' }
    ],
    customGroup: {
      name: 'customGroup',
      displayName: '自定义符号',
      symbols: [
        { value: '∑', type: 'symbol', description: '求和' },
        { value: '∏', type: 'symbol', description: '求积' }
      ],
      style: {
        backgroundColor: '#f0f0f0',
        color: '#333',
        fontWeight: 'bold'
      }
    }
  }
});
```

## 许可证

MIT 