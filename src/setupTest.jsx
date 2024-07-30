import PropTypes from 'prop-types';

import '@testing-library/jest-dom/extend-expect';
import 'babel-polyfill';

// mock methods which are not implemented in JSDOM:
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.MathJax = {
  typeset: jest.fn(callback => {
    if (callback) { callback(); }
  }),
  startup: {
    defaultPageReady: jest.fn(() => Promise.resolve()),
  },
};

// Provides a mock editor component that functions like tinyMCE without the overhead
const MockEditor = ({
  onBlur,
  onEditorChange,
  value,
}) => (
  <textarea
    data-testid="tinymce-editor"
    value={value}
    onChange={(event) => {
      onEditorChange(event.currentTarget.value);
      onBlur(event.currentTarget.value);
    }}
    onBlur={onBlur}
  />
);
MockEditor.propTypes = {
  onBlur: PropTypes.func.isRequired,
  onEditorChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: MockEditor,
  };
});

// Mock ResizeObserver since JSDOM doesn't provider an implementation.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

jest.setTimeout(1000000);
