import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Form } from '@edx/paragon';
import { Help, Post } from '@edx/paragon/icons';

import { hidePostEditor } from '../data';
import messages from './messages';

function DiscussionPostType({
  value,
  type,
  description,
  icon,
}) {
  return (
    <Form.Check type="radio" value={value} className="d-flex border thin p-2 mr-2 my-0">
      {/* <Form.Check.Input type="radio" className=""/> */}
      <Form.Check.Label className="d-flex flex-column align-items-center">
        {icon}
        <span>{type}</span>
        <span className="x-small">{description}</span>
      </Form.Check.Label>
    </Form.Check>
  );
}

DiscussionPostType.propTypes = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
};

function PostEditor({ intl }) {
  const dispatch = useDispatch();
  const cancelAdding = () => dispatch(hidePostEditor());

  return (
    <Form className="mx-4 my-2">
      <h3>{intl.formatMessage(messages.heading)}</h3>
      <Form.Group>
        <Form.CheckboxSet className="d-flex flex-row my-3">
          <DiscussionPostType
            value="discussion"
            type={intl.formatMessage(messages.discussionType)}
            icon={<Post />}
            description={intl.formatMessage(messages.discussionDescription)}
          />
          <DiscussionPostType
            value="question"
            type={intl.formatMessage(messages.questionType)}
            icon={<Help />}
            description={intl.formatMessage(messages.questionDescription)}
          />
        </Form.CheckboxSet>
      </Form.Group>

      <Form.Group>
        <Form.Control
          as="select"
          defaultValue="General"
          aria-describedby="topicAreaInput"
          floatingLabel={intl.formatMessage(messages.topicArea)}
        >
          {/* TODO: topics has to be filled in another PR */}
          <option>General</option>
        </Form.Control>
      </Form.Group>

      <Form.Group>
        <Form.Control
          type="text"
          aria-describedby="titleInput"
          floatingLabel={intl.formatMessage(messages.postTitle)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Control as="textarea" rows="3" />
      </Form.Group>

      <Form.Group>
        <Form.Check inline type="checkbox" id="follow">
          <Form.Check.Input type="checkbox" />
          <Form.Check.Label>
            <span className="ml-2">{intl.formatMessage(messages.followPost)}</span>
          </Form.Check.Label>
        </Form.Check>

        <Form.Check inline type="checkbox" id="anonymous">
          <Form.Check.Input type="checkbox" />
          <Form.Check.Label>
            <span className="ml-2">{intl.formatMessage(messages.anonymousPost)}</span>
          </Form.Check.Label>
        </Form.Check>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="outline-primary" onClick={cancelAdding}>
          {intl.formatMessage(messages.cancel)}
        </Button>
        <Button className="ml-2" variant="primary">
          {intl.formatMessage(messages.submit)}
        </Button>
      </div>
    </Form>
  );
}

PostEditor.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PostEditor);
