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

const initialPosition = {
  x: 0,
  y: 0,
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
  const [mousedownPosition, setMousedownPosition] = useState<Pos>(initialPosition);
  const [mouseupPosition, setMouseupPosition] = useState<Pos>(initialPosition);
  const [selectBoxPosition, setSelectBoxPosition] = useState<Pos>(initialPosition);
  const [selectBoxRect, setSelectBoxRect] = useState<Pos>(initialPosition);
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

  const mousedownSelectBoxFunction = useCallback((event) => {
    console.log(event)
    console.log('mousedown', event.pageX, event.pageY);
    setSelectBoxPosition({ x: event.pageX, y: event.pageY });
  }, [draggingTarget, selectBoxPosition, selectBoxRect]);

  const mousemovedownFunction = useCallback((event) => {
    console.log('set current element');

    console.log('mousedown', event.target)

    const target = event.target as HTMLDivElement;
    setDraggingTarget(target);

    const rect = target.getBoundingClientRect();
    console.log('rect', { x: rect.left, y: rect.top })
    setSelectBoxRect({ x: rect.left, y: rect.top })
  }, [draggingTarget, selectBoxPosition, selectBoxRect]);

  // DnD 用のコールバック
  const onDragStart = useCallback((event) => {
    console.log('onDragStart');

    console.log('ondragstart', event.target)

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

    const target = draggingTarget as HTMLDivElement;
    if (target === null) return;

    console.log(draggingTarget)
    const id = target.id;
    const rect = target.getBoundingClientRect();
    const innerLeft = selectBoxPosition.x - selectBoxRect.x;
    const innerTop = selectBoxPosition.y - selectBoxRect.y;
    const top = event.pageY - innerTop;
    const left = event.pageX - innerLeft;

    console.log(selectBoxPosition, selectBoxRect)

    const content = <Box h={rect?.height} w={rect?.width} top={top} left={left} position='absolute' border='1px solid black' draggable={true} id={`${top}-${left}`} onDragStart={onDragStart} />
    setContents([...contents, content].filter(c => c.props.id !== id));
    setDraggingTarget(null);
  }, [draggingTarget, selectBoxPosition, selectBoxRect]);

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
  }, [state, draggingTarget, contents]);

  useEffect(() => {
    if (state === 'move') {
      ref.current?.addEventListener("mousedown", mousedownSelectBoxFunction, false);
      return () => ref.current?.removeEventListener("mousedown", mousedownSelectBoxFunction, false);
    }
  }, [state, mousedownPosition, mouseupPosition]);

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
