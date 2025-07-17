import React from 'react';
import PropTypes from 'prop-types';

// Define mock functions
export const mockOnChange = jest.fn();
export const mockOnExpired = jest.fn();
export const mockOnError = jest.fn();
export const mockReset = jest.fn();

const MockReCAPTCHA = React.forwardRef((props, ref) => {
  const { onChange, onExpired, onError } = props;
  React.useImperativeHandle(ref, () => ({
    reset: mockReset,
  }));

  return (
    <div data-testid="mocked-recaptcha" ref={ref}>
      <button type="button" onClick={() => { mockOnChange(); onChange?.('mock-token'); }}>
        Solve CAPTCHA
      </button>
      <button type="button" onClick={() => { mockOnExpired(); onExpired?.(); }}>
        Expire CAPTCHA
      </button>
      <button type="button" onClick={() => { mockOnError(); onError?.(); }}>
        Error CAPTCHA
      </button>
    </div>
  );
});

MockReCAPTCHA.propTypes = {
  onChange: PropTypes.func,
  onExpired: PropTypes.func,
  onError: PropTypes.func,
};
MockReCAPTCHA.defaultProps = {
  onChange: () => {},
  onExpired: () => {},
  onError: () => {},
};

export default MockReCAPTCHA;
