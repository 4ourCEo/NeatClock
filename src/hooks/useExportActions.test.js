// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BACKUP_VERSION } from '../lib/backup.js';
import { useExportActions } from './useExportActions.js';

vi.mock('../lib/buildIcs.js', () => ({
  buildIcsContent: vi.fn(() => 'BEGIN:VCALENDAR\r\nEND:VCALENDAR'),
}));

vi.mock('../lib/download.js', () => ({
  downloadText: vi.fn(),
}));

vi.mock('../config/features.js', () => ({
  features: { affiliateLinks: false },
}));

import { buildIcsContent } from '../lib/buildIcs.js';
import { downloadText } from '../lib/download.js';

function mockFileReaderWith(content) {
  class MockFileReader {
    result = '';
    onload = null;
    onerror = null;

    readAsText() {
      this.result = content;
      queueMicrotask(() => this.onload?.({ target: this }));
    }
  }

  vi.stubGlobal('FileReader', MockFileReader);
}

const baseState = {
  tasks: [{ id: 't1', name: 'Test Task', interval: 1, unit: 'months' }],
  activePreset: "Homeowner's Sentinel",
  customPresets: {},
  theme: 'theme-warm-sand',
  showExportPreview: true,
  startOffsetWeeks: 1,
};

function createHook(overrides = {}) {
  const showNotification = vi.fn();
  const setExportSuccessOpen = vi.fn();
  const setConfirmModal = vi.fn();

  const { result } = renderHook(() =>
    useExportActions({
      ...baseState,
      setTasks: vi.fn(),
      setActivePreset: vi.fn(),
      setCustomPresets: vi.fn(),
      setTheme: vi.fn(),
      setShowExportPreview: vi.fn(),
      setStartOffsetWeeks: vi.fn(),
      setConfirmModal,
      setExportSuccessOpen,
      showNotification,
      ...overrides,
    }),
  );

  return { result, showNotification, setExportSuccessOpen, setConfirmModal };
}

describe('useExportActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildIcsContent.mockReturnValue('BEGIN:VCALENDAR\r\nEND:VCALENDAR');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('handleExportICS notifies when tasks are empty', () => {
    const { result, showNotification, setExportSuccessOpen } = createHook({ tasks: [] });

    act(() => {
      result.current.handleExportICS();
    });

    expect(showNotification).toHaveBeenCalledWith('Please add at least one task to export.');
    expect(buildIcsContent).not.toHaveBeenCalled();
    expect(setExportSuccessOpen).not.toHaveBeenCalled();
  });

  it('handleExportBackup downloads versioned backup payload', () => {
    const { result, showNotification } = createHook();

    act(() => {
      result.current.handleExportBackup();
    });

    expect(downloadText).toHaveBeenCalledTimes(1);
    const [jsonText, filename, mime] = downloadText.mock.calls[0];
    const payload = JSON.parse(jsonText);

    expect(filename).toBe('neatclock-backup.json');
    expect(mime).toBe('application/json');
    expect(payload).toMatchObject({
      version: BACKUP_VERSION,
      app: 'NeatClock',
      tasks: baseState.tasks,
      activePreset: baseState.activePreset,
      customPresets: baseState.customPresets,
      preferences: {
        theme: baseState.theme,
        showExportPreview: baseState.showExportPreview,
        startOffsetWeeks: baseState.startOffsetWeeks,
      },
    });
    expect(payload.exportedAt).toEqual(expect.any(String));
    expect(showNotification).toHaveBeenCalledWith('Downloaded schedule backup');
  });

  it('handleImportBackupFile rejects invalid backup JSON', async () => {
    mockFileReaderWith('not json');
    const { result, showNotification, setConfirmModal } = createHook();

    const file = new File(['not json'], 'bad.json', { type: 'application/json' });
    const event = { target: { files: [file], value: 'set' } };

    act(() => {
      result.current.handleImportBackupFile(event);
    });

    await vi.waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Could not read backup file.');
    });
    expect(setConfirmModal).not.toHaveBeenCalled();
  });

  it('handleImportBackupFile rejects non-NeatClock backup', async () => {
    const payload = JSON.stringify({ app: 'OtherApp', tasks: [], activePreset: 'x' });
    mockFileReaderWith(payload);
    const { result, showNotification, setConfirmModal } = createHook();

    const file = new File([payload], 'other.json', { type: 'application/json' });
    const event = { target: { files: [file], value: 'set' } };

    act(() => {
      result.current.handleImportBackupFile(event);
    });

    await vi.waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('This file is not a NeatClock backup.');
    });
    expect(setConfirmModal).not.toHaveBeenCalled();
  });
});
