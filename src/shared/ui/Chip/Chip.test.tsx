import { fireEvent, screen } from '@testing-library/react-native';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { Chip } from './Chip';

describe('Chip', () => {
  it('as a checkbox, exposes the checked state and passes its id', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <Chip id="senior" label="Senior" selected role="checkbox" onPress={onPress} />,
    );
    const chip = screen.getByRole('checkbox', { name: 'Senior' });
    expect(chip).toBeChecked();
    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledWith('senior');
  });

  it('as a tab, exposes the selected state', async () => {
    await renderWithTheme(
      <Chip id="react" label="React" selected role="tab" onPress={jest.fn()} />,
    );
    expect(screen.getByRole('tab', { name: 'React' })).toBeSelected();
  });

  it('uses the accent border and bold label when selected', async () => {
    await renderWithTheme(<Chip id="go" label="Go" selected role="tab" onPress={jest.fn()} />);
    expect(screen.getByRole('tab')).toHaveStyle({
      borderColor: lightColors.accent,
      backgroundColor: lightColors.accentSoft,
    });
    expect(screen.getByText('Go')).toHaveStyle({ fontWeight: '600' });
  });

  it('is unchecked and neutral when not selected', async () => {
    await renderWithTheme(
      <Chip id="mid" label="Mid" selected={false} role="checkbox" onPress={jest.fn()} />,
    );
    expect(screen.getByRole('checkbox', { name: 'Mid' })).not.toBeChecked();
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <Chip id="x" label="X" selected={false} role="checkbox" onPress={onPress} disabled />,
    );
    await fireEvent.press(screen.getByRole('checkbox'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
