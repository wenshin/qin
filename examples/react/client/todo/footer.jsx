import React from 'react';
import cn from 'classnames';
import Utils from './utils';

export default function TodoFooter(props) {
  const activeTodoWord = Utils.pluralize(props.count, 'item');
  let clearButton = null;

  if (props.completedCount > 0) {
    clearButton = (
      <button
        className='clear-completed'
        onClick={props.onClearCompleted}
      >
        Clear completed
      </button>
    );
  }

  const nowShowing = props.nowShowing;
  return (
    <footer className='footer'>
      <span className='todo-count'>
        <strong>{props.count}</strong> {activeTodoWord} left
      </span>
      <ul className='filters'>
        <li>
          <a
            href='#/'
            className={cn({selected: nowShowing === app.ALL_TODOS})}>
              All
          </a>
        </li>
        {' '}
        <li>
          <a
            href='#/active'
            className={cn({selected: nowShowing === app.ACTIVE_TODOS})}>
              Active
          </a>
        </li>
        {' '}
        <li>
          <a
            href='#/completed'
            className={cn({selected: nowShowing === app.COMPLETED_TODOS})}>
              Completed
          </a>
        </li>
      </ul>
      {clearButton}
    </footer>
  );
};
