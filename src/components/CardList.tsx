import { SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { Card } from './Card';
import { ModalViewImage } from './Modal/ViewImage';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface CardsProps {
  cards: Card[];
}

export function CardList({ cards }: CardsProps): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [imageSelected, setImageSelected] = useState('');

  const handleViewImage = (url: string): void => {
    setImageSelected(url);
    onOpen();
  };

  return (
    <>
      <SimpleGrid columns={2} spacing={10}>
        {cards?.map(card => (
          <Card data={card} viewImage={handleViewImage} />
        ))}
      </SimpleGrid>

      <ModalViewImage
        imgUrl={imageSelected}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
}
