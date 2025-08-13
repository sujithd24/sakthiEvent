import React from "react";
import Modal from "./Modal";

export default function VersionHistoryModal({ open, onClose, versions }) {
  return (
    <Modal open={open} onClose={onClose} title="Version History">
      <ul className="space-y-2">
        {versions.map(v => (
          <li key={v.version} className="flex items-center gap-2">
            <span className="font-bold">v{v.version}</span>
            <span>{v.date}</span>
            <span className="text-gray-500">by {v.by}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
} 