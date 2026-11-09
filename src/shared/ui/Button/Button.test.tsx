import { fireEvent, screen } from '@testing-library/react-native';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { Button } from './Button';

describe('Button', () => {
  it('exposes the button role and label, and calls onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Începe" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Începe' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled, not hidden, when unavailable', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Verifică" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Verifică' });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('fills the primary variant with the accent color', async () => {
    await renderWithTheme(<Button label="Începe" onPress={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: lightColors.accent });
    expect(screen.getByText('Începe')).toHaveStyle({ color: lightColors.onAccent });
  });

  it('renders the secondary variant on the surface color', async () => {
    await renderWithTheme(<Button label="Înapoi" variant="secondary" onPress={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: lightColors.surface });
  });
});
