import React, { useRef } from 'react';

export default function ExampleComponent({ settings, setSettings }) {
  const inputRef = useRef(null);

  return (
    <div>
      <textarea ref={inputRef}>{JSON.stringify(settings)}</textarea>
      <button onClick={() => setSettings(inputRef.current.value)}>Save</button>
    </div>
  );
}
