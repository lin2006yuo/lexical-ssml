import { $getRoot, $getSelection, $isElementNode, $isRootNode, $isTextNode, $setSelection, DecoratorNode, EditorConfig, ElementNode, LexicalEditor, LexicalNode, RangeSelection, TextNode } from "lexical";
import { ReactNode } from "react";

import './style.css'


export class SSMLParagraph extends ElementNode {
    static getType(): string {
        return "ssml-paragraph";
    }

    static clone(node: SSMLParagraph): SSMLParagraph {
        return new SSMLParagraph(node.__key);
    }

    createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("ssml-paragraph");
        return div;
    }

    updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
        return false;
    }

    insertNewAfter(selection: RangeSelection, restoreSelection?: boolean | undefined): LexicalNode | null {
        const SSMLParagraph = $createSSMLParagraphNode()
        const root = $getRoot()
        console.log('insertNewAfter', $getSelection())
        if (!$isRootNode(root)) {
            throw Error("SSMLParagraph can only be inserted at the root level")
        }
        root.append(SSMLParagraph);

        console.log(111)
        return SSMLParagraph
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
            <>
                <div className="ssml-preview-icon" />
            </>
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


    insertNewAfter(selection: RangeSelection, restoreSelection?: boolean | undefined): LexicalNode | null {
        const SSMLParagraph = $createSSMLParagraphNode()
        const root = $getRoot()
        console.log('insertNewAfter', $getSelection())
        if (!$isRootNode(root)) {
            throw Error("SSMLParagraph can only be inserted at the root level")
        }
        root.append(SSMLParagraph);



        const newSelection = selection

        const anchor = newSelection.anchor;
        const focus = newSelection.focus;


        anchor.set("5", 1, 'text');
        focus.set("5", 1, 'text');


        return SSMLParagraph
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

export function $createSSMLParagraphNode(): SSMLParagraph {
    const ssmlParagraph = new SSMLParagraph();
    ssmlParagraph.append(new SSMLParagraphPreviewNode(), new SSMLParagraphTextarea());
    return ssmlParagraph
}

export function $isSSMLPARAGRAPH(node: LexicalNode): node is SSMLParagraph {
    return node instanceof SSMLParagraph;
}