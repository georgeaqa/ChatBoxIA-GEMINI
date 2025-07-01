import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';

type CustomScreenWrapperProps = ViewProps & {
  className: string;
  children: React.ReactNode;
};

export default function CustomScreenWrapper({
  className,
  children,
  ...props
}: Partial<CustomScreenWrapperProps>) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={`flex-1 ${className}`}
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      {...props}>
      {children}
    </View>
  );
}
