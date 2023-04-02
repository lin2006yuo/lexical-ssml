import { $getRoot, $getSelection, $isElementNode, $isRangeSelection, $isRootNode, $isTextNode, $setSelection, DecoratorNode, EditorConfig, ElementNode, LexicalEditor, LexicalNode, RangeSelection, TextNode } from "lexical";
import { ReactNode } from "react";
import { } from 'lexical'

import './style.css'
import PreviewNode from "./preview-node";


export class SSMLParagraphList extends ElementNode {
    static getType(): string {
        return "ssml-paragraph-list";
    }

    static clone(node: SSMLParagraphList): SSMLParagraphList {
        return new SSMLParagraphList(node.__key);
    }

    createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("ssml-paragraph-list");
        return div;
    }

    updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
        return false;
    }
}

export class SSMLParagraph extends ElementNode {
    static getType(): string {
        return "ssml-paragraph";
    }

    static clone(node: SSMLParagraph): SSMLParagraph {
        return new SSMLParagraph(node.__key);
    }



    // true的话不允许移动？
    isInline(): boolean {
        return false
    }

    createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("ssml-paragraph");
        return div;
    }

    updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
        return false;
    }

    append(...nodesToAppend: LexicalNode[]): this {
        for (const node of nodesToAppend) {
            // 如果插入的是文本节点，则插入到 paragraph textarea 节点中
            if ($isTextNode(node)) {
                const paragraphTextarea = this.getLastChild()
                if (paragraphTextarea && $isSSMLParagraphTextarea(paragraphTextarea)) {
                    paragraphTextarea.append(node)
                } else {
                    throw Error("Text node can only be inserted into SSMLParagraphTextarea, but SSMLParagraphTextarea is not found")
                }
            } else {
                super.append(node)
            }
        }

        return this
    }

    // insertNewAfter(selection: RangeSelection, restoreSelection?: boolean | undefined): LexicalNode | null {
    //     const SSMLParagraph = $createSSMLParagraphNode()
    //     const root = $getRoot()
    //     console.log('insertNewAfter', $getSelection())
    //     if (!$isRootNode(root)) {
    //         throw Error("SSMLParagraph can only be inserted at the root level")
    //     }
    //     root.append(SSMLParagraph);

    //     console.log(111)
    //     return SSMLParagraph
    // }

    selectStart(): RangeSelection {
        const firstNode = this.getFirstDescendant();
        if ($isElementNode(firstNode) || $isTextNode(firstNode)) {
            return firstNode.select(0, 0);
        }
        // Decorator or LineBreak
        if (firstNode !== null) {
            const ssmlParagraph = firstNode.getParent();
            if ($isElementNode(ssmlParagraph)) {
                const textareaNode = ssmlParagraph.getLastChild()
                if (!textareaNode || !$isSSMLParagraphTextarea(textareaNode)) {
                    throw Error("SSMLParagraphTextarea is not found")
                }
                const last = textareaNode.getFirstChild()
                if ($isTextNode(last)) {
                    return last.select(0, 0)
                } else {
                    return ssmlParagraph.select(0, 0);
                }
            } else {
                return firstNode.selectPrevious();
            }
        } else {
            return this.select(0, 0);
        }

    }
}

export class SSMLParagraphPreviewNode extends DecoratorNode<ReactNode> {
    static getType(): string {
        return "ssml-paragraph-preview";
    }

    static clone(node: SSMLParagraphPreviewNode): SSMLParagraphPreviewNode {
        return new SSMLParagraphPreviewNode(node.__key);
    }


    isIsolated(): boolean {
        // true：如果后面的节点都被删除了，那么该节点也会被删除
        return true
    }

    createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("ssml-paragraph-preview");
        return div;
    }

    updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
        return false;
    }

    decorate(editor: LexicalEditor, config: EditorConfig): ReactNode {
        return (

            <PreviewNode />

        )
    }
}

export class SSMLParagraphTextarea extends ElementNode {
    static getType(): string {
        return "ssml-paragraph-textarea";
    }

    static clone(node: SSMLParagraphTextarea): SSMLParagraphTextarea {
        return new SSMLParagraphTextarea(node.__key);
    }

    createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("ssml-paragraph-textarea");
        return div;
    }

    updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
        return false;
    }


    // /**
    //  * 修复回车换行逻辑:
    //  *  packages/lexical-playground/src/nodes/ssml/nodes/ssml-paragraph.tsx
    //  *  textArea 获取下个兄弟节点逻辑 const nextSibling = this.getNextSibling() 返回 null 导致最后一个节点无法关联上一个节点
    //  *  例： 1 -- 3，1，3中间回车换行，形成 1 -- 2 -- 3
    //  *  此时会调用 2 节点的 getNextSibling 访问 3，让 3 节点的 prev 关联 2 节点，
    //  *  但由于 2 节点的 getNextSibling 返回 null，导致 3 节点的 prev 无法关联 2 节点
    //  * @returns 
    //  */
    // getNextSibling<T extends LexicalNode>(): T | null {
    //     const paragraph = this.getParagraph()
    //     return paragraph.getNextSibling()
    // }

    getNextParagraph(): SSMLParagraph | null {
        const paragraph = this.getParagraph()
        return paragraph.getNextSibling()
    }

    getParagraphList(): SSMLParagraphList {
        let node: any | null = this
        while (node && !$isRootNode(node)) {
            node = node.getParent()
            if ($isSSMLParagraphList(node)) {
                return node
            }
        }
        throw Error("SSMLParagraphTextarea must be in SSMLParagraphList")
    }

    getParagraph(): SSMLParagraph {
        let node: any | null = this
        while (node && !$isRootNode(node)) {
            node = node.getParent()
            if ($isSSMLParagraph(node)) {
                return node
            }
        }
        throw Error("SSMLParagraphTextarea must be in SSMLParagraph")
    }

    insertBefore(nodeToInsert: LexicalNode, restoreSelection?: boolean): LexicalNode {
        const paragraph = this.getParagraph()
        paragraph.insertBefore(nodeToInsert, restoreSelection)
        return nodeToInsert
    }

    insertNewAfter(selection: RangeSelection, restoreSelection?: boolean | undefined): LexicalNode | null {
        const SSMLParagraph = $createSSMLParagraphNode()

        // const list = this.getParagraphList()
        // if (!$isSSMLParagraphList(list)) {
        //     throw Error("SSMLParagraph can only be inserted at the paragraph list level")
        // }
        // list.append(SSMLParagraph);

        // const newSelection = selection

        // const anchor = newSelection.anchor;
        // const focus = newSelection.focus;


        // anchor.set("14", 1, 'text');
        // focus.set("14", 1, 'text');

        this.insertAfter(SSMLParagraph, restoreSelection)


        return SSMLParagraph
    }

    /**
   * Inserts a node after this LexicalNode (as the next sibling).
   * 换行
   * @param nodeToInsert - The node to insert after this one.
   * @param restoreSelection - Whether or not to attempt to resolve the
   * selection to the appropriate place after the operation is complete.
   * */
    insertAfter(nodeToInsert: LexicalNode, restoreSelection = true): LexicalNode {
        // errorOnReadOnly();
        // errorOnInsertTextNodeOnRoot(this, nodeToInsert);
        const writableSelf = this.getParagraph().getWritable(); // ssml paragraph
        const writableNodeToInsert = nodeToInsert.getWritable(); // new ssml paragraph
        const oldParent = writableNodeToInsert.getParent();
        const selection = $getSelection();
        let elementAnchorSelectionOnNode = false;
        let elementFocusSelectionOnNode = false;
        if (oldParent !== null) {
            // TODO: this is O(n), can we improve?
            const oldIndex = nodeToInsert.getIndexWithinParent();
            //   removeFromParent(writableNodeToInsert);
            if ($isRangeSelection(selection)) {
                const oldParentKey = oldParent.__key;
                const anchor = selection.anchor;
                const focus = selection.focus;
                elementAnchorSelectionOnNode =
                    anchor.type === 'element' &&
                    anchor.key === oldParentKey &&
                    anchor.offset === oldIndex + 1;
                elementFocusSelectionOnNode =
                    focus.type === 'element' &&
                    focus.key === oldParentKey &&
                    focus.offset === oldIndex + 1;
            }
        }
        const nextSibling = this.getNextParagraph();
        const writableParent = this.getParagraphList().getWritable(); // ssml paragraph list
        const insertKey = writableNodeToInsert.__key;
        const nextKey = writableSelf.__next;
        if (nextSibling === null) {
            writableParent.__last = insertKey;
        } else {
            const writableNextSibling = nextSibling.getWritable();
            writableNextSibling.__prev = insertKey;
        }
        writableParent.__size++;
        writableSelf.__next = insertKey;
        writableNodeToInsert.__next = nextKey;
        writableNodeToInsert.__prev = writableSelf.__key;
        writableNodeToInsert.__parent = writableSelf.__parent;
        // if (restoreSelection && $isRangeSelection(selection)) {
        //   const index = this.getIndexWithinParent();
        //   $updateElementSelectionOnCreateDeleteNode(
        //     selection,
        //     writableParent,
        //     index + 1,
        //   );
        //   const writableParentKey = writableParent.__key;
        //   if (elementAnchorSelectionOnNode) {
        //     selection.anchor.set(writableParentKey, index + 2, 'element');
        //   }
        //   if (elementFocusSelectionOnNode) {
        //     selection.focus.set(writableParentKey, index + 2, 'element');
        //   }
        // }
        return nodeToInsert;
    }

    selectStart(): RangeSelection {
        const firstNode = this.getFirstDescendant();
        if ($isElementNode(firstNode) || $isTextNode(firstNode)) {
            return firstNode.select(0, 0);
        }
        // Decorator or LineBreak
        if (firstNode !== null) {
            const ssmlParagraph = firstNode.getParent();
            if ($isElementNode(ssmlParagraph)) {
                const last = ssmlParagraph.getLastChild()
                if ($isTextNode(last)) {
                    return last.select(0, 0)
                } else {
                    return ssmlParagraph.select(1, 1);
                }
            } else {
                return firstNode.selectPrevious();
            }
        } else {
            return this.select(0, 0);
        }

    }
}

export function $createSSMLParagraphTextareaNode(): SSMLParagraphTextarea {
    const ssmlParagraphTextarea = new SSMLParagraphTextarea();
    ssmlParagraphTextarea.append(new TextNode(''))
    return ssmlParagraphTextarea
}

export function $createSSMLParagraphList(): SSMLParagraphList {
    const ssmlParagraphList = new SSMLParagraphList();
    return ssmlParagraphList
}

export function $isSSMLParagraphList(node: LexicalNode): node is SSMLParagraphList {
    return node instanceof SSMLParagraphList;
}

export function $createSSMLParagraphNode(): SSMLParagraph {
    const ssmlParagraph = new SSMLParagraph();
    ssmlParagraph.append(new SSMLParagraphPreviewNode(), $createSSMLParagraphTextareaNode());
    return ssmlParagraph
}

export function $isSSMLParagraph(node: LexicalNode): node is SSMLParagraph {
    return node instanceof SSMLParagraph;
}

export function $isSSMLParagraphTextarea(node: LexicalNode): node is SSMLParagraphTextarea {
    return node instanceof SSMLParagraphTextarea;
}