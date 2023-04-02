/** @module @lexical/plain-text */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $createTextNode, $getNodeByKey, $getRoot, $insertNodes, $isTextNode, $setCompositionKey, CommandPayloadType, createCommand, ElementNode, LexicalEditor, LexicalNode, TextFormatType, TextNode } from 'lexical';

import {
  $getHtmlContent,
  $insertDataTransferForPlainText,
} from '@lexical/clipboard';
import {
  $moveCharacter,
  $shouldOverrideDefaultCharacterSelection,
} from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  COPY_COMMAND,
  CUT_COMMAND,
  DELETE_CHARACTER_COMMAND,
  DELETE_LINE_COMMAND,
  DELETE_WORD_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  PASTE_COMMAND,
  REMOVE_TEXT_COMMAND,
} from 'lexical';
import {
  CAN_USE_BEFORE_INPUT,
  IS_APPLE_WEBKIT,
  IS_IOS,
  IS_SAFARI,
} from 'shared/environment';
import { $createSSMLParagraphNode } from './nodes/ssml-paragraph';
import { $createSSMLPauseNode } from './nodes/ssml-pause-node';
import { $createSSMLMuteNode } from './nodes/ssml-mute-node';

export const INSERT_SSML_PARAGRAPH_COMMAND = createCommand<void>();
export const SET_CUSTOM_SELECTION = createCommand()
export const INSERT_SSML_PAUSE_COMMAND = createCommand()
export const MUTE_SSML_COMMAND = createCommand()


function onCopyForPlainText(
  event: CommandPayloadType<typeof COPY_COMMAND>,
  editor: LexicalEditor,
): void {
  editor.update(() => {
    const clipboardData =
      event instanceof KeyboardEvent ? null : event.clipboardData;
    const selection = $getSelection();

    if (selection !== null && clipboardData != null) {
      event.preventDefault();
      const htmlString = $getHtmlContent(editor);

      if (htmlString !== null) {
        clipboardData.setData('text/html', htmlString);
      }

      clipboardData.setData('text/plain', selection.getTextContent());
    }
  });
}

function onPasteForPlainText(
  event: CommandPayloadType<typeof PASTE_COMMAND>,
  editor: LexicalEditor,
): void {
  event.preventDefault();
  editor.update(
    () => {
      const selection = $getSelection();
      const clipboardData =
        event instanceof InputEvent || event instanceof KeyboardEvent
          ? null
          : event.clipboardData;

      if (clipboardData != null && $isRangeSelection(selection)) {
        $insertDataTransferForPlainText(clipboardData, selection);
      }
    },
    {
      tag: 'paste',
    },
  );
}

function onCutForPlainText(
  event: CommandPayloadType<typeof CUT_COMMAND>,
  editor: LexicalEditor,
): void {
  onCopyForPlainText(event, editor);
  editor.update(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      selection.removeText();
    }
  });
}

function formatMuteSSML(editor: LexicalEditor, formatType: TextFormatType) {
  editor.update(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return false;
    }

    selection.isCollapsed()

    if (selection.isCollapsed()) {
      return;
    }

    const selectedNodes = selection.getNodes();
    const selectedTextNodes: Array<TextNode> = [];
    for (const selectedNode of selectedNodes) {
      if ($isTextNode(selectedNode)) {
        selectedTextNodes.push(selectedNode);
      }
    }

    const selectedTextNodesLength = selectedTextNodes.length;
    if (selectedTextNodesLength === 0) {
      selection.toggleFormat(formatType);
      // When changing format, we should stop composition
      $setCompositionKey(null);
      return;
    }

    const anchor = selection.anchor;
    const focus = selection.focus;
    const isBackward = selection.isBackward();
    const startPoint = isBackward ? focus : anchor;
    const endPoint = isBackward ? anchor : focus;

    let firstIndex = 0;
    let firstNode = selectedTextNodes[0];
    let startOffset = startPoint.type === 'element' ? 0 : startPoint.offset;

    // In case selection started at the end of text node use next text node
    if (
      startPoint.type === 'text' &&
      startOffset === firstNode.getTextContentSize()
    ) {
      firstIndex = 1;
      firstNode = selectedTextNodes[1];
      startOffset = 0;
    }

    if (firstNode == null) {
      return;
    }

    const firstNextFormat = firstNode.getFormatFlags(formatType, null);

    const lastIndex = selectedTextNodesLength - 1;
    let lastNode = selectedTextNodes[lastIndex];
    const endOffset =
      endPoint.type === 'text'
        ? endPoint.offset
        : lastNode.getTextContentSize();

    // Single node selected
    if (firstNode.is(lastNode)) {
      // No actual text is selected, so do nothing.
      if (startOffset === endOffset) {
        return;
      }
      // The entire node is selected, so just format it
      if (startOffset === 0 && endOffset === firstNode.getTextContentSize()) {
        const parent = firstNode.getParent()!
        const muteNode = $createSSMLMuteNode(firstNode.getTextContent())
        firstNode.replace(muteNode)
        mergeSameTypeNodeTextContent(editor, parent)
      } else {
        // Node is partially selected, so split it into two nodes
        // add style the selected one.
        const parent = firstNode.getParent()!
        const splitNodes = firstNode.splitText(startOffset, endOffset);
        const replacement = startOffset === 0 ? splitNodes[0] : splitNodes[1];
        // const firstParant = firstNode.getParent()

        let muteNode: TextNode
        muteNode = $createSSMLMuteNode(replacement.getTextContent())
        replacement.replace(muteNode)

        muteNode.select()
        // Update selection only if starts/ends on text node
        // if (startPoint.type === 'text') {
        //   startPoint.set(muteNode.__key, endOffset - startOffset, 'text');
        // }
        // if (endPoint.type === 'text') {
        //   endPoint.set(muteNode.__key, endOffset - startOffset, 'text');
        // }

        mergeSameTypeNodeTextContent(editor, parent)
      }

      // this.format = firstNextFormat;

      return;
    }
    // Multiple nodes selected
    // The entire first node isn't selected, so split it
    if (startOffset !== 0) {
      [, firstNode as TextNode] = firstNode.splitText(startOffset);
      const parentNode = firstNode.getParent()!
      const muteNode = $createSSMLMuteNode(firstNode.getTextContent())
      firstNode.replace(muteNode)
      startOffset = 0;
    }
    // firstNode.setFormat(firstNextFormat);

    // const lastNextFormat = lastNode.getFormatFlags(formatType, firstNextFormat);
    // If the offset is 0, it means no actual characters are selected,
    // so we skip formatting the last node altogether.
    if (endOffset > 0) {
      if (endOffset !== lastNode.getTextContentSize()) {
        [lastNode as TextNode] = lastNode.splitText(endOffset);
      }

      const muteNode = $createSSMLMuteNode(lastNode.getTextContent())
      lastNode.replace(muteNode)

      muteNode.select()
      // lastNode.setFormat(lastNextFormat);
    }

    // Process all text nodes in between
    for (let i = firstIndex + 1; i < lastIndex; i++) {
      const textNode = selectedTextNodes[i];
      if (!textNode.isToken()) {
        // const nextFormat = textNode.getFormatFlags(formatType, lastNextFormat);
        const muteNode = $createSSMLMuteNode(textNode.getTextContent())
        textNode.replace(muteNode)
      }
    }


    // Update selection only if starts/ends on text node
    // if (startPoint.type === 'text') {
    //   startPoint.set(firstNode.__key, startOffset, 'text');
    // }
    // if (endPoint.type === 'text') {
    //   endPoint.set(lastNode.__key, endOffset, 'text');
    // }

    const paragraphNode = new Set<string>()
    selectedTextNodes.forEach((n) => {
      const parentKey = n.__parent;
      if (parentKey) {
        paragraphNode.add(parentKey)
      }
    })
    paragraphNode.forEach(key => {
      const node = $getNodeByKey(key) as ElementNode
      mergeSameTypeNodeTextContent(editor, node)
    })

    // this.format = firstNextFormat | lastNextFormat;
  })
}

// 合并子节点中连续相同type节点的 text 内容
function mergeSameTypeNodeTextContent(editor: LexicalEditor, parent: ElementNode) {
  const children = parent.getChildren()
  const stack: LexicalNode[] = []
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    if (stack.length === 0 || stack[stack.length - 1].getType() !== child.getType()) {
      stack.push(child)
    } else {
      // 相邻节点 type 类型相同
      // 合并 text 内容
      const lastNode = stack[stack.length - 1]
      if ($isTextNode(lastNode)) {
        if ($isTextNode(child)) {
          lastNode.setTextContent(lastNode.getTextContent() + child.getTextContent())
          child.remove()
        } else {
          throw Error('mergeSameTypeNodeTextContent: child is not text node')
        }
      } else {
        throw Error('mergeSameTypeNodeTextContent: lastNode is not text node')
      }
    }
  }
}

export function registerPlainText(editor: LexicalEditor): () => void {
  window.__ed = editor
  const removeListener = mergeRegister(
    // ssml： 添加停顿
    editor.registerCommand(
      MUTE_SSML_COMMAND,
      () => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        formatMuteSSML(editor, 'bold')

        return true
      },
      COMMAND_PRIORITY_EDITOR
    ),
    // ssml： 添加停顿
    editor.registerCommand(
      INSERT_SSML_PAUSE_COMMAND,
      () => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const ssmlPauseNode = $createSSMLPauseNode()

        $insertNodes([ssmlPauseNode])

        return true
      },
      COMMAND_PRIORITY_EDITOR
    ),
    // 测试：插入 ssml 片段
    editor.registerCommand(
      INSERT_SSML_PARAGRAPH_COMMAND,
      () => {
        // Adding custom command that will be handled by this plugin
        editor.update(() => {
          // const container = $createMinutesParagraphContainerNode();
          // container.append($createMinutesParagraphTitleNode(), $createMinutesParagraphContentNode());
          const SSMLParagraph = $createSSMLParagraphNode();
          $getRoot().append(SSMLParagraph);
        });

        // Returning true indicates that command is handled and no further propagation is required
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand<boolean>(
      DELETE_CHARACTER_COMMAND,
      (isBackward) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        selection.deleteCharacter(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      SET_CUSTOM_SELECTION,
      () => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          const anchor = selection.anchor
          const focus = selection.focus
          anchor.set("14", 1, 'text');
          focus.set("14", 1, 'text');
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand<boolean>(
      DELETE_WORD_COMMAND,
      (isBackward) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        selection.deleteWord(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<boolean>(
      DELETE_LINE_COMMAND,
      (isBackward) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        selection.deleteLine(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<InputEvent | string>(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (eventOrText) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        if (typeof eventOrText === 'string') {
          selection.insertText(eventOrText);
        } else {
          const dataTransfer = eventOrText.dataTransfer;

          if (dataTransfer != null) {
            $insertDataTransferForPlainText(dataTransfer, selection);
          } else {
            const data = eventOrText.data;

            if (data) {
              selection.insertText(data);
            }
          }
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      REMOVE_TEXT_COMMAND,
      () => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        selection.removeText();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<boolean>(
      INSERT_LINE_BREAK_COMMAND,
      (selectStart) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        selection.insertLineBreak(selectStart);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        selection.insertParagraph();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_LEFT_COMMAND,
      (payload) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const event = payload;
        const isHoldingShift = event.shiftKey;

        if ($shouldOverrideDefaultCharacterSelection(selection, true)) {
          event.preventDefault();
          $moveCharacter(selection, isHoldingShift, true);
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_RIGHT_COMMAND,
      (payload) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const event = payload;
        const isHoldingShift = event.shiftKey;

        if ($shouldOverrideDefaultCharacterSelection(selection, false)) {
          event.preventDefault();
          $moveCharacter(selection, isHoldingShift, false);
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        event.preventDefault();
        return editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_DELETE_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        event.preventDefault();
        return editor.dispatchCommand(DELETE_CHARACTER_COMMAND, false);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent | null>(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        if (event !== null) {
          // If we have beforeinput, then we can avoid blocking
          // the default behavior. This ensures that the iOS can
          // intercept that we're actually inserting a paragraph,
          // and autocomplete, autocapitalize etc work as intended.
          // This can also cause a strange performance issue in
          // Safari, where there is a noticeable pause due to
          // preventing the key down of enter.
          if (
            (IS_IOS || IS_SAFARI || IS_APPLE_WEBKIT) &&
            CAN_USE_BEFORE_INPUT
          ) {
            return false;
          }

          event.preventDefault();
          if (event.shiftKey) {
            return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
          }
        }

        return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      COPY_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        onCopyForPlainText(event, editor);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      CUT_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        onCutForPlainText(event, editor);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        onPasteForPlainText(event, editor);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<DragEvent>(
      DROP_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        // TODO: Make drag and drop work at some point.
        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<DragEvent>(
      DRAGSTART_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        // TODO: Make drag and drop work at some point.
        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
  );
  return removeListener;
}
