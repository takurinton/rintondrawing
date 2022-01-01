import { Box } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export const App = () => {
  return (
    <>
      <DrawingModal />
    </>
  );
};

type Pos = {
  x: number;
  y: number;
}

type DrawingState = 'drawing' | 'resize' | 'drag' | 'drop' | 'inputText' | 'arrow' | 'nothing';

const DrawingModal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<DrawingState>('nothing');
  const [mousedownPosition, setMousedownPosition] = useState<Pos>({ x: 0, y: 0 });
  const [mouseupPosition, setMouseupPosition] = useState<Pos>({ x: 0, y: 0 });
  const [children, setChildren] = useState<JSX.Element[]>([]);

  const mousedownFunction = useCallback((event) => {
    setMousedownPosition({ x: event.pageX, y: event.pageY });
  }, [mousedownPosition, mouseupPosition]);

  const mouseupFunction = useCallback((event) => {
    setMouseupPosition({ x: event.pageX, y: event.pageY });
    const height = Math.abs(mousedownPosition.y - event.pageY);
    const width = Math.abs(mousedownPosition.x - event.pageX);
    const left = event.pageX > mousedownPosition.x ? mousedownPosition.x : event.pageX;
    const top = event.pageY > mousedownPosition.y ? mousedownPosition.y : event.pageY;
    const cihld = <Box h={height} w={width} top={top} left={left} position='absolute' border='1px solid black' backgroundColor='white' />
    setChildren([...children, cihld]);
  }, [mousedownPosition, mouseupPosition]);

  useEffect(() => {
    if (state === 'drawing') {
      document.addEventListener("mousedown", mousedownFunction, false);
      return () => document.removeEventListener("mousedown", mousedownFunction, false);
    }
  }, [mousedownPosition, mouseupPosition]);

  useEffect(() => {
    if (state === 'drawing') {
      document.addEventListener("mouseup", mouseupFunction, false);
      return () => document.removeEventListener("mouseup", mouseupFunction, false);
    }
  }, [mousedownPosition, mouseupPosition]);

  return (
    <Box position='relative' ref={ref}>
      {children.map((child, idx) => <React.Fragment key={idx.toString()}>{child}</React.Fragment>)}
    </Box>
  );
}
