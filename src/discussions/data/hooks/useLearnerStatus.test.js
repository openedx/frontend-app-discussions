import { renderHook } from '@testing-library/react';

import { useLearnerStatus } from './useLearnerStatus';

describe('useLearnerStatus hook', () => {
  describe('with new learner_status field', () => {
    it('should return isNewLearner=true for learner_status="new"', () => {
      const postData = { learner_status: 'new' };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', null));

      expect(result.current.isNewLearner).toBe(true);
      expect(result.current.isRegularLearner).toBe(false);
    });

    it('should return isRegularLearner=true for learner_status="regular"', () => {
      const postData = { learner_status: 'regular' };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(true);
    });

    it('should return both false for learner_status="staff"', () => {
      const postData = { learner_status: 'staff' };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(false);
    });

    it('should return both false for learner_status="anonymous"', () => {
      const postData = { learner_status: 'anonymous' };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(false);
    });

    it('should return both false for learner_status="unenrolled"', () => {
      const postData = { learner_status: 'unenrolled' };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(false);
    });
  });

  describe('with legacy boolean fields', () => {
    it('should work with legacy is_new_learner=true', () => {
      const postData = { is_new_learner: true, is_regular_learner: false };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', null));

      expect(result.current.isNewLearner).toBe(true);
      expect(result.current.isRegularLearner).toBe(false);
    });

    it('should work with legacy is_regular_learner=true', () => {
      const postData = { is_new_learner: false, is_regular_learner: true };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(true);
    });

    it('should prioritize learner_status over legacy fields', () => {
      // If both new and legacy fields are present, learner_status should take precedence
      const postData = {
        learner_status: 'regular',
        is_new_learner: true,
        is_regular_learner: false,
      };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(true);
    });
  });

  describe('special user types', () => {
    it('should return false for staff users regardless of learner_status', () => {
      const postData = { learner_status: 'new' };
      const { result } = renderHook(() => useLearnerStatus(postData, 'testuser', 'Staff'));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(false);
    });

    it('should return false for anonymous users', () => {
      const postData = { learner_status: 'new' };
      const { result } = renderHook(() => useLearnerStatus(postData, 'anonymous', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(false);
    });

    it('should return false for retired users', () => {
      const postData = { learner_status: 'new' };
      const { result } = renderHook(() => useLearnerStatus(postData, 'retired__user_123', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false when postData is null', () => {
      const { result } = renderHook(() => useLearnerStatus(null, 'testuser', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(false);
    });

    it('should return false when postData is empty object', () => {
      const { result } = renderHook(() => useLearnerStatus({}, 'testuser', null));

      expect(result.current.isNewLearner).toBe(false);
      expect(result.current.isRegularLearner).toBe(false);
    });
  });
});
