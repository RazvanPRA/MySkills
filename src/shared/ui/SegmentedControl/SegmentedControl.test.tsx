import { fireEvent, screen } from '@testing-library/react-native';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { id: 'ro', label: 'Română' },
  { id: 'en', label: 'English' },
] as const;

describe('SegmentedControl', () => {
  it('renders a named radiogroup with one radio per option', async () => {
    await renderWithTheme(
      <SegmentedControl
        options={options}
        value="ro"
        onChange={jest.fn()}
        accessibilityLabel="Limbă"
      />,
    );
    // The group is deliberately not `accessible` (that would merge the radios into one
    // TalkBack element), so it is found by label and its role is checked directly.
    expect(screen.getByLabelText('Limbă')).toHaveProp('accessibilityRole', 'radiogroup');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('marks only the current value as selected, inverted', async () => {
    await renderWithTheme(
      <SegmentedControl
        options={options}
        value="ro"
        onChange={jest.fn()}
        accessibilityLabel="Limbă"
      />,
    );
    const active = screen.getByRole('radio', { name: 'Română' });
    expect(active).toBeSelected();
    expect(active).toHaveStyle({ backgroundColor: lightColors.text });
    expect(screen.getByRole('radio', { name: 'English' })).not.toBeSelected();
  });

  it('reports the pressed option id', async () => {
    const onChange = jest.fn();
    await renderWithTheme(
      <SegmentedControl
        options={options}
        value="ro"
        onChange={onChange}
        accessibilityLabel="Limbă"
      />,
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'English' }));
    expect(onChange).toHaveBeenCalledWith('en');
  });

  it('allows no selection yet (e.g. a self-rating before answering)', async () => {
    await renderWithTheme(
      <SegmentedControl
        options={options}
        value={null}
        onChange={jest.fn()}
        accessibilityLabel="Limbă"
      />,
    );
    screen.getAllByRole('radio').forEach(radio => expect(radio).not.toBeSelected());
  });

  it('disables every segment when disabled', async () => {
    const onChange = jest.fn();
    await renderWithTheme(
      <SegmentedControl
        options={options}
        value="ro"
        onChange={onChange}
        accessibilityLabel="Limbă"
        disabled
      />,
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'English' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
