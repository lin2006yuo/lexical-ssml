import {
    DecoratorNode,
    EditorConfig,
    ElementNode,
    LexicalNode,
    NodeKey,
    ParagraphNode,
    SerializedElementNode,
    SerializedLexicalNode,
    SerializedParagraphNode,
    SerializedTextNode,
    TextNode,
  } from 'lexical';
  import * as Mock from 'mockjs';
  import { ParagraphTitle } from './component';
  
  export class MinutesParagraphContainerNode extends ElementNode {
    static getType(): string {
      return 'minutes-paragraph-container';
    }
  
    static clone(node: MinutesParagraphContainerNode): MinutesParagraphContainerNode {
      return new MinutesParagraphContainerNode(node.__key);
    }
  
    constructor(key?: NodeKey) {
      super(key);
    }
  
    createDOM(config: EditorConfig): HTMLElement {
      const div = document.createElement('div');
      div.classList.add('minutes-paragraph-container');
      return div;
    }
  
    updateDOM(): false {
      return false;
    }
  
    static importJSON(_serializedNode: SerializedLexicalNode): LexicalNode {
      return $createMinutesParagraphContainerNode();
    }
  
    exportJSON(): SerializedElementNode {
      return super.exportJSON();
    }
  }
  
  export class MinutesParagraphTitleNode extends DecoratorNode<React.ReactElement> {
    static getType(): string {
      return 'minutes-paragraph-title';
    }
  
    static clone(node: MinutesParagraphTitleNode): MinutesParagraphTitleNode {
      return new MinutesParagraphTitleNode(node.__key);
    }
  
    constructor(key?: NodeKey) {
      super(key);
    }
  
    createDOM(config: EditorConfig): HTMLElement {
      const div = document.createElement('div');
      div.classList.add('minutes-paragraph-title');
      return div;
    }
  
    updateDOM(): false {
      return false;
    }
  
    static importJSON(_serializedNode: SerializedLexicalNode): LexicalNode {
      return $createMinutesParagraphTitleNode();
    }
  
    exportJSON(): SerializedLexicalNode {
      return super.exportJSON();
    }
  
    decorate() {
      return <ParagraphTitle />;
    }
  }
  
  export class MinutesParagraphContentNode extends ElementNode {
    static getType(): string {
      return 'minutes-paragraph-content';
    }
  
    static clone(node: MinutesParagraphContentNode): MinutesParagraphContentNode {
      return new MinutesParagraphContentNode(node.__key);
    }
  
    constructor(key?: NodeKey) {
      super(key);
      if (key) return;
  
      const sentences = Array.from({ length: Mock.Random.natural(1, 10) }, () => {
        const sentenceNode = $createMinutesSentenceNode(Mock.Random.guid());
  
        const words = Array.from({ length: Mock.Random.natural(2, 15) }, () => {
          const textNode = $createMinutesTextNode(Mock.Random.guid(), Mock.Random.cword(2, 6));
          if (Math.random() < 0.1) textNode.toggleFormat('bold');
          if (Math.random() < 0.1) textNode.toggleFormat('italic');
          return textNode;
        });
  
        const lastElement = words[words.length - 1];
        lastElement.setTextContent(`${lastElement.getTextContent()}。`);
  
        sentenceNode.append(...words);
  
        return sentenceNode;
      });
  
      this.append(...sentences);
    }
  
    createDOM(config: EditorConfig): HTMLElement {
      const div = document.createElement('div');
      div.classList.add('minutes-paragraph-content');
      return div;
    }
  
    updateDOM(): false {
      return false;
    }
  
    static importJSON(_serializedNode: SerializedLexicalNode): LexicalNode {
      return $createMinutesParagraphContentNode();
    }
  
    exportJSON(): SerializedElementNode {
      return super.exportJSON();
    }
  }
  
  export class MinutesSentenceNode extends ParagraphNode {
    __sid: string;
    __active: boolean;
  
    static getType(): string {
      return 'minutes-sentence';
    }
  
    static clone(node: MinutesSentenceNode): MinutesSentenceNode {
      return new MinutesSentenceNode(node.__sid, node.__active, node.__key);
    }
  
    constructor(sid: string, active: boolean, key?: NodeKey) {
      super(key);
      this.__sid = sid;
      this.__active = active;
    }
  
    createDOM(config: EditorConfig): HTMLElement {
      const dom = super.createDOM(config);
      dom.dataset.sid = this.__sid;
      return dom;
    }
  
    updateDOM(prevNode: MinutesSentenceNode, dom: HTMLElement): boolean {
      if (prevNode.__active !== this.__active) {
        dom.classList.toggle('active', this.__active);
      }
  
      return false;
    }
  
    static importJSON(serializedNode: SerializedParagraphNode): MinutesSentenceNode {
      return new MinutesSentenceNode('', false);
    }
  
    exportJSON() {
      return super.exportJSON();
    }
  
    setActive(active: boolean) {
      this.getWritable().__active = active;
    }
  }
  
  export class MinutesTextNode extends TextNode {
    __cid: string;
  
    static getType(): string {
      return 'minutes-text';
    }
  
    static clone(node: MinutesTextNode): MinutesTextNode {
      return new MinutesTextNode(node.__cid, node.__text, node.__key);
    }
  
    constructor(cid: string, text: string, key?: NodeKey) {
      super(text, key);
      this.__cid = cid;
    }
  
    createDOM(config: EditorConfig): HTMLElement {
      const dom = super.createDOM(config);
      dom.dataset.cid = this.__cid;
      return dom;
    }
  
    static importJSON(serializedNode: SerializedTextNode): MinutesTextNode {
      return new MinutesTextNode('', '');
    }
  
    exportJSON() {
      return super.exportJSON();
    }
  }
  
  export function $createMinutesParagraphContainerNode(): MinutesParagraphContainerNode {
    return new MinutesParagraphContainerNode();
  }
  
  export function $isMinutesParagraphContainerNode(node?: LexicalNode | null): node is MinutesParagraphContainerNode {
    return node instanceof MinutesParagraphContainerNode;
  }
  
  export function $createMinutesParagraphTitleNode(): MinutesParagraphTitleNode {
    return new MinutesParagraphTitleNode();
  }
  
  export function $isMinutesParagraphTitleNode(node?: LexicalNode | null): node is MinutesParagraphTitleNode {
    return node instanceof MinutesParagraphTitleNode;
  }
  
  export function $createMinutesParagraphContentNode(): MinutesParagraphContentNode {
    return new MinutesParagraphContentNode();
  }
  
  export function $isMinutesParagraphContentNode(node?: LexicalNode | null): node is MinutesParagraphContentNode {
    return node instanceof MinutesParagraphContentNode;
  }
  
  export function $createMinutesSentenceNode(sid: string): MinutesSentenceNode {
    return new MinutesSentenceNode(sid, false);
  }
  
  export function $isMinutesSentenceNode(node?: LexicalNode | null): node is MinutesSentenceNode {
    return node instanceof MinutesSentenceNode;
  }
  
  export function $createMinutesTextNode(cid: string, text: string): MinutesTextNode {
    return new MinutesTextNode(cid, text);
  }
  
  export function $isMinutesTextNode(node?: LexicalNode | null): node is MinutesTextNode {
    return node instanceof MinutesTextNode;
  }