"use client";

import QRCode from "react-qr-code";

type Props = {
  value: string;
};

export default function QRCodeDisplay({ value }: Props) {
  return (
    <div className="flex justify-center p-4 bg-white">
      <QRCode value={value} size={160} />
    </div>
  );
}
