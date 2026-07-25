import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  smallBold: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    lineHeight: 18,
  },
  default: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 30,
  },
  link: {
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 22,
    fontSize: 13,
  },
  linkPrimary: {
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 22,
    fontSize: 13,
    color: '#0EA5E9',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
