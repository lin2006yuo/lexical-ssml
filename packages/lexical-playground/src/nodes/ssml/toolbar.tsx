/**
 * @fileOverview
 * @author linxueyu
 * @since 2023-04-02
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import * as React from 'react'

export interface ToolbarProps {
    anchorEle: HTMLElement
}

const Toolbar: React.FC<ToolbarProps> = ({
    anchorEle = document.body
}) => {
    const [editor] = useLexicalComposerContext();
    return (
        <div>123</div>
    );
}

export default Toolbar;