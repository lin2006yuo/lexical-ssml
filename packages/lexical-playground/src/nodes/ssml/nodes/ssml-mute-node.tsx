import { $getSelection, $isRangeSelection, EditorConfig, TextNode } from "lexical";
// import { $getCompositionKey } from "@lexical/utils";

export class SSMLMuteNode extends TextNode {
    static getType(): string {
        return "ssml-mute";
    }

    static clone(node: TextNode): TextNode {
        return new SSMLMuteNode(node.getTextContent());
    }

    constructor(text: string) {
        super(text);
    }

    canInsertTextAfter(): boolean {
        return false
    }

    canInsertTextBefore(): boolean {
        return false
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = super.createDOM(config);
        element.classList.add("ssml-mute-node");
        return element
    }

    updateDOM(prevNode: TextNode, dom: HTMLElement, config: EditorConfig): boolean {
        if (prevNode.__text !== this.__text) {
            dom.innerText = this.__text;
            return true;
        }
        return false;
    }

    splitText(...splitOffsets: Array<number>): Array<TextNode> {
        // errorOnReadOnly();
        const self = this.getLatest();
        const textContent = self.getTextContent();
        const key = self.__key;
        // const compositionKey = $getCompositionKey();
        const offsetsSet = new Set(splitOffsets);
        const parts = [];
        const textLength = textContent.length;
        let string = '';
        for (let i = 0; i < textLength; i++) {
            if (string !== '' && offsetsSet.has(i)) {
                parts.push(string);
                string = '';
            }
            string += textContent[i];
        }
        if (string !== '') {
            parts.push(string);
        }
        const partsLength = parts.length;
        if (partsLength === 0) {
            return [];
        } else if (parts[0] === textContent) {
            return [self];
        }
        const firstPart = parts[0];
        const parent = self.getParentOrThrow();
        let writableNode;
        const format = self.getFormat();
        const style = self.getStyle();
        const detail = self.__detail;
        let hasReplacedSelf = false;

        if (self.isSegmented()) {
            // Create a new TextNode
            writableNode = $createSSMLMuteNode(firstPart);
            writableNode.__format = format;
            writableNode.__style = style;
            writableNode.__detail = detail;
            hasReplacedSelf = true;
        } else {
            // For the first part, update the existing node
            writableNode = self.getWritable();
            writableNode.__text = firstPart;
        }

        // Handle selection
        const selection = $getSelection();

        // Then handle all other parts
        const splitNodes: TextNode[] = [writableNode];
        let textSize = firstPart.length;

        for (let i = 1; i < partsLength; i++) {
            const part = parts[i];
            const partSize = part.length;
            const sibling = $createSSMLMuteNode(part).getWritable();
            sibling.__format = format;
            sibling.__style = style;
            sibling.__detail = detail;
            const siblingKey = sibling.__key;
            const nextTextSize = textSize + partSize;

            if ($isRangeSelection(selection)) {
                const anchor = selection.anchor;
                const focus = selection.focus;

                if (
                    anchor.key === key &&
                    anchor.type === 'text' &&
                    anchor.offset > textSize &&
                    anchor.offset <= nextTextSize
                ) {
                    anchor.key = siblingKey;
                    anchor.offset -= textSize;
                    selection.dirty = true;
                }
                if (
                    focus.key === key &&
                    focus.type === 'text' &&
                    focus.offset > textSize &&
                    focus.offset <= nextTextSize
                ) {
                    focus.key = siblingKey;
                    focus.offset -= textSize;
                    selection.dirty = true;
                }
            }
            //   if (compositionKey === key) {
            //     $setCompositionKey(siblingKey);
            //   }
            textSize = nextTextSize;
            splitNodes.push(sibling);
        }

        // Insert the nodes into the parent's children
        // internalMarkSiblingsAsDirty(this);
        const writableParent = parent.getWritable();
        const insertionIndex = this.getIndexWithinParent();
        if (hasReplacedSelf) {
            writableParent.splice(insertionIndex, 0, splitNodes);
            this.remove();
        } else {
            writableParent.splice(insertionIndex, 1, splitNodes);
        }

        if ($isRangeSelection(selection)) {
            //   $updateElementSelectionOnCreateDeleteNode(
            //     selection,
            //     parent,
            //     insertionIndex,
            //     partsLength - 1,
            //   );
        }

        return splitNodes;
    }

}

export function $isSSMLMutetNode(node: TextNode): node is SSMLMuteNode {
    return node.type === SSMLMuteNode.getType();
}

export function $createSSMLMuteNode(text: string): SSMLMuteNode {
    return new SSMLMuteNode(text);
}