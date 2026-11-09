import { screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { Tag } from '../Tag';
import { ScreenHeader } from './ScreenHeader';

describe('ScreenHeader', () => {
  it('renders the title as a header, with subtitle and accessory', async () => {
    await renderWithTheme(
      <ScreenHeader title="Azi" subtitle="luni, 9 noiembrie" accessory={<Tag label="12 zile" />} />,
    );
    expect(screen.getByRole('header', { name: 'Azi' })).toBeOnTheScreen();
    expect(screen.getByText('luni, 9 noiembrie')).toBeOnTheScreen();
    expect(screen.getByText('12 zile')).toBeOnTheScreen();
  });

  it('omits the subtitle when not given', async () => {
    await renderWithTheme(<ScreenHeader title="Setări" />);
    expect(screen.getByRole('header', { name: 'Setări' })).toBeOnTheScreen();
  });
});
