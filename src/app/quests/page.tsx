import type { Metadata } from "next";
import { Board } from "@/components/Board";

export const metadata: Metadata = {
  title: "Quests - leveling0",
  description: "Manage your leveling0 quest board.",
};

export default function QuestsPage() {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <Board />
    </div>
  );
}
