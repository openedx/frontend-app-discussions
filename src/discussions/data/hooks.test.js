import { act, renderHook } from '@testing-library/react-hooks';

import { useUrlUpdate } from './hooks';

const postId = 'postId';
const topicId = 'topicId';

describe('useUrlUpdate', () => {
  test('test default values', () => {
    const { result } = renderHook(() => useUrlUpdate(postId, topicId, true));
    expect(result.current.message).toStrictEqual({
      payload: { postId: 'postId', topicId: 'topicId' },
      type: 'discussions.path.change',
    });
  });
  test('test link change', () => {
    const { result } = renderHook(() => useUrlUpdate(postId, topicId, true));
    act(() => {
      result.current.setpostId('postId2');
    });
    expect(result.current.message).toStrictEqual({
      payload: { postId: 'postId2', topicId: 'topicId' },
      type: 'discussions.path.change',
    });
  });
});
