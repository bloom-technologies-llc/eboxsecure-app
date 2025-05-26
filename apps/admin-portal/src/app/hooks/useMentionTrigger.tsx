import { useCallback, useRef, useState } from "react";

export const useMentionTrigger = () => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getCursorPosition = useCallback(() => {
    if (textareaRef.current) {
      return {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      };
    }
    return {
      start: 0,
      end: 0,
    };
  }, []);

  const getAtSignPosition = useCallback(() => {
    if (!textareaRef.current) return null;

    const input = textareaRef.current;
    const div = document.createElement("div");
    const styles = getComputedStyle(input);

    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = styles.whiteSpace;
    div.style.font = styles.font;
    div.style.padding = styles.padding;
    div.style.border = styles.border;
    div.style.width = styles.width;
    div.style.lineHeight = styles.lineHeight;

    // Set text content up to cursor position
    div.textContent = input.value.substring(0, getCursorPosition().start);

    // Create and insert span for @ symbol
    const span = document.createElement("span");
    span.textContent = "@";
    div.appendChild(span);

    // Insert div into document to measure
    document.body.appendChild(div);

    // Get all positions
    const divPos = div.getBoundingClientRect();
    const spanPos = span.getBoundingClientRect();
    const inputPos = input.getBoundingClientRect();

    // Calculate position relative to input, accounting for scroll
    const position = {
      x: inputPos.x + (spanPos.x - divPos.x) + 130,
      y: inputPos.y + (spanPos.y - divPos.y) + 20 - input.scrollTop,
    };

    document.body.removeChild(div);

    return position;
  }, []);

  const handleInputChange = useCallback((value: string, cursorPos: number) => {
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtSignIndex === -1) {
      console.log("no @ sign found");
      setShowMentions(false);
      return;
    }

    const textAfterAtSign = textBeforeCursor.substring(lastAtSignIndex + 1);

    if (textAfterAtSign.includes(" ") || textAfterAtSign.includes("\n")) {
      console.log("space or new line");
      setShowMentions(false);
      return;
    }

    setMentionPosition(getAtSignPosition());
    setShowMentions(true);
  }, []);

  return {
    textareaRef,
    showMentions,
    setShowMentions,
    handleInputChange,
    mentionPosition,
  };
};
