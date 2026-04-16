import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinaleDebugPage from './FriendBookFinaleDebugPage';

test('renders a standalone friend-book finale debug page without the main-site flow sections', () => {
  const markup = renderToStaticMarkup(<FriendBookFinaleDebugPage />);

  assert.match(markup, /Friend Book Finale Debug/);
  assert.match(markup, /FRIEND_BOOK_BUTTON_POSITIONING/);
  assert.match(markup, /id="friend-book-finale-section"/);
  assert.doesNotMatch(markup, /id="career-detail-section"/);
  assert.doesNotMatch(markup, /id="works-detail-section"/);
});
