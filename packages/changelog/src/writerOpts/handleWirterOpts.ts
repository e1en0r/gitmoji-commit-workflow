import { Context, Options } from 'conventional-changelog-writer';
import type { Commit } from 'conventional-commits-parser';

const transform = (commit: Commit, context: Context) => {
  let discard = true;
  const issues = [];

  commit.notes.forEach((note) => {
    note.title = `BREAKING CHANGES`;
    discard = false;
  });

  // 修改 type 标题
  if (commit.type === `feat`) {
    commit.type = `✨ Features | 新特性`;
  } else if (commit.type === `fix`) {
    commit.type = `🐛 Bug Fixes | 修复`;
  } else if (commit.type === `perf`) {
    commit.type = `⚡ Performance Improvements`;
  } else if (commit.type === `revert`) {
    commit.type = `⏪ Reverts | 回退`;
  } else if (commit.type === `style`) {
    commit.type = `💄 Styles | 样式`;
  } else if (discard) {
    return;
  }

  if (commit.scope === '*') {
    commit.scope = '';
  }

  if (typeof commit.hash === 'string') {
    commit.hash = commit.hash.substring(0, 7);
  }

  if (typeof commit.subject === 'string') {
    let url = context.repository
      ? `${context.host}/${context.owner}/${context.repository}`
      : context.repoUrl;
    if (url) {
      url = `${url}/issues/`;
      // Issue URLs.
      commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
        issues.push(issue);
        return `[#${issue}](${url}${issue})`;
      });
    }
    if (context.host) {
      // User URLs.
      commit.subject = commit.subject.replace(
        /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
        (_, username) => {
          if (username.includes('/')) {
            return `@${username}`;
          }

          return `[@${username}](${context.host}/${username})`;
        },
      );
    }
  }

  // remove references that already appear in the subject
  commit.references = commit.references.filter((reference) => {
    return issues.indexOf(reference.issue) === -1;
  });

  return commit;
};

export default (): Options => ({
  transform,
  groupBy: 'type',
  commitGroupsSort: 'title',
  commitsSort: ['scope', 'subject'],
  noteGroupsSort: 'title',
  debug: (message) => {
    console.log(message);
  },
  // notesSort: (a, b) => {
  //   return compareFunc(a, b) as boolean;
  // },
});