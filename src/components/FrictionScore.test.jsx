// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import FrictionScore from './FrictionScore.jsx';

describe('FrictionScore', () => {
  afterEach(cleanup);

  it('labels an empty task list as Ultra Light', () => {
    render(<FrictionScore tasks={[]} />);
    expect(screen.getByText(/Ultra Light/)).toBeTruthy();
    expect(screen.getByText(/^0 —/)).toBeTruthy();
  });

  it('labels a single yearly task as Ultra Light (low frequency)', () => {
    render(<FrictionScore tasks={[{ interval: 1, unit: 'years' }]} />);
    expect(screen.getByText(/Ultra Light/)).toBeTruthy();
  });

  it('labels many weekly tasks as High Density', () => {
    const tasks = Array.from({ length: 10 }, () => ({ interval: 1, unit: 'weeks' }));
    render(<FrictionScore tasks={tasks} />);
    expect(screen.getByText(/High Density/)).toBeTruthy();
  });

  it('defaults interval to 1 when not parseable', () => {
    render(<FrictionScore tasks={[{ interval: 'oops', unit: 'weeks' }]} />);
    // interval defaults to 1 week -> weight 1 -> score 25 -> Balanced
    expect(screen.getByText(/Balanced/)).toBeTruthy();
  });

  it('shows the active task count in the tooltip', () => {
    const tasks = [{ interval: 3, unit: 'months' }, { interval: 6, unit: 'months' }];
    render(<FrictionScore tasks={tasks} />);
    expect(screen.getByText(/Active Tasks: 2/)).toBeTruthy();
  });
});
