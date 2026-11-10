import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { Tag } from '../Tag';
import { ListRow, rowAccessibilityLabel } from './ListRow';

describe('ListRow', () => {
  it('is a button named by title and meta', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<ListRow title="useEffect" meta="Mid · În lucru" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'useEffect, Mid · În lucru' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the accessory slot', async () => {
    await renderWithTheme(
      <ListRow title="Hooks" accessory={<Tag label="Parcurs" />} onPress={jest.fn()} />,
    );
    expect(screen.getByText('Parcurs')).toBeOnTheScreen();
  });

  it('can be disabled', async () => {
    await renderWithTheme(<ListRow title="Hooks" onPress={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Hooks' })).toBeDisabled();
  });
});

describe('rowAccessibilityLabel', () => {
  it('uses only the title when there is no meta', () => {
    expect(rowAccessibilityLabel('Hooks')).toBe('Hooks');
  });
});

describe('ListRow accessory label', () => {
  it('adds the accessory text to the accessible name', async () => {
    await renderWithTheme(
      <ListRow title="Hooks" meta="Mid" accessoryLabel="În lucru" onPress={jest.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Hooks, Mid, În lucru' })).toBeOnTheScreen();
  });
});
