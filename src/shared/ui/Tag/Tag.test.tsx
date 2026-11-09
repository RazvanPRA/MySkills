import { screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { Tag } from './Tag';

describe('Tag', () => {
  it('renders its label as plain, non-interactive text', async () => {
    await renderWithTheme(<Tag label="Senior" />);
    expect(screen.getByText('Senior')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
