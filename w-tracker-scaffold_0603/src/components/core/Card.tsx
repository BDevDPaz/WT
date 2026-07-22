import React from 'react';
import { View, ViewProps } from 'react-native';
import { PALETTE, RADIUS, SPACING } from '../../theme/tokens';

interface Props extends ViewProps {
  elevated?: boolean;
  paper?: boolean;
}

export function Card({ elevated, paper, style, ...rest }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: paper ? PALETTE.paper : (elevated ? PALETTE.carbonMist : PALETTE.graphite),
          borderRadius: elevated ? RADIUS.xl : RADIUS.lg,
          padding: SPACING.lg,
          borderWidth: paper ? 0 : 1,
          borderColor: PALETTE.steelLine,
        },
        style,
      ]}
      {...rest}
    />
  );
}
