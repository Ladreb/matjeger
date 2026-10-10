"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

const PRODUCT_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
];

export function BarcodeScanner({
  onScan,
  onCameraUnavailable,
}: {
  onScan: (barcode: string) => void;
  onCameraUnavailable: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [starting, setStarting] = useState(true);
  const onScanRef = useRef(onScan);
  const onUnavailableRef = useRef(onCameraUnavailable);

  useEffect(() => {
    onScanRef.current = onScan;
    onUnavailableRef.current = onCameraUnavailable;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hints = new Map([[DecodeHintType.POSSIBLE_FORMATS, PRODUCT_FORMATS]]);
    const reader = new BrowserMultiFormatReader(hints);
    let stopped = false;
    let stop: (() => void) | undefined;

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        video,
        (result, _error, controls) => {
          if (!result || stopped) return;
          stopped = true;
          controls.stop();
          onScanRef.current(result.getText());
        },
      )
      .then((controls) => {
        setStarting(false);
        if (stopped) controls.stop();
        else stop = () => controls.stop();
      })
      .catch(() => {
        if (!stopped) onUnavailableRef.current();
      });

    return () => {
      stopped = true;
      stop?.();
    };
  }, []);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
      <video
        ref={videoRef}
        className="size-full object-cover"
        muted
        playsInline
      />
      {starting && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Starter kamera ...
        </p>
      )}
    </div>
  );
}
