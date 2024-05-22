import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import DOMPurify from 'dompurify';

import { logError } from '@edx/frontend-platform/logging';

import { useDebounce } from '../discussions/data/hooks';

const defaultSanitizeOptions = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['columnalign', 'target'],
};

const HTMLLoader = ({
  htmlNode, componentId, cssClassName, testId, delay,
}) => {
  const sanitizedMath = DOMPurify.sanitize(htmlNode, { ...defaultSanitizeOptions });
  const previewRef = useRef(null);
  const debouncedPostContent = useDebounce(htmlNode, delay);

  useEffect(() => {
    let promise = Promise.resolve(); // Used to hold chain of typesetting calls

    function typeset(code) {
      promise = promise.then(() => {
        if (typeof window?.MathJax !== 'undefined' && typeof window?.MathJax.startup !== 'undefined') {
          window.MathJax.startup.defaultPageReady().then((window.MathJax?.typesetPromise(code())));
        }
        return null;
      })
        .catch((err) => logError(`Typeset failed: ${err.message}`));
      return promise;
    }

    if (debouncedPostContent) {
      typeset(() => {
        if (previewRef.current !== null && typeof window?.MathJax !== 'undefined') {
          previewRef.current.innerHTML = sanitizedMath;
        }
      });
    }
  }, [debouncedPostContent]);

  return (
    <div ref={previewRef} className={cssClassName} id={componentId} data-testid={testId} />
  );
};

HTMLLoader.propTypes = {
  htmlNode: PropTypes.node,
  componentId: PropTypes.string,
  cssClassName: PropTypes.string,
  testId: PropTypes.string,
  delay: PropTypes.number,
};

HTMLLoader.defaultProps = {
  htmlNode: '',
  componentId: null,
  cssClassName: '',
  testId: '',
  delay: 0,
};

export default React.memo(HTMLLoader);
