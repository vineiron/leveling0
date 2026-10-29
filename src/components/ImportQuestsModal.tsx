"use client";

import { useState } from "react";
import type { QuestFile } from "@/lib/quests/files";
import { questCount } from "@/lib/quests/format";
import { IMPORT_MAX_QUESTS } from "@/lib/quests/limits";
import type { Quest } from "@/lib/quests/types";
import { useQuestTransfer } from "@/lib/quests/useQuestTransfer";
import { Modal } from "./Modal";
import { Note } from "./Note";
import { QuestPicker } from "./QuestPicker";
import { btn } from "./ui";

type Props = {
  fileName: string;
  file: QuestFile | null;
  existingIds: Set<string>;
  into: string;
  onImport: (picked: Quest[]) => Promise<void>;
  onPickAnother: () => void;
  onClose: () => void;
};

export function ImportQuestsModal({
  fileName,
  file,
  existingIds,
  into,
  onImport,
  onPickAnother,
  onClose,
}: Props) {
  const quests = file?.quests ?? [];
  const isNew = (q: Quest) => !existingIds.has(q.id);
  const [picked, setPicked] = useState(
    () => new Set(quests.filter(isNew).map((q) => q.id)),
  );
  const { working, failure, run } = useQuestTransfer(onImport, onClose);

  const chosen = quests.filter((q) => picked.has(q.id) && isNew(q));
  const overMax = chosen.length > IMPORT_MAX_QUESTS;
  const nothingNew = file !== null && !quests.some(isNew);
  const skipped = file?.skipped ?? 0;

  return (
    <Modal
      open
      onClose={working ? () => {} : onClose}
      title="Import quests"
      widthClass={file && quests.length > 0 ? "max-w-4xl" : "max-w-sm"}
      hideClose={working}
      footer={
        <div className="flex justify-end gap-2">
          {!working && (
            <button type="button" onClick={onClose} className={btn.secondary}>
              {file && !nothingNew ? "Cancel" : "Close"}
            </button>
          )}
          {!file ? (
            <button
              type="button"
              onClick={onPickAnother}
              className={btn.primary}
            >
              Choose another file
            </button>
          ) : (
            !nothingNew && (
              <button
                type="button"
                onClick={() => run(chosen)}
                disabled={working || chosen.length === 0 || overMax}
                className={btn.primary}
              >
                {working
                  ? "Importing…"
                  : failure
                    ? "Try again"
                    : `Import ${questCount(chosen.length)}`}
              </button>
            )
          )}
        </div>
      }
    >
      {!file ? (
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">{fileName}</span> isn&apos;t a
          leveling0 export.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            From <span className="font-medium text-fg">{fileName}</span> into{" "}
            <span className="font-medium text-fg">{into}</span>.
          </p>

          {quests.length > 0 && (
            <QuestPicker
              quests={quests}
              picked={picked}
              onPickedChange={setPicked}
              blockedLabel={(q) => (isNew(q) ? null : "Already here")}
              disabled={working}
            />
          )}

          <div className="flex flex-col gap-1 text-xs text-muted">
            {skipped > 0 && (
              <p>
                {quests.length === 0
                  ? `None of the ${questCount(skipped)} in this file can be imported.`
                  : `${questCount(skipped)} in this file can't be imported.`}
              </p>
            )}
            {quests.length === 0 && skipped === 0 && (
              <p>This file has no quests.</p>
            )}
            {quests.length > 0 && nothingNew && (
              <p>Everything in this file is already here.</p>
            )}
            {overMax && <p>Import up to {IMPORT_MAX_QUESTS} at a time.</p>}
          </div>

          {working && (
            <Note tone="warn" title={`Importing ${questCount(chosen.length)}…`}>
              Keep this tab open and stay online until it&apos;s done. Closing
              or refreshing now could stop it.
            </Note>
          )}
          {failure && (
            <Note tone="danger" title="Nothing was imported.">
              {failure}
            </Note>
          )}
        </div>
      )}
    </Modal>
  );
}
