import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type IconProps = React.ComponentProps<typeof MaterialIcons>;

/**
 * A Material icon that is drawn only after the component has mounted.
 *
 * The static HTML is rendered on a server where the icon font is never loaded, while a browser may
 * already have it when it hydrates. Drawing the glyph on the very first render therefore produces
 * different markup on each side, and React discards the pre-rendered page. A same-sized placeholder
 * keeps the first render identical everywhere and avoids a layout shift.
 *
 * Icons are decorative: the control that contains one carries the accessible label, and a screen reader
 * would otherwise read out the glyph's private-use character.
 */
export const Icon: React.FC<IconProps> = ({ size = 24, ...props }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <View style={{ width: size, height: size }} />;
  return (
    <MaterialIcons
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no"
      size={size}
      {...props}
    />
  );
};
