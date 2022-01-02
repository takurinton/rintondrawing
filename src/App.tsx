import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen}>Open panel</Button>
      <DrawingModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

type Pos = {
  x: number;
  y: number;
}

type DrawingState = 'draw' | 'resize' | 'drag' | 'drop' | 'inputText' | 'arrow' | 'nothing';
const tabs: DrawingState[] = [
  'draw',
  'resize',
  'drag',
  'drop',
  'inputText',
  'arrow',
  'nothing'
];

const DrawingModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<DrawingState>('draw');
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
    const cihld = <Box h={height} w={width} top={top} left={left} position='absolute' border='1px solid black' />
    setChildren([...children, cihld]);
  }, [mousedownPosition, mouseupPosition]);

  useEffect(() => {
    if (state === 'draw') {
      document.addEventListener("mousedown", mousedownFunction, false);
      return () => document.removeEventListener("mousedown", mousedownFunction, false);
    }
  }, [state, mousedownPosition, mouseupPosition]);

  useEffect(() => {
    if (state === 'draw') {
      document.addEventListener("mouseup", mouseupFunction, false);
      return () => document.removeEventListener("mouseup", mouseupFunction, false);
    }
  }, [state, mousedownPosition, mouseupPosition]);

  return (
    <Box position='relative' ref={ref}>
      <Modal isOpen={isOpen} onClose={onClose} size='full'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>drawing</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs onChange={(idx) => setState(tabs[idx])} defaultIndex={0}>
              <TabList>
                {tabs.map((d, i) => <Tab key={i.toString()}>{d}</Tab>)}
              </TabList>

              <TabPanels>
                {tabs.map((d, i) => <TabPanel key={i.toString()}>{d}</TabPanel>)}
              </TabPanels>
            </Tabs>
            {children.map((child, idx) => <React.Fragment key={idx.toString()}>{child}</React.Fragment>)}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
