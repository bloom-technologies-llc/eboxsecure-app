import { KeyboardEvent, useCallback, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface MentionedUser {
  id: string;
  display: string;
  indices: [number, number]; // start and end positions in text
}

interface UseMentionTriggerProps {
  onValueChange?: (value: string) => void;
}

export const useMentionTrigger = ({
  onValueChange,
}: UseMentionTriggerProps = {}) => {
  const [showMentions, setShowMentions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<MentionedUser[]>([]);
  const [mentionPosition, setMentionPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const { user: currentUser } = useUser();
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
    // First, update mentions that might have been deleted
    setMentionedUsers((prev) => {
      // Filter out mentions that are no longer in the text
      return prev.filter((mention) => {
        const mentionText = value.substring(
          mention.indices[0],
          mention.indices[1],
        );
        return mentionText.trim() === mention.display;
      });
    });

    // Then handle new mentions
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtSignIndex === -1) {
      setShowMentions(false);
      return;
    }

    const textAfterAtSign = textBeforeCursor.substring(lastAtSignIndex + 1);

    if (textAfterAtSign.includes(" ") || textAfterAtSign.includes("\n")) {
      setShowMentions(false);
      return;
    }

    setMentionPosition(getAtSignPosition());
    setShowMentions(true);
  }, []);

  const handleUserSelect = useCallback(
    (user: any) => {
      if (!textareaRef.current) return;

      const input = textareaRef.current;
      const cursorPos = getCursorPosition();
      const textBeforeCursor = input.value.substring(0, cursorPos.start);
      const textAfterCursor = input.value.substring(cursorPos.start);

      // Find the last @ symbol before cursor
      const lastAtSignIndex = textBeforeCursor.lastIndexOf("@");
      if (lastAtSignIndex === -1) return;

      // Create display text for the mention
      const displayText = `@${user.firstName} `;

      // Replace the @mention with the selected user
      const newText =
        textBeforeCursor.substring(0, lastAtSignIndex) +
        displayText +
        textAfterCursor;

      // Add to mentioned users array with updated indices
      setMentionedUsers((prev) => {
        const newMention = {
          id: user.id,
          display: displayText.trim(),
          indices: [lastAtSignIndex, lastAtSignIndex + displayText.length] as [
            number,
            number,
          ],
        };

        // Update indices for all mentions that come after this one
        const offset = displayText.length - (cursorPos.start - lastAtSignIndex);
        const updatedPrev = prev.map((mention) => {
          if (mention.indices[0] > lastAtSignIndex) {
            return {
              ...mention,
              indices: [
                mention.indices[0] + offset,
                mention.indices[1] + offset,
              ] as [number, number],
            };
          }
          return mention;
        });

        return [...updatedPrev, newMention];
      });

      input.value = newText;

      // Update form field value if callback is provided
      if (onValueChange) {
        onValueChange(newText);
      }

      setShowMentions(false);
      setSelectedIndex(0);
    },
    [getCursorPosition, currentUser],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>, filteredUsers: any[]) => {
      if (!showMentions || filteredUsers.length === 0) return;

      // Filter out current user from suggestions
      const availableUsers = currentUser
        ? filteredUsers.filter((user) => user.id !== currentUser.id)
        : filteredUsers;

      if (availableUsers.length === 0) {
        setShowMentions(false);
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % availableUsers.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (prev) =>
              (prev - 1 + availableUsers.length) % availableUsers.length,
          );
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          handleUserSelect(availableUsers[selectedIndex]);
          break;
        case "Escape":
          setShowMentions(false);
          break;
      }
    },
    [showMentions, selectedIndex, handleUserSelect, currentUser],
  );

  return {
    textareaRef,
    showMentions,
    setShowMentions,
    handleInputChange,
    mentionPosition,
    handleKeyDown,
    selectedIndex,
    handleUserSelect,
    mentionedUsers,
    setMentionedUsers,
  };
};
