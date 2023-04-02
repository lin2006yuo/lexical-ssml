/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import * as React from 'react';

import { ErrorBoundaryType, useDecorators } from './useDecorators';
import { usePlainTextSetup } from './usePlainTextSetup';
import { useCanShowPlaceholder } from './useCanShowPlaceholder';
import Toolbar from './toolbar';

const anchorEle = document.querySelector('.ssml-editor')! as HTMLDivElement

export function SSMLPlugin({
  contentEditable,
  placeholder,
  ErrorBoundary,
}: {
  contentEditable: JSX.Element;
  placeholder:
  | ((isEditable: boolean) => null | JSX.Element)
  | null
  | JSX.Element;
  ErrorBoundary: ErrorBoundaryType;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const decorators = useDecorators(editor, ErrorBoundary);
  usePlainTextSetup(editor);

  return (
    <>
      <div className='ssml-editor'>
        {contentEditable}
      </div>
      <Toolbar anchorEle={anchorEle} />
      <Placeholder content={placeholder} />
      {decorators}
    </>
  );
}

function Placeholder({
  content,
}: {
  content: ((isEditable: boolean) => null | JSX.Element) | null | JSX.Element;
}): null | JSX.Element {
  const [editor] = useLexicalComposerContext();
  const showPlaceholder = useCanShowPlaceholder(editor);
  const editable = useLexicalEditable();

  if (!showPlaceholder) {
    return null;
  }

  if (typeof content === 'function') {
    return content(editable);
  } else {
    return content;
  }
}
