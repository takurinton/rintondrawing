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

  const mousedownFunction = useCallback((event) => {
    setMousedownPosition({ x: event.pageX, y: event.pageY });
  }, [mousedownPosition, mouseupPosition, state]);

  const mouseupFunction = useCallback((event) => {
    setMouseupPosition({ x: event.pageX, y: event.pageY });
    const height = Math.abs(mousedownPosition.y - event.pageY);
    const width = Math.abs(mousedownPosition.x - event.pageX);
    const left = event.pageX > mousedownPosition.x ? mousedownPosition.x : event.pageX;
    const top = event.pageY > mousedownPosition.y ? mousedownPosition.y : event.pageY;
    const cihld = <Box h={height} w={width} top={top} left={left} position='absolute' border='1px solid black' draggable={true} id={`${top}-${left}`} onDragStart={onDragStart} />
    setContents([...contents, cihld]);
  }, [mousedownPosition, mouseupPosition]);

  const mousemovedownFunction = useCallback((event) => {
    console.log('set current element');

    const target = event.target as HTMLDivElement;
    setDraggingTarget(target);
  }, [draggingTarget]);

  // DnD 用のコールバック
  const onDragStart = useCallback((event) => {
    console.log('onDragStart');

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData("element", event.target.id);
    // setDraggingTarget(event.target);
  }, []);

  const onDrop = useCallback((event) => {
    console.log('onDrop');

    event.preventDefault();
    const data = event.dataTransfer.getData("element");
    // setContents([...contents, data]);
  }, []);

  const handleDragstart = useCallback((event) => {
    console.log('dragstart');

    const target = event.target as HTMLDivElement;
    // setDraggingTarget(target);
  }, [])

  const handleDragleave = useCallback((event) => {
    console.log('dragleave');
  }, [])

  const handleDragenter = useCallback((event) => {
    console.log('dragenter');
  }, [])

  const handleDragend = useCallback((event) => {
    console.log('dragend');

    // const target = event.target as HTMLDivElement;
    // const id = target.id;
    // const rect = target.getBoundingClientRect();
    // const top = event.screenY;
    // const left = event.screenX;
    // const top = event.pageY;
    // const left = event.pageX;
  }, []);

  const handleDragover = useCallback((event) => {
    console.log('dragover');

    if (event.preventDefault) {
      event.preventDefault();
    }
    event.dataTransfer.dropEffect = 'move';
    return false;
  }, []);

  const handleDrop = useCallback((event) => {
    console.log('drop');

    console.log(draggingTarget)
    const target = draggingTarget as HTMLDivElement;
    const id = target.id;
    const rect = target !== null ? target.getBoundingClientRect() : { height: 0, width: 0, };
    const top = event.pageY;
    const left = event.pageX;

    const content = <Box h={rect?.height} w={rect?.width} top={top} left={left} position='absolute' border='1px solid black' draggable={true} id={`${top}-${left}`} onDragStart={onDragStart} />
    setContents([...contents, content].filter(c => c.props.id !== id));
    setDraggingTarget(null);
  }, [draggingTarget]);

  // 要素を作成するスタートの座標
  useEffect(() => {
    if (state === 'draw') {
      ref.current?.addEventListener("mousedown", mousedownFunction, false);
      return () => ref.current?.removeEventListener("mousedown", mousedownFunction, false);
    }
  }, [state, mousedownPosition, mouseupPosition]);

  // 要素を作成する終わりの座標
  useEffect(() => {
    if (state === 'draw') {
      ref.current?.addEventListener("mouseup", mouseupFunction, false);
      return () => ref.current?.removeEventListener("mouseup", mouseupFunction, false);
    }
  }, [state, mousedownPosition, mouseupPosition]);

  // ドラッグ中の要素のセット
  useEffect(() => {
    if (state === 'move') {
      Array.prototype.forEach.call(ref.current?.children, target => {
        target.addEventListener("mousedown", mousemovedownFunction, false);
        return () => target.removeEventListener("mousedown", mousemovedownFunction, false);
      });
    }
  }, [state, draggingTarget]);

  // 要素のDnDの処理
  useEffect(() => {
    if (state === 'move') {
      ref.current?.addEventListener('dragstart', handleDragstart, false);
      ref.current?.addEventListener('dragleave', handleDragleave, false);
      ref.current?.addEventListener('dragenter', handleDragenter, false);
      ref.current?.addEventListener('dragover', handleDragover, false);
      ref.current?.addEventListener('dragend', handleDragend, false);
      ref.current?.addEventListener('drop', handleDrop, false);

      return () => {
        ref.current?.removeEventListener('dragstart', handleDragstart, false);
        ref.current?.removeEventListener('dragleave', handleDragenter, false);
        ref.current?.removeEventListener('dragenter', handleDragenter, false);
        ref.current?.removeEventListener('dragover', handleDragover, false);
        ref.current?.removeEventListener('dragend', handleDragend, false);
        ref.current?.removeEventListener('dragend', handleDrop, false);
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
