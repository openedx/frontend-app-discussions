import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Dropdown, DropdownButton } from '@edx/paragon';

import { selectBlocks, selectChapters, selectCurrentSelection } from '../../../data/selectors';
import { setCurrentChapter, setCurrentSequential, setCurrentVertical } from '../../../data/slices';
import messages from './messages';

function BreadcrumbMenu({ intl }) {
  const dispatch = useDispatch();
  const blocks = useSelector(selectBlocks);
  const chapters = useSelector(selectChapters);
  const {
    currentChapter,
    currentVertical,
    currentSequential,
  } = useSelector(selectCurrentSelection);

  const showAllMsg = intl.formatMessage(messages.showAll);

  return (
    <div className="breadcrumb-menu d-flex flex-row mt-2 mx-3">
      <DropdownButton
        title={blocks[currentChapter]?.displayName || showAllMsg}
        variant="outline"
        onSelect={(cId) => dispatch(setCurrentChapter(cId))}
      >
        <Dropdown.Item eventKey={null} key="null" active={currentChapter === null}>
          {showAllMsg}
        </Dropdown.Item>
        {chapters.map(chapter => (
          chapter.topics.length > 0
          && (
            <Dropdown.Item eventKey={chapter.id} key={chapter.id} active={chapter.id === currentChapter}>
              {chapter.displayName}
            </Dropdown.Item>
          )
        ))}
      </DropdownButton>
      {currentChapter
        && (
          <>
            <div className="d-flex py-2">/</div>
            <DropdownButton
              title={blocks[currentSequential]?.displayName || showAllMsg}
              variant="outline"
              onSelect={(sId) => dispatch(setCurrentSequential(sId))}
            >
              <Dropdown.Item eventKey={null} key="null" active={currentSequential === null}>
                {showAllMsg}
              </Dropdown.Item>
              {blocks[currentChapter].children.map(seqId => (
                blocks[seqId].topics.length > 0
                && (
                  <Dropdown.Item eventKey={seqId} key={seqId} active={seqId === currentSequential}>
                    {blocks[seqId].displayName}
                  </Dropdown.Item>
                )
              ))}
            </DropdownButton>
          </>
        )}
      {currentSequential
        && (
          <>
            <div className="d-flex py-2">/</div>
            <DropdownButton
              title={blocks[currentVertical]?.displayName || showAllMsg}
              variant="outline"
              onSelect={(vId) => dispatch(setCurrentVertical(vId))}
            >
              <Dropdown.Item eventKey={null} key="null" active={currentVertical === null}>
                {showAllMsg}
              </Dropdown.Item>
              {blocks[currentSequential]?.children?.map(vertId => (
                blocks[vertId].topics.length > 0
                && (
                  <Dropdown.Item eventKey={vertId} key={vertId} active={vertId === currentVertical}>
                    {blocks[vertId].displayName}
                  </Dropdown.Item>
                )
              ))}
            </DropdownButton>
          </>
        )}
    </div>
  );
}

BreadcrumbMenu.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(BreadcrumbMenu);
