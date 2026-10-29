"use client";

import { useState } from "react";
import { questCount } from "@/lib/quests/format";
import { fitsLimits, IMPORT_MAX_QUESTS } from "@/lib/quests/limits";
import type { Quest } from "@/lib/quests/types";
import { useQuestTransfer } from "@/lib/quests/useQuestTransfer";
import { Modal } from "./Modal";
import { Note } from "./Note";
import { QuestPicker } from "./QuestPicker";
import { btn } from "./ui";

type Props = {
  quests: Quest[];
  email: string;
  onMove: (picked: Quest[]) => Promise<void>;
  onClose: () => void;
};

const blockedLabel = (q: Quest) => (fitsLimits(q) ? null : "Too long");

export function MoveQuestsModal({ quests, email, onMove, onClose }: Props) {
  const [picked, setPicked] = useState(
    () => new Set(quests.filter(fitsLimits).map((q) => q.id)),
  );
  const { working: moving, failure, run } = useQuestTransfer(onMove, onClose);

  const chosen = quests.filter((q) => picked.has(q.id) && fitsLimits(q));
  const tooLong = quests.filter((q) => !fitsLimits(q));
  const overMax = chosen.length > IMPORT_MAX_QUESTS;

  return (
    <Modal
      open
      onClose={moving ? () => {} : onClose}
      title="Bring your quests along?"
      widthClass="max-w-4xl"
      hideClose={moving}
      footer={
        <div className="flex justify-end gap-2">
          {!moving && (
            <button type="button" onClick={onClose} className={btn.secondary}>
              Not now
            </button>
          )}
          <button
            type="button"
            onClick={() => run(chosen)}
            disabled={moving || chosen.length === 0 || overMax}
            className={btn.primary}
          >
            {moving
              ? "Moving…"
              : failure
                ? "Try again"
                : `Move ${questCount(chosen.length)}`}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Signed in as <span className="font-medium text-fg">{email}</span>.{" "}
          {quests.length === 1
            ? "This quest is"
            : `These ${questCount(quests.length)} are`}{" "}
          only saved in this browser. Pick the ones to bring into your account.
        </p>

        <QuestPicker
          quests={quests}
          picked={picked}
          onPickedChange={setPicked}
          blockedLabel={blockedLabel}
          disabled={moving}
        />

        <div className="flex flex-col gap-1 text-xs text-muted">
          {tooLong.length > 0 && (
            <p>
              {tooLong.length === 1
                ? `“${tooLong[0].title}” is too long to move.`
                : `${questCount(tooLong.length)} are too long to move.`}{" "}
              Sign out to shorten {tooLong.length === 1 ? "it" : "them"}.
            </p>
          )}
          {overMax && <p>Move up to {IMPORT_MAX_QUESTS} at a time.</p>}
          <p>Unchecked quests stay in this browser.</p>
        </div>

        {moving && (
          <Note tone="warn" title={`Moving ${questCount(chosen.length)}…`}>
            Keep this tab open and stay online until it&apos;s done. Closing or
            refreshing now could stop it.
          </Note>
        )}
        {failure && (
          <Note tone="danger" title="Nothing was moved.">
            {failure}{" "}
            {chosen.length === 1
              ? "It's still in this browser."
              : `All ${chosen.length} are still in this browser.`}
          </Note>
        )}
      </div>
    </Modal>
  );
}
