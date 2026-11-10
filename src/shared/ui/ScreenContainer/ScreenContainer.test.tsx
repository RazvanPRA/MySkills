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

describe('ScreenContainer safe area', () => {
  it('leaves the bottom edge to the tab bar by default, and reserves it on stack screens', async () => {
    await renderWithTheme(
      <ScreenContainer>
        <AppText>Tab</AppText>
      </ScreenContainer>,
    );
    expect(screen.root?.props.edges).toMatchObject({ top: 'additive', bottom: 'off' });
    await renderWithTheme(
      <ScreenContainer bottomInset>
        <AppText>Stack</AppText>
      </ScreenContainer>,
    );
    expect(screen.root?.props.edges).toMatchObject({ top: 'additive', bottom: 'additive' });
  });
});
