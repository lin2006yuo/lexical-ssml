import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode } from "lexical";
import { ReactNode } from "react";


export interface SSMLPauseProps {
    node: SSMLPauseNode;
    editor: LexicalEditor;
}

const SSMLPause: React.FC<SSMLPauseProps> = ({ node, editor }) => {
    const handleRemoveSSMLPause = () => {
        editor.update(() => {
            node.remove()
        })
    }

    return (
        <div className="ssml-pause-icon" onClick={handleRemoveSSMLPause} />
    );
}

export default SSMLPause;

export class SSMLPauseNode extends DecoratorNode<ReactNode> {
    static getType(): string {
        return "ssml-pause";
    }

    static clone(_data: unknown): LexicalNode {
        return new SSMLPauseNode();
    }

    createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const element = document.createElement("span");
        element.classList.add("ssml-pause-node");
        return element;
    }

    updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
        return false;
    }

    decorate(editor: LexicalEditor, config: EditorConfig): ReactNode {
        return <SSMLPause node={this} editor={editor} />
    }
}


export function $isSSMLPauseNode(node: LexicalNode): node is SSMLPauseNode {
    return node.type === SSMLPauseNode.getType();
}

export function $createSSMLPauseNode(): SSMLPauseNode {
    return new SSMLPauseNode();
}