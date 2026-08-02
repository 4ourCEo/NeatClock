// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import HomeFaq from './HomeFaq.jsx';
import { HOME_FAQS } from '../config/homeFaqs.js';

afterEach(cleanup);

describe('HomeFaq', () => {
  it('renders FAQ heading and all schema-aligned questions', () => {
    render(<HomeFaq />);
    expect(screen.getByRole('heading', { name: /Frequently asked questions/i })).toBeTruthy();
    for (const faq of HOME_FAQS) {
      expect(screen.getByText(faq.title)).toBeTruthy();
    }
  });
});
