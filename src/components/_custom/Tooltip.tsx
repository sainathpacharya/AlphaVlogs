import TooltipIcon from "@/assets/icons/Tooltip";
import {
  Box,
  Tooltip as GlueTooltip,
  TooltipContent,
  TooltipText,
} from "@/components";
import { FC } from "react";

interface TooltipProps {
  content: string;
}

const Tooltip: FC<TooltipProps> = ({ content }) => (
  <GlueTooltip
    placement="top"
    trigger={(triggerProps) => {
      return (
        <Box {...triggerProps}>
          <TooltipIcon />
        </Box>
      );
    }}
  >
    <TooltipContent>
      <TooltipText>{content}</TooltipText>
    </TooltipContent>
  </GlueTooltip>
);

export default Tooltip;
