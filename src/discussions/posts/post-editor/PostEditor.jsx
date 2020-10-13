import React, { useState } from 'react';

import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

function PostEditor() {
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );

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
      onEditorStateChange={setEditorState}
      toolbar={toolbar}
    />
  );
}

export default PostEditor;
