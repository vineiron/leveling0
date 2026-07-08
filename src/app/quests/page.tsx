import type { Metadata } from "next";
import { Board } from "@/components/Board";

export const metadata: Metadata = {
  title: "quests - leveling0",
};

export default function QuestsPage() {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <Board />
    </div>
  );
}
