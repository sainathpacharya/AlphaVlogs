import Skeleton from './index';
import {FC} from 'react';
import {DimensionValue} from 'react-native';

interface SkeletonTextProps {
  lines?: number;
  width?: DimensionValue | string;
  height?: DimensionValue | string;
}

export const SkeletonText: FC<SkeletonTextProps> = ({
  lines = 1,
  width = '100%',
  height = 14,
}) => {
  return (
    <>
      {Array.from({length: lines}).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '80%' : width}
          height={height}
          rounded={4}
        />
      ))}
    </>
  );
};
