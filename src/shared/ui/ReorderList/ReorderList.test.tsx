import { fireEvent, screen } from '@testing-library/react-native';
import { darkColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { ReorderList } from './ReorderList';
import type { ReorderListItem, ReorderListLabels } from './ReorderList.types';

const labels: ReorderListLabels = {
  up: 'Sus',
  down: 'Jos',
  moveUp: text => `Mută în sus: ${text}`,
  moveDown: text => `Mută în jos: ${text}`,
};

const items: ReorderListItem[] = [
  { id: '2', text: '`setTimeout`' },
  { id: '0', text: 'sync' },
  { id: '1', text: 'microtask' },
];

describe('ReorderList', () => {
  it('numbers the items in their current order', async () => {
    await renderWithTheme(<ReorderList items={items} onMove={jest.fn()} labels={labels} />);
    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByText('setTimeout')).toBeOnTheScreen();
    expect(screen.getByText('3')).toBeOnTheScreen();
  });

  it('moves an item through named buttons, passing its id and direction', async () => {
    const onMove = jest.fn();
    await renderWithTheme(<ReorderList items={items} onMove={onMove} labels={labels} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Mută în sus: sync' }));
    expect(onMove).toHaveBeenLastCalledWith('0', 'up');
    await fireEvent.press(screen.getByRole('button', { name: 'Mută în jos: setTimeout' }));
    expect(onMove).toHaveBeenLastCalledWith('2', 'down');
  });

  it('disables moving the first item up and the last item down', async () => {
    await renderWithTheme(<ReorderList items={items} onMove={jest.fn()} labels={labels} />);
    expect(screen.getByRole('button', { name: 'Mută în sus: setTimeout' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mută în jos: microtask' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mută în jos: sync' })).toBeEnabled();
  });

  it('after reveal shows each item’s state and caption, read-only', async () => {
    const revealed: ReorderListItem[] = [
      { id: '2', text: 'timeout', state: 'wrong', caption: 'Poziția corectă: 3' },
      { id: '0', text: 'sync', state: 'wrong', caption: 'Poziția corectă: 1' },
      { id: '1', text: 'micro', state: 'correct' },
    ];
    await renderWithTheme(
      <ReorderList items={revealed} onMove={jest.fn()} labels={labels} disabled />,
      'dark',
    );
    expect(screen.getByText('Poziția corectă: 3')).toBeOnTheScreen();
    screen.getAllByRole('button').forEach(button => expect(button).toBeDisabled());
    expect(screen.getByTestId('reorder-item-1')).toHaveStyle({
      borderColor: darkColors.success,
      backgroundColor: darkColors.successSoft,
    });
    expect(screen.getByTestId('reorder-item-2')).toHaveStyle({
      borderColor: darkColors.danger,
      backgroundColor: darkColors.dangerSoft,
    });
  });
});
