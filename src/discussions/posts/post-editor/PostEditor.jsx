import React, { useState } from 'react';

import PropTypes from 'prop-types';

import { convertToRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToMarkdown from 'draftjs-to-markdown';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

function PostEditor({ onChange }) {
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );

  const onEditorStateChange = (...props) => {
    setEditorState(...props);

    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const markdown = draftToMarkdown(rawContentState);

    onChange(markdown);
  };

  const toolbar = {
    options: ['inline', 'blockType', 'image', 'list', 'link', 'history'],
    inline: {
      options: ['bold', 'italic'],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
    blockType: {
      options: ['Blockquote', 'Code'],
    },
  };

  return (
    <Editor
      tabIndex={0}
      editorState={editorState}
      editorClassName="form-control"
      editorStyle={{
        height: 'auto',
        userFocus: 'all',
      }}
      onEditorStateChange={onEditorStateChange}
      toolbar={toolbar}
    />
  );
}

PostEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default PostEditor;
