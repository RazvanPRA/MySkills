import { fireEvent, screen } from '@testing-library/react-native';
import { typography } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { TextField } from './TextField';

describe('TextField', () => {
  it('is reachable by its label and reports typed text', async () => {
    const onChangeText = jest.fn();
    await renderWithTheme(<TextField label="Notițe" value="" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText('Notițe'), 'useEffect cleanup');
    expect(onChangeText).toHaveBeenCalledWith('useEffect cleanup');
  });

  it('shows help text', async () => {
    await renderWithTheme(
      <TextField
        label="Output"
        value=""
        onChangeText={jest.fn()}
        help="Scrie exact ce afișează."
      />,
    );
    expect(screen.getByText('Scrie exact ce afișează.')).toBeOnTheScreen();
  });

  it('uses the monospace code style for code answers', async () => {
    await renderWithTheme(
      <TextField label="Output" value="42" onChangeText={jest.fn()} monospace />,
    );
    expect(screen.getByLabelText('Output')).toHaveStyle({ fontFamily: typography.code.fontFamily });
  });

  it('is not editable and exposes the disabled state when disabled', async () => {
    await renderWithTheme(<TextField label="Output" value="" onChangeText={jest.fn()} disabled />);
    const input = screen.getByLabelText('Output');
    expect(input).toBeDisabled();
    expect(input.props.editable).toBe(false);
  });
});
