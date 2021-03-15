/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const buildFeedElement = (feed) => {
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item');

  const h3El = document.createElement('h3');
  h3El.textContent = feed.title;

  const pEl = document.createElement('p');
  pEl.textContent = feed.description;

  liEl.append(h3El, pEl);
  return liEl;
};

const renderFeeds = (feeds, elements) => {
  elements.feedsBox.textContent = '';

  const h2El = document.createElement('h2');
  h2El.textContent = 'Feeds';

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'mb-5');

  const builtFeeds = feeds.map(buildFeedElement);
  ulEl.append(...builtFeeds);

  elements.feedsBox.append(h2El, ulEl);
};

const buildPostElement = (post) => {
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

  const aEl = document.createElement('a');
  aEl.classList.add('font-weigth-normal');
  aEl.href = post.link;
  aEl.target = '_blank';
  aEl.rel = 'noopener noreferrer';
  aEl.textContent = post.title;

  liEl.append(aEl);
  return liEl;
};

const renderPosts = (posts, elements) => {
  elements.postsBox.textContent = '';

  const h2El = document.createElement('h2');
  h2El.textContent = 'Posts';

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group');

  const builtPosts = posts.map(buildPostElement);
  ulEl.append(...builtPosts);

  elements.postsBox.append(h2El, ulEl);
};

const renderForm = (form, elements) => {
  switch (form.status) {
  case 'filling':
    elements.submitBtn.removeAttribute('disabled');
    elements.input.removeAttribute('disabled');
    elements.input.classList.remove('is-invalid');
    elements.input.value = '';
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    break;

  case 'incorrect':
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    break;

  case 'loading':
    elements.submitBtn.setAttribute('disabled', true);
    elements.input.setAttribute('disabled', true);
    break;

  case 'failed':
    elements.submitBtn.removeAttribute('disabled');
    elements.input.removeAttribute('disabled');
    elements.feedback.classList.add('text-danger');
    elements.input.classList.remove('is-invalid');
    break;

  default:
    throw new Error(`Unknown form status: ${form.status}`);
  }
};

const renderFeedback = (form, elements) => {
  elements.feedback.textContent = form.feedback;
};

const initView = (state, elements) => {
  elements.input.focus();

  const mapping = {
    feeds: () => renderFeeds(state.feeds, elements),
    posts: () => renderPosts(state.posts, elements),
    'form.status': () => renderForm(state.form, elements),
    'form.feedback': () => renderFeedback(state.form, elements),
    'form.submitCount': () => elements.input.focus(),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
