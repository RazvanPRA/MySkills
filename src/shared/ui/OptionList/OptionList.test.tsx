import { fireEvent, screen } from '@testing-library/react-native';
import { fontFamily } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { OptionList, optionLetter } from './OptionList';
import type { OptionListItem } from './OptionList.types';

const options: OptionListItem[] = [
  { id: '0', text: '`useEffect`', state: 'idle', checked: false },
  { id: '1', text: '`useLayoutEffect`', state: 'selected', checked: true },
  { id: '2', text: 'Niciunul', state: 'idle', checked: false },
];

describe('OptionList', () => {
  it('letters the options and names them with plain text', async () => {
    await renderWithTheme(<OptionList options={options} role="radio" onPress={jest.fn()} />);
    expect(screen.getByRole('radio', { name: 'A. useEffect' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'B. useLayoutEffect' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'C. Niciunul' })).toBeOnTheScreen();
  });

  it('renders Markdown labels (inline code in the code font)', async () => {
    await renderWithTheme(<OptionList options={options} role="checkbox" onPress={jest.fn()} />);
    expect(screen.getByText('useEffect')).toHaveStyle({ fontFamily: fontFamily.mono });
  });

  it('passes the option id to the shared callback', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<OptionList options={options} role="checkbox" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'C. Niciunul' }));
    expect(onPress).toHaveBeenCalledWith('2');
  });

  it('disables every option after reveal', async () => {
    await renderWithTheme(
      <OptionList options={options} role="radio" onPress={jest.fn()} disabled />,
    );
    screen.getAllByRole('radio').forEach(option => expect(option).toBeDisabled());
  });

  it('letters up to F', () => {
    expect([0, 1, 5].map(optionLetter)).toEqual(['A', 'B', 'F']);
  });
});
