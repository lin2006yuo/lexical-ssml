import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import {
  $createMinutesParagraphContainerNode,
  $createMinutesParagraphContentNode,
  $createMinutesParagraphTitleNode,
  $isMinutesParagraphContainerNode,
  $isMinutesParagraphContentNode,
  $isMinutesParagraphTitleNode,
  $isMinutesSentenceNode,
  MinutesParagraphContainerNode,
  MinutesParagraphContentNode,
  MinutesParagraphTitleNode,
  MinutesSentenceNode,
} from './node';
import './style.css';
import { mergeRegister } from '@lexical/utils';

export * from './node';

export const INSERT_MINUTES_PARAGRAPH_COMMAND = createCommand<void>();
export const INSERT_HUNDRED_MINUTES_PARAGRAPH_COMMAND = createCommand<void>();

export const MinutesParagraphPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerNodeTransform(MinutesParagraphContentNode, (node) => {
        const parent = node.getParent();
        if (!$isMinutesParagraphContainerNode(parent)) {
          const children = node.getChildren();
          for (const child of children) {
            node.insertAfter(child);
          }
          node.remove();
        }
      }),
      editor.registerNodeTransform(MinutesParagraphTitleNode, (node) => {
        const parent = node.getParent();
        if (!$isMinutesParagraphContainerNode(parent)) {
          node.remove();
        }
      }),
      editor.registerNodeTransform(MinutesParagraphContainerNode, (node) => {
        const children = node.getChildren();
        if (
          children.length !== 2 ||
          !$isMinutesParagraphTitleNode(children[0]) ||
          !$isMinutesParagraphContentNode(children[1])
        ) {
          // merge content to previous paragraph
          const previous = node.getPreviousSibling();
          if (!$isMinutesParagraphContainerNode(previous)) return node.remove();

          const previousContentNode = previous.getChildAtIndex(1);
          if (!$isMinutesParagraphContentNode(previousContentNode)) return node.remove();

          for (const child of children) {
            previousContentNode.append(child);
          }

          node.remove();
        }
      }),
      (() => {
        let lastActiveNode: MinutesSentenceNode | null = null;
        let removeUpdateListener = () => {};

        function registerUpdateListener() {
          removeUpdateListener();
          removeUpdateListener = editor.registerUpdateListener(() => {
            editor.update(() => {
              const selection = $getSelection();
              if (!$isRangeSelection(selection)) return;
              const sentence = selection.anchor.getNode().getParent();
              if (!$isMinutesSentenceNode(sentence)) return;

              if (
                lastActiveNode &&
                lastActiveNode.isAttached() &&
                lastActiveNode.__sid !== sentence.__sid &&
                lastActiveNode.__active
              ) {
                lastActiveNode.setActive(false);
              }
              if (lastActiveNode?.__sid !== sentence.__sid && !sentence.__active) {
                sentence.setActive(true);
              }
              lastActiveNode = sentence;
            });
          });
        }

        registerUpdateListener();

        const removeEditableListener = editor.registerEditableListener((editable) => {
          if (editable) {
            registerUpdateListener();
          } else {
            const toRemove = lastActiveNode;

            if (toRemove) {
              editor.update(() => {
                toRemove.setActive(false);
              });
              lastActiveNode = null;
            }
            removeUpdateListener();
          }
        });

        return () => {
          lastActiveNode = null;
          removeUpdateListener();
          removeEditableListener();
        };
      })(),
      editor.registerCommand(
        INSERT_MINUTES_PARAGRAPH_COMMAND,
        () => {
          // Adding custom command that will be handled by this plugin
          editor.update(() => {
            const container = $createMinutesParagraphContainerNode();
            container.append($createMinutesParagraphTitleNode(), $createMinutesParagraphContentNode());
            $getRoot().append(container);
          });

          // Returning true indicates that command is handled and no further propagation is required
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        INSERT_HUNDRED_MINUTES_PARAGRAPH_COMMAND,
        () => {
          // Adding custom command that will be handled by this plugin
          editor.update(() => {
            const paragraphs = Array.from({ length: 100 }, () => {
              const container = $createMinutesParagraphContainerNode();
              container.append($createMinutesParagraphTitleNode(), $createMinutesParagraphContentNode());
              return container;
            });
            $getRoot().append(...paragraphs);
          });

          // Returning true indicates that command is handled and no further propagation is required
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
};