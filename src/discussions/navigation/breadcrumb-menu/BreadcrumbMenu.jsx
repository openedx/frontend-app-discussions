import React, { useContext } from 'react';

import { useSelector } from 'react-redux';

import { Routes } from '../../../data/constants';
import { selectBlocks, selectChapters } from '../../../data/selectors';
import { DiscussionContext } from '../../common/context';
import { selectTopic } from '../../topics/data/selectors';
import { discussionsPath } from '../../utils';
import BreadcrumbDropdown from './BreadcrumbDropdown';

function BreadcrumbMenu() {
  const {
    courseId,
    topicId,
    category,
  } = useContext(DiscussionContext);
  const blocks = useSelector(selectBlocks);
  const chapters = useSelector(selectChapters);
  const blockKey = useSelector(selectTopic(topicId))?.usageKey || category;

  let currentChapter = null;
  let currentVertical = null;
  let currentSequential = null;
  if (!blocks[blockKey]) {
    // Data is still loading
    return null;
  }
  if (blocks[blockKey].type === 'chapter') {
    currentChapter = blockKey;
  } else if (blocks[blockKey].type === 'sequential') {
    currentSequential = blockKey;
    currentChapter = blocks[currentSequential].parent;
  } else if (blocks[blockKey].type === 'vertical') {
    currentVertical = blockKey;
    currentSequential = blocks[currentVertical].parent;
    currentChapter = blocks[currentSequential].parent;
  }

  const getItemDisplayName = itemId => blocks[itemId]?.displayName;
  const getItemPath = itemId => discussionsPath(Routes.TOPICS.CATEGORY, {
    courseId,
    category: itemId,
  });

  return (
    <div className="breadcrumb-menu d-flex flex-row bg-light-200 box-shadow-down-1 px-2.5 py-1">
      <BreadcrumbDropdown
        currentItem={currentChapter}
        showAllPath={discussionsPath(Routes.TOPICS.ALL, { courseId })}
        items={chapters}
        itemPathFunc={getItemPath}
        itemActiveFunc={item => item === currentChapter}
        itemLabelFunc={getItemDisplayName}
      />
      {currentChapter
        && (
          <>
            <div className="d-flex py-2">/</div>
            <BreadcrumbDropdown
              currentItem={currentSequential}
              showAllPath={getItemPath(currentChapter)}
              items={blocks[currentChapter].children}
              itemPathFunc={getItemPath}
              itemActiveFunc={seqId => seqId === currentChapter}
              itemLabelFunc={getItemDisplayName}
            />
          </>
        )}
      {currentSequential
        && (
          <>
            <div className="d-flex py-2">/</div>
            <BreadcrumbDropdown
              currentItem={currentVertical}
              showAllPath={getItemPath(currentSequential)}
              items={blocks[currentSequential].children}
              itemPathFunc={getItemPath}
              itemActiveFunc={vertId => vertId === currentChapter}
              itemLabelFunc={getItemDisplayName}
            />
          </>
        )}
    </div>
  );
}

BreadcrumbMenu.propTypes = {};

export default BreadcrumbMenu;
