// Global Jest setup: mocks for native modules that have no JS implementation in Node.
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
