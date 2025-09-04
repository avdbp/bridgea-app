import React from 'react';
import { Image, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { config } from '@/constants/config';

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  style,
  containerStyle 
}) => {
  return (
    <Image
      source={{ uri: config.APP_LOGO_URL }}
      style={[
        {
          width: size,
          height: size,
          resizeMode: 'contain',
        },
        style,
      ]}
      containerStyle={containerStyle}
    />
  );
};
