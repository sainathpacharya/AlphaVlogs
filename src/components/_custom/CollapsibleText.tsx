import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Text,
  View,
} from '@/components';
import React from 'react';

interface ICollapsibleText {
  title: string;
  content: string;
  titleIcon?: React.JSX.Element;
  handleExpanded?: () => void;
}

const CollapsibleText = ({
  titleIcon,
  title,
  content,
  handleExpanded,
}: ICollapsibleText) => {
  return (
    <Accordion
      variant="unfilled"
      type="single"
      isCollapsible={true}
      onValueChange={(expandedItems) => {
        if (handleExpanded && expandedItems?.length) {
          handleExpanded();
        }
      }}
    >
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger
            columnGap="$2"
            px="$0"
            pt="$4"
            justifyContent="flex-start"
          >
            {titleIcon ? titleIcon : <View />}
            <Text color="$cyan700">{title}</Text>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent px="$0">
          <AccordionContentText flexDirection="column">
            <Text color="$trueGray500" fontSize="$sm">
              {content}
            </Text>
          </AccordionContentText>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CollapsibleText;
