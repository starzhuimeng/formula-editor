/**
 * DOM操作工具函数
 */

/**
 * 创建DOM元素
 * @param tag 标签名
 * @param className 类名
 * @param attributes 属性对象
 * @returns HTMLElement
 */
export function createElement<T extends HTMLElement>(
    tag: string,
    className?: string,
    attributes?: Record<string, string>
): T {
    const element = document.createElement(tag) as T;

    if (className) {
        element.className = className;
    }

    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    return element;
}

/**
 * 将元素添加到父元素
 * @param parent 父元素
 * @param children 子元素列表
 */
export function appendChildren(parent: HTMLElement, ...children: HTMLElement[]): void {
    children.forEach(child => parent.appendChild(child));
}

/**
 * 设置元素样式
 * @param element 目标元素
 * @param styles 样式对象
 */
export function setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.entries(styles).forEach(([key, value]) => {
        if (value !== undefined) {
            (element.style as any)[key] = value;
        }
    });
}

/**
 * 添加事件监听器
 * @param element 目标元素
 * @param eventType 事件类型
 * @param handler 事件处理函数
 * @param options 事件选项
 */
export function addEventListeners<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    events: { [key in K]?: (this: HTMLElement, ev: HTMLElementEventMap[key]) => any }
): void {
    Object.entries(events).forEach(([eventType, handler]) => {
        element.addEventListener(eventType, handler as EventListener);
    });
}

/**
 * 移除事件监听器
 * @param element 目标元素
 * @param eventType 事件类型
 * @param handler 事件处理函数
 */
export function removeEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    eventType: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
): void {
    element.removeEventListener(eventType, handler as EventListener);
}

/**
 * 查找元素
 * @param selector 选择器
 * @param parent 父元素（可选，默认为document）
 * @returns 匹配的元素或null
 */
export function querySelector<T extends HTMLElement>(
    selector: string,
    parent: HTMLElement | Document = document
): T | null {
    return parent.querySelector<T>(selector);
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId(): string {
    return `fe-${Math.random().toString(36).substring(2, 10)}`;
} 