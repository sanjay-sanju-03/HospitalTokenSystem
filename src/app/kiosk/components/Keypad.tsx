// src/app/kiosk/components/Keypad.tsx
'use client';

import React from 'react';

interface KeypadProps {
  onDigitClick: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const keymap = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
];

export default function Keypad({ onDigitClick, onBackspace, onClear }: KeypadProps) {
  return (
    <div
      className="keypad d-grid gap-2 mb-3"
      style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
    >
      {keymap.map(({ digit, letters }) => (
        <button
          key={digit}
          className="btn btn-outline-secondary btn-lg py-3"
          onClick={() => onDigitClick(digit)}
          style={{ borderRadius: 'var(--border-radius-md)' }}
        >
          <div className="fw-bold fs-4">{digit}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
            {letters}
          </div>
        </button>
      ))}
      <button
        className="btn btn-outline-secondary btn-lg py-3"
        onClick={onClear}
        style={{ borderRadius: 'var(--border-radius-md)' }}
      >
        Clear
      </button>
      <button
        className="btn btn-outline-secondary btn-lg py-3"
        onClick={() => onDigitClick('0')}
        style={{ borderRadius: 'var(--border-radius-md)' }}
      >
        <div className="fw-bold fs-4">0</div>
      </button>
      <button
        className="btn btn-outline-danger btn-lg py-3"
        onClick={onBackspace}
        style={{ borderRadius: 'var(--border-radius-md)' }}
      >
        &larr;
      </button>
    </div>
  );
}
