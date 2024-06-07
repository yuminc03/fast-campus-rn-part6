import { renderHook, act } from '@testing-library/react-hooks';
import notifee from '@notifee/react-native';

import useReminder from '../src/hooks/useReminder';

jest.mock('@notifee/react-native', () => ({
  getTriggerNotifications: () => Promise.resolve([]),
}));

describe('useReminder', () => {
  describe('canAddReminder', () => {
    it('returns true if the number of scheduled reminders is less than 2', async () => {
      const { result } = renderHook(() => useReminder());
      const spyGetTriggerNotifcations = jest
        .spyOn(notifee, 'getTriggerNotifications')
        .mockResolvedValue([{} as any, {}, {}]); // mockResolvedValue 호출했을 때 리턴이 []가 되도록 조작함
      await act(async () => {
        expect(await result.current.canAddReminder()).toBe(false);
      });
      spyGetTriggerNotifcations.mockRestore();
    });
  });
});
