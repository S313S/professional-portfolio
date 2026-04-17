import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinaleDebugPage from './FriendBookFinaleDebugPage';

test('renders a standalone friend-book finale debug page without the main-site flow sections', () => {
  const markup = renderToStaticMarkup(<FriendBookFinaleDebugPage />);

  assert.match(markup, /Friend Book Finale Debug/);
  assert.match(markup, /FRIEND_BOOK_BUTTON_POSITIONING/);
  assert.match(markup, /id="friend-book-finale-section"/);
  assert.match(markup, /data-friend-book-guestbook-page-indicator="true"[^>]*>1 \/ 2</);
  assert.match(markup, /林间拾页人/);
  assert.match(markup, /夜航漫游者/);
  assert.match(markup, /纸边侦探/);
  assert.match(markup, /Two Pages/);
  assert.match(markup, /Moon Run/);
  assert.match(markup, /Who&#x27;s This/);
  assert.doesNotMatch(markup, /id="career-detail-section"/);
  assert.doesNotMatch(markup, /id="works-detail-section"/);
});
