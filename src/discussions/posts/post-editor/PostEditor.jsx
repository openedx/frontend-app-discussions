import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Form, StatefulButton } from '@edx/paragon';
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
    <Form.Check type="radio" value={value} className="d-flex p-0 my-0 mr-3">
      {/* <Form.Check.Input type="radio" className=""/> */}
      <Form.Check.Label>
        <Card>
          <Card.Body>
            <Card.Text className="d-flex flex-column align-items-center">
              <span className="text-gray-900">{icon}</span>
              <span>{type}</span>
              <span className="x-small text-gray-500">{description}</span>
            </Card.Text>
          </Card.Body>
        </Card>
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

      <Form.Group className="py-2 w-50">
        <Form.Control
          as="select"
          defaultValue="General"
          aria-describedby="topicAreaInput"
          floatingLabel={intl.formatMessage(messages.topicArea)}
          className=""
        >
          {/* TODO: topics has to be filled in another PR */}
          <option>General</option>
        </Form.Control>
      </Form.Group>

      <div className="border-bottom my-4" />

      <Form.Group className="py-2">
        <Form.Control
          type="text"
          aria-describedby="titleInput"
          floatingLabel={intl.formatMessage(messages.postTitle)}
        />
      </Form.Group>

      <Form.Group className="py-2">
        <Form.Control as="textarea" rows="3" />
      </Form.Group>

      <Form.Group>
        <Form.CheckboxSet
          name="post-options"
          defaultValue={[messages.followPost.id]}
          isInline
        >
          <Form.Checkbox value={messages.followPost.id}>
            {intl.formatMessage(messages.followPost)}
          </Form.Checkbox>
          <Form.Checkbox value={messages.anonymousPost.id}>
            {intl.formatMessage(messages.anonymousPost)}
          </Form.Checkbox>
        </Form.CheckboxSet>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <StatefulButton
          labels={{
            default: intl.formatMessage(messages.cancel),
          }}
          variant="outline-primary"
          onClick={cancelAdding}
        />
        <StatefulButton
          labels={{
            default: intl.formatMessage(messages.submit),
          }}
          className="ml-2"
          variant="primary"
        />
      </div>
    </Form>
  );
}

PostEditor.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PostEditor);
