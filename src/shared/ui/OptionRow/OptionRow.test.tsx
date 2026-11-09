import { fireEvent, screen } from '@testing-library/react-native';
import { darkColors, lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { AppText } from '../AppText';
import { OptionRow } from './OptionRow';
import type { OptionRowProps } from './OptionRow.types';
import { optionState } from './optionState';

const base: OptionRowProps = {
  id: '1',
  letter: 'B',
  label: 'useLayoutEffect',
  state: 'idle',
  checked: false,
  role: 'radio',
  onPress: jest.fn(),
};

describe('optionState', () => {
  it.each([
    [{ picked: false, isCorrect: true, revealed: false }, 'idle'],
    [{ picked: true, isCorrect: false, revealed: false }, 'selected'],
    [{ picked: true, isCorrect: true, revealed: true }, 'correct'],
    [{ picked: false, isCorrect: true, revealed: true }, 'correct'],
    [{ picked: true, isCorrect: false, revealed: true }, 'wrong'],
    [{ picked: false, isCorrect: false, revealed: true }, 'idle'],
  ])('%j → %s', (facts, expected) => {
    expect(optionState(facts)).toBe(expected);
  });
});

describe('OptionRow', () => {
  it('is a radio named by letter and label, passing its id on press', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<OptionRow {...base} onPress={onPress} />);
    const option = screen.getByRole('radio', { name: 'B. useLayoutEffect' });
    expect(option).not.toBeChecked();
    await fireEvent.press(option);
    expect(onPress).toHaveBeenCalledWith('1');
  });

  it('shows a pick with the selected colors, a bold label and the checked state', async () => {
    await renderWithTheme(<OptionRow {...base} role="checkbox" state="selected" checked />);
    const option = screen.getByRole('checkbox', { name: 'B. useLayoutEffect' });
    expect(option).toBeChecked();
    expect(option).toHaveStyle({
      borderColor: lightColors.selectedBorder,
      backgroundColor: lightColors.selected,
    });
    expect(screen.getByText('useLayoutEffect')).toHaveStyle({ fontWeight: '600' });
  });

  it.each([
    ['correct', 'success', 'successSoft'],
    ['wrong', 'danger', 'dangerSoft'],
  ] as const)('after reveal, a %s option uses %s', async (state, border, fill) => {
    await renderWithTheme(<OptionRow {...base} state={state} checked disabled />, 'dark');
    const option = screen.getByRole('radio');
    expect(option).toHaveStyle({
      borderColor: darkColors[border],
      backgroundColor: darkColors[fill],
    });
    expect(option).toBeDisabled();
    expect(screen.getByText('B')).toHaveStyle({ color: darkColors.surface });
  });

  it('does not respond after reveal', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<OptionRow {...base} onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('radio'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders a rich label while keeping the plain accessible name', async () => {
    await renderWithTheme(
      <OptionRow {...base}>
        <AppText>rich label</AppText>
      </OptionRow>,
    );
    expect(screen.getByText('rich label')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'B. useLayoutEffect' })).toBeOnTheScreen();
  });
});
