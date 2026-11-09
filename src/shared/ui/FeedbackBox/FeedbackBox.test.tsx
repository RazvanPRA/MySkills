import { screen } from '@testing-library/react-native';
import { darkColors, lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { AppText } from '../AppText';
import { FeedbackBox } from './FeedbackBox';

const liveRegion = () => screen.root;

describe('FeedbackBox', () => {
  it('writes the verdict as text, in the success tone, with a success bar', async () => {
    await renderWithTheme(
      <FeedbackBox verdict="correct" title="Corect">
        <AppText>Explicația.</AppText>
      </FeedbackBox>,
    );
    expect(screen.getByText('Corect')).toHaveStyle({ color: lightColors.success });
    expect(screen.getByText('Explicația.')).toBeOnTheScreen();
    expect(liveRegion()).toHaveStyle({ borderLeftColor: lightColors.success });
  });

  it.each(['wrong', 'partial'] as const)('uses the danger tone for %s', async verdict => {
    await renderWithTheme(<FeedbackBox verdict={verdict} title="Parțial corect (2/3)" />, 'dark');
    expect(screen.getByText('Parțial corect (2/3)')).toHaveStyle({ color: darkColors.danger });
  });

  it('is neutral without a verdict (flashcard model answer)', async () => {
    await renderWithTheme(<FeedbackBox title="Răspuns model" />);
    expect(screen.getByText('Răspuns model')).toHaveStyle({ color: lightColors.text });
  });

  it('is a polite live region containing the verdict, so it is announced', async () => {
    await renderWithTheme(<FeedbackBox verdict="wrong" title="Greșit" />);
    expect(liveRegion()?.props.accessibilityLiveRegion).toBe('polite');
    expect(liveRegion()).toContainElement(screen.getByText('Greșit'));
    expect(liveRegion()).toHaveStyle({ borderLeftColor: lightColors.danger });
  });
});
