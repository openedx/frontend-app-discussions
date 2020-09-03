import React, { useRef } from 'react';

export default function FallbackComponent({ settings, setSettings }) {
  const inputRef = useRef(null);

  return (
    <div>
        Internal component
      <textarea ref={inputRef}>{JSON.stringify(settings)}</textarea>
      <button onClick={() => setSettings(inputRef.current.value)}>Save</button>
    </div>
  );
}
