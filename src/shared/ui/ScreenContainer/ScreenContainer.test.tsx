import { screen } from '@testing-library/react-native';
import { createRef } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { AppText } from '../AppText';
import { ScreenContainer } from './ScreenContainer';

describe('ScreenContainer', () => {
  it('renders its children inside a scroll view and forwards the ref', async () => {
    const ref = createRef<ScrollViewInstance>();
    await renderWithTheme(
      <ScreenContainer ref={ref}>
        <AppText>Conținut</AppText>
      </ScreenContainer>,
    );
    expect(screen.getByText('Conținut')).toBeOnTheScreen();
    expect(ref.current).not.toBeNull();
  });
});
