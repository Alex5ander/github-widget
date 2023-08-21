import React, { useEffect, useRef } from 'react';

export default function Home() {
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    (async () => {
      const data = await fetch('/api/visit');
      const svg = await data.text();
      ref.current?.innerHTML = svg;
    })();
  }, []);

  return <div ref={ref}></div>;
}
