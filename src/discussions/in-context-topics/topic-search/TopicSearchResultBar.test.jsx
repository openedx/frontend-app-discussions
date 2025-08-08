import { fireEvent, render } from '@testing-library/react';
import { useDispatch } from 'react-redux';

import { IntlProvider } from '@edx/frontend-platform/i18n';

import { setFilter } from '../data';
import messages from '../messages';
import TopicSearchResultBar from './TopicSearchResultBar';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../data', () => ({
  setFilter: jest.fn(),
}));

describe('TopicSearchResultBar', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(dispatch);
    setFilter.mockReturnValue({ type: 'SET_FILTER' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render search field', () => {
    const { getByPlaceholderText } = render(
      <IntlProvider locale="en">
        <TopicSearchResultBar />
      </IntlProvider>,
    );
    expect(getByPlaceholderText(messages.searchTopics.defaultMessage)).toBeInTheDocument();
  });

  it('should dispatch setFilter on submit', () => {
    const { getByPlaceholderText } = render(
      <IntlProvider locale="en">
        <TopicSearchResultBar />
      </IntlProvider>,
    );
    const searchField = getByPlaceholderText(messages.searchTopics.defaultMessage);
    fireEvent.change(searchField, { target: { value: 'test query' } });
    fireEvent.submit(searchField);

    expect(setFilter).toHaveBeenCalledWith('test query');
    expect(dispatch).toHaveBeenCalled();
  });

  it('should dispatch setFilter on change', () => {
    const { getByPlaceholderText } = render(
      <IntlProvider locale="en">
        <TopicSearchResultBar />
      </IntlProvider>,
    );
    const searchField = getByPlaceholderText(messages.searchTopics.defaultMessage);
    fireEvent.change(searchField, { target: { value: 'test' } });

    expect(setFilter).toHaveBeenCalledWith('test');
    expect(dispatch).toHaveBeenCalled();
  });
});
