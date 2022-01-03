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

type DrawingState = 'draw' | 'resize' | 'move' | 'inputText' | 'arrow' | 'nothing';
const tabs: DrawingState[] = [
  'draw',
  'resize',
  'move',
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
  // const parentRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [draggingTarget, setDraggingTarget] = useState<HTMLDivElement | null>(null);
  const [state, setState] = useState<DrawingState>('nothing');
  const [mousedownPosition, setMousedownPosition] = useState<Pos>({ x: 0, y: 0 });
  const [mouseupPosition, setMouseupPosition] = useState<Pos>({ x: 0, y: 0 });
  const [contents, setContents] = useState<JSX.Element[]>([]);

  const onDragStart = useCallback((event) => {
    event.dataTransfer.setData("element", event.target);
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("element");
    console.log(data);
    event.target.appendChild(document.getElementById(data));
  }, []);

  const mousedownFunction = useCallback((event) => {
    setMousedownPosition({ x: event.pageX, y: event.pageY });
  }, [mousedownPosition, mouseupPosition]);

  const mouseupFunction = useCallback((event) => {
    setMouseupPosition({ x: event.pageX, y: event.pageY });
    const height = Math.abs(mousedownPosition.y - event.pageY);
    const width = Math.abs(mousedownPosition.x - event.pageX);
    const left = event.pageX > mousedownPosition.x ? mousedownPosition.x : event.pageX;
    const top = event.pageY > mousedownPosition.y ? mousedownPosition.y : event.pageY;
    const cihld = <Box h={height} w={width} top={top} left={left} position='absolute' border='1px solid black' draggable={true} id={`${top}-${left}`} onDragStart={onDragStart} />
    setContents([...contents, cihld]);
  }, [mousedownPosition, mouseupPosition]);

  // const mousemovedownFunction = useCallback((event) => {
  //   setDraggingTarget(event.target);

  //   const target = event.target;
  //   const x = event.pageX;
  //   const y = event.pageY;

  //   console.log(x, y);
  // }, []);

  // const mousemoveupFunction = useCallback((event) => {
  //   const x = event.pageX;
  //   const y = event.pageY;

  //   console.log(x, y);
  //   setDraggingTarget(null);
  // }, []);

  useEffect(() => {
    if (state === 'draw') {
      ref.current?.addEventListener("mousedown", mousedownFunction, false);
      return () => ref.current?.removeEventListener("mousedown", mousedownFunction, false);
    }
  }, [state, mousedownPosition, mouseupPosition]);

  useEffect(() => {
    if (state === 'draw') {
      ref.current?.addEventListener("mouseup", mouseupFunction, false);
      return () => ref.current?.removeEventListener("mouseup", mouseupFunction, false);
    }
  }, [state, mousedownPosition, mouseupPosition]);

  // 全ての要素の紐付け。現状使わないけど後で使う予定なので残す。
  // useEffect(() => {
  //   if (state === 'move') {
  //     Array.prototype.forEach.call(ref.current?.children, target => {
  //       target.addEventListener("mousedown", mousemovedownFunction, false);
  //       return () => target.removeEventListener("mousedown", mousemovedownFunction, false);
  //     });
  //   }
  // }, [state]);

  const handleDragstart = (event: any) => {
    const target = event.target as HTMLDivElement;
    console.log('in dragstart', target.id);
    setDraggingTarget(target);
  }

  const handleDragend = (event: any) => {
    const target = event.target as HTMLDivElement;
    const id = target.id;
    const rect = target.getBoundingClientRect();
    const top = event.screenY;
    const left = event.screenX;

    const content = <Box h={rect?.height} w={rect?.width} top={top} left={left} position='absolute' border='1px solid black' draggable={true} id={`${top}-${left}`} onDragStart={onDragStart} />
    setContents([...contents, content].filter(c => c.props.id !== id));
    setDraggingTarget(null);
  }

  useEffect(() => {
    if (state === 'move') {
      document.addEventListener('dragstart', handleDragstart, false);

      // ref.current?.addEventListener('dragleave', (event) => {
      //   console.log('dragleave')
      //   // console.log('dragleave', event);
      // }, false);

      // ref.current?.addEventListener('dragenter', (event) => {
      //   console.log('dragenter')
      //   // console.log('dragleave', event);
      // }, false);

      document.addEventListener('dragend', handleDragend, false);

      // ref.current?.addEventListener('drop', (event) => {
      //   console.log('drop')
      //   // event.preventDefault();
      //   // console.log('drop', event);
      // }, false);

      return () => {
        document.removeEventListener('dragstart', handleDragstart, false);
        document.removeEventListener('dragend', handleDragend, false);
      }
    }
  }, [state, draggingTarget]);

  return (
    <Box position='relative'>
      <Modal isOpen={isOpen} onClose={onClose} size='full'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>drawing</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs onChange={(idx) => setState(tabs[idx])} defaultIndex={5}>
              <TabList>
                {tabs.map((d, i) => <Tab key={i.toString()}>{d}</Tab>)}
              </TabList>
              <TabPanels>
                {tabs.map((d, i) => <TabPanel key={i.toString()}>{d}</TabPanel>)}
              </TabPanels>
            </Tabs>
            <Box ref={ref} h='600px' dropzone='move' onDrop={onDrop} border="1px gray solid" borderRadius='10px'>
              {contents.map((child, idx) => <React.Fragment key={idx.toString()}>{child}</React.Fragment>)}
            </Box>
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
