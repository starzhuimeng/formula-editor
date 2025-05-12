import { SymbolsConfig, SymbolItem, SymbolGroup } from '../types';
import { createElement, appendChildren, setStyles, addEventListeners } from '../utils/dom';

export interface SymbolPanelOptions {
    symbols: SymbolsConfig;
    onSymbolClick: (symbol: string | SymbolItem) => void;
    container: HTMLElement;
    styles?: {
        backgroundColor?: string;
        symbolColor?: string;
        borderColor?: string;
        tabColor?: string;
        activeTabColor?: string;
        activeTabBorderColor?: string;
    };
}

/**
 * 符号面板类
 */
export class SymbolPanel {
    private container: HTMLElement;
    private panel: HTMLElement;
    private options: SymbolPanelOptions;
    private tabButtons: HTMLElement[] = [];
    private contentPanels: HTMLElement[] = [];
    private activeTabIndex = 0;

    constructor(options: SymbolPanelOptions) {
        this.options = options;
        this.container = options.container;
        this.panel = createElement<HTMLDivElement>('div', 'formula-editor-symbol-panel');

        this.initStyles();
        this.renderPanel();
        this.container.appendChild(this.panel);
    }

    /**
     * 初始化面板样式
     */
    private initStyles(): void {
        const styles = this.options.styles || {};

        setStyles(this.panel, {
            backgroundColor: styles.backgroundColor || '#fff',
            border: `1px solid ${styles.borderColor || '#ddd'}`,
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            margin: '8px 0',
            overflow: 'hidden',
            width: '100%'
        });
    }

    /**
     * 渲染符号面板
     */
    private renderPanel(): void {
        // 创建标签页导航
        const tabNav = createElement<HTMLDivElement>('div', 'formula-editor-symbol-tabs');
        setStyles(tabNav, {
            display: 'flex',
            borderBottom: `2px solid ${this.options.styles?.borderColor || '#ddd'}`,
            backgroundColor: '#f5f5f5',
            flexWrap: 'wrap',
            padding: '4px 4px 0 4px',
            position: 'relative',
            zIndex: '1'
        });

        // 创建内容区域
        const contentContainer = createElement<HTMLDivElement>('div', 'formula-editor-symbol-content');
        setStyles(contentContainer, {
            padding: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            maxHeight: '180px',
            overflowY: 'auto',
            backgroundColor: '#fff',
            borderTop: `1px solid ${this.options.styles?.borderColor || '#eee'}`
        });

        // 解析组并创建标签
        const groups = this.parseGroups();
        groups.forEach((group, index) => {
            // 创建标签按钮
            const tabButton = this.createTabButton(group, index);
            this.tabButtons.push(tabButton);
            tabNav.appendChild(tabButton);

            // 创建内容面板
            const contentPanel = this.createContentPanel(group, index);
            this.contentPanels.push(contentPanel);
            contentContainer.appendChild(contentPanel);
        });

        // 默认激活第一个标签
        if (this.tabButtons.length > 0) {
            this.activateTab(0);
        }

        // 添加到面板
        appendChildren(this.panel, tabNav, contentContainer);
    }

    /**
     * 解析符号组
     * 支持两种格式：
     * 1. 老格式: { category: symbols[] }
     * 2. 新格式: { category: SymbolGroup }
     */
    private parseGroups(): { name: string; displayName: string; symbols: (string | SymbolItem)[]; style?: any }[] {
        const result: { name: string; displayName: string; symbols: (string | SymbolItem)[]; style?: any }[] = [];
        const categories = Object.keys(this.options.symbols);

        categories.forEach(category => {
            const value = this.options.symbols[category];

            if (value) {
                // 检查是否为 SymbolGroup 对象 (有 symbols 属性)
                if (typeof value === 'object' && 'symbols' in value) {
                    const group = value as SymbolGroup;
                    result.push({
                        name: category,
                        displayName: group.displayName || this.formatCategoryName(category),
                        symbols: group.symbols,
                        style: group.style
                    });
                }
                // 老格式: 直接是符号数组
                else if (Array.isArray(value)) {
                    result.push({
                        name: category,
                        displayName: this.formatCategoryName(category),
                        symbols: value as (string | SymbolItem)[]
                    });
                }
            }
        });

        return result;
    }

    /**
     * 创建标签按钮
     */
    private createTabButton(
        group: { name: string; displayName: string; style?: any },
        index: number
    ): HTMLElement {
        const button = createElement<HTMLButtonElement>('button', 'formula-editor-tab-button');
        button.textContent = group.displayName;

        // 基本样式
        const buttonStyle: Partial<CSSStyleDeclaration> = {
            padding: '10px 15px',
            border: 'none',
            background: '#f0f0f0',
            cursor: 'pointer',
            outline: 'none',
            borderRight: `1px solid ${this.options.styles?.borderColor || '#ddd'}`,
            fontWeight: 'normal',
            color: this.options.styles?.tabColor || '#333',
            transition: 'all 0.2s ease',
            margin: '0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: '85px',
            textAlign: 'center',
            fontSize: '14px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        };

        // 应用自定义样式
        if (group.style) {
            Object.assign(buttonStyle, group.style);
        }

        setStyles(button, buttonStyle);

        addEventListeners(button, {
            click: () => this.activateTab(index)
        });

        return button;
    }

    /**
     * 创建内容面板
     */
    private createContentPanel(
        group: { name: string; symbols: (string | SymbolItem)[] },
        index: number
    ): HTMLElement {
        const panel = createElement<HTMLDivElement>('div', 'formula-editor-content-panel');

        setStyles(panel, {
            display: 'none',
            flexWrap: 'wrap',
            width: '100%',
            padding: '5px'
        });

        // 为每个符号创建按钮
        group.symbols.forEach(symbolItem => {
            const symbolButton = createElement<HTMLButtonElement>('button', 'formula-editor-symbol-button');

            // 获取符号显示值
            const displayValue = typeof symbolItem === 'string' ?
                symbolItem :
                symbolItem.value;

            symbolButton.textContent = displayValue;

            // 如果有描述，添加为title属性
            if (typeof symbolItem !== 'string' && symbolItem.description) {
                symbolButton.title = symbolItem.description;
            }

            // 基本样式
            const buttonStyle: Partial<CSSStyleDeclaration> = {
                width: '40px',
                height: '40px',
                margin: '5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: `1px solid ${this.options.styles?.borderColor || '#ddd'}`,
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                color: this.options.styles?.symbolColor || '#333',
                fontSize: '18px',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            };

            // 如果有自定义样式，应用它
            if (typeof symbolItem !== 'string' && symbolItem.style) {
                Object.assign(buttonStyle, symbolItem.style);
            }

            setStyles(symbolButton, buttonStyle);

            addEventListeners(symbolButton, {
                click: () => this.options.onSymbolClick(symbolItem),
                mousedown: (e) => {
                    setStyles(symbolButton, {
                        transform: 'scale(0.95)',
                        boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)'
                    });
                },
                mouseup: (e) => {
                    setStyles(symbolButton, {
                        transform: 'scale(1)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    });
                },
                mouseleave: (e) => {
                    setStyles(symbolButton, {
                        transform: 'scale(1)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    });
                }
            });

            panel.appendChild(symbolButton);
        });

        return panel;
    }

    /**
     * 激活指定的标签
     */
    private activateTab(index: number): void {
        // 更新标签按钮样式
        this.tabButtons.forEach((button, i) => {
            if (i === index) {
                setStyles(button, {
                    fontWeight: 'bold',
                    borderBottom: `3px solid ${this.options.styles?.activeTabBorderColor || '#007bff'}`,
                    backgroundColor: this.options.styles?.activeTabColor || '#fff',
                    color: this.options.styles?.activeTabColor ? undefined : '#007bff',
                    boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.05)'
                });
            } else {
                setStyles(button, {
                    fontWeight: 'normal',
                    borderBottom: 'none',
                    backgroundColor: '#f0f0f0',
                    color: this.options.styles?.tabColor || '#555',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                });
            }
        });

        // 显示/隐藏内容面板
        this.contentPanels.forEach((panel, i) => {
            panel.style.display = i === index ? 'flex' : 'none';
        });

        this.activeTabIndex = index;
    }

    /**
     * 格式化分类名称
     */
    private formatCategoryName(category: string): string {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    /**
     * 显示符号面板
     */
    show(): void {
        this.panel.style.display = 'flex';
    }

    /**
     * 隐藏符号面板
     */
    hide(): void {
        this.panel.style.display = 'none';
    }

    /**
     * 切换显示/隐藏状态
     */
    toggle(): void {
        if (this.panel.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }
} 