import { screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { Button } from '../Button';
import { ActionRow } from './ActionRow';

describe('ActionRow', () => {
  it('lays actions out in a right-aligned, wrapping row, in the given order', async () => {
    await renderWithTheme(
      <ActionRow>
        <Button label="Înapoi" variant="secondary" onPress={jest.fn()} />
        <Button label="Verifică" onPress={jest.fn()} />
      </ActionRow>,
    );
    expect(screen.root).toHaveStyle({
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    });
    expect(
      screen.getAllByRole('button').map(button => button.props.accessibilityLabel ?? ''),
    ).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Verifică' })).toBeOnTheScreen();
  });
});
