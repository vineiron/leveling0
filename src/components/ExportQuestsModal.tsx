"use client";

import { useState } from "react";
import { downloadQuests, exportFileName } from "@/lib/quests/files";
import { questCount } from "@/lib/quests/format";
import type { Quest } from "@/lib/quests/types";
import { Modal } from "./Modal";
import { QuestPicker } from "./QuestPicker";
import { btn } from "./ui";

type Props = {
  quests: Quest[];
  initialPicked: Set<string>;
  onClose: () => void;
};

export function ExportQuestsModal({ quests, initialPicked, onClose }: Props) {
  const [picked, setPicked] = useState(initialPicked);
  const chosen = quests.filter((q) => picked.has(q.id));

  return (
    <Modal
      open
      onClose={onClose}
      title="Export quests"
      widthClass="max-w-4xl"
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btn.secondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              downloadQuests(chosen);
              onClose();
            }}
            disabled={chosen.length === 0}
            className={btn.primary}
          >
            Export {questCount(chosen.length)}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Pick the quests to put in the file.
        </p>

        <QuestPicker
          quests={quests}
          picked={picked}
          onPickedChange={setPicked}
        />

        <div className="flex flex-col gap-1 text-xs text-muted">
          {chosen.length > 0 && (
            <p className="font-mono">{exportFileName(chosen, new Date())}</p>
          )}
          <p>
            The file includes details and notes, so keep it as private as your
            board.
          </p>
        </div>
      </div>
    </Modal>
  );
}
