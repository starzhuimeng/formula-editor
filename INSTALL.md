# 安装与使用指南

## 开发环境准备

1. 安装Node.js环境：https://nodejs.org/ (建议使用14.x或更高版本)

2. 克隆项目并安装依赖：

```bash
# 安装项目依赖
npm install
```

## 开发命令

### 启动开发服务器

```bash
npm run dev
```

这将启动一个本地开发服务器，并自动打开浏览器访问 http://localhost:9000/demo/index.html

### 运行测试

```bash
npm test
```

### 构建项目

```bash
npm run build       # 构建库文件
npm run build:demo  # 构建演示页面
```

## 使用方法

### 基本使用

```html
<div id="editor-container"></div>

<script src="path/to/formula-editor.js"></script>
<script>
  const editor = new FormulaEditor.FormulaEditor({
    container: document.getElementById('editor-container')
  });
  
  // 设置公式
  editor.setFormula('E=mc^2');
  
  // 获取公式
  const formula = editor.getFormula();
</script>
```

### 使用NPM包

```javascript
// 安装
// npm install formula-editor

// 引入
import { FormulaEditor } from 'formula-editor';

// 创建编辑器实例
const editor = new FormulaEditor({
  container: document.getElementById('editor-container'),
  symbols: {
    // 自定义符号配置
    basic: ['=', '+', '-', '×', '÷'],
    math: ['∞', '∫', '∑', '∏'],
    // 更多分类...
  },
  styles: {
    fontSize: '18px',
    // 更多样式配置...
  }
});
```

## API 文档

### FormulaEditor 配置选项

| 选项 | 类型 | 描述 |
|------|------|------|
| container | HTMLElement | 必须。编辑器的挂载容器 |
| symbols | SymbolsConfig | 可选。符号配置 |
| initialFormula | string | 可选。初始公式 |
| readOnly | boolean | 可选。是否为只读模式 |
| styles | EditorStyles | 可选。样式配置 |

### 方法

| 方法 | 描述 |
|------|------|
| setFormula(formula: string) | 设置公式内容 |
| getFormula(): string | 获取当前公式内容 |
| clear() | 清空编辑器 |
| setReadOnly(readOnly: boolean) | 设置只读模式 |
| addEventListener(event: EventType, callback: Function) | 添加事件监听器 |
| removeEventListener(event: EventType, callback: Function) | 移除事件监听器 |

### 事件

| 事件 | 描述 |
|------|------|
| CHANGE | 公式内容变更时触发 |
| FOCUS | 编辑器获得焦点时触发 |
| BLUR | 编辑器失去焦点时触发 |
| SYMBOL_CLICK | 点击符号按钮时触发 |
``` 