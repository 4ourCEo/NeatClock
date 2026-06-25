import { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { presetCardLabel } from './config/presets.js';
import { PrintsFooterCta, SiteFooter } from './components/SiteExtras.jsx';
import { MonetizationPreviewBanner } from './components/FeatureGate.jsx';
import InterestModal from './components/InterestModal.jsx';
import AppHeader from './components/AppHeader.jsx';
import BrandBanner from './components/BrandBanner.jsx';
import PartnerBuilder from './components/PartnerBuilder.jsx';
import TaskTable from './components/TaskTable.jsx';
import PresetSelector from './components/PresetSelector.jsx';
import ScheduleModals from './components/ScheduleModals.jsx';
import CalendarPreview from './components/CalendarPreview.jsx';
import {
  NaturalLanguageInput,
  ExportPreviewAside,
  StartOffsetSlider,
} from './components/ExportPanel.jsx';
import { useExportPreview } from './hooks/useExportPreview.js';
import ExportActions from './components/ExportActions.jsx';
import { useNotifications } from './hooks/useNotifications.js';
import { useSchedulePersistence } from './hooks/useSchedulePersistence.js';
import { useScheduleState } from './hooks/useScheduleState.js';
import { useExportActions } from './hooks/useExportActions.js';
import { getDeepLinkBootstrap } from './lib/deepLink.js';
import { trackEvent } from './lib/analytics.js';

function getCurrentPage() {
  if (typeof window === 'undefined') return 'generator';
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  if (pageParam === 'partner' || pageParam === 'agency') return 'partner';
  return 'generator';
}

function App() {
  const [printPreview, setPrintPreview] = useState(false);
  const [includePrintNotes, setIncludePrintNotes] = useState(false);
  const [includePrintBranding, setIncludePrintBranding] = useState(true);
  const [exportSuccessOpen, setExportSuccessOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [interestSource, setInterestSource] = useState('footer');
  const currentPage = getCurrentPage();

  const { notification, setNotification, showNotification } = useNotifications();

  const schedule = useScheduleState({ showNotification });
  const {
    tasks,
    setTasks,
    customPresets,
    setCustomPresets,
    activePreset,
    setActivePreset,
    theme,
    setTheme,
    showExportPreview,
    setShowExportPreview,
    startOffsetWeeks,
    setStartOffsetWeeks,
    confirmModal,
    setConfirmModal,
    presetModalOpen,
    setPresetModalOpen,
    presetNameInput,
    presetNameError,
    nlInput,
    setNlInput,
    parsedNl,
    handleAddNlTask,
    moveTask,
    handlePresetSelect,
    handleSavePreset,
    submitSavePreset,
    handleDeletePreset,
    handleAddTask,
    handleDeleteTask,
    handleToggleTaskChecked,
    handleUpdateTaskName,
    handleUpdateTaskInterval,
    handleUpdateTaskUnit,
    handleReset,
    handlePresetNameChange,
  } = schedule;

  const handleSetTheme = (newTheme) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setTheme(newTheme));
    } else {
      setTheme(newTheme);
    }
  };

  useSchedulePersistence({
    tasks,
    customPresets,
    activePreset,
    theme,
    showExportPreview,
    startOffsetWeeks,
    setNotification,
  });

  const {
    importInputRef,
    handleExportICS,
    handleExportBackup,
    handleImportBackupClick,
    handleImportBackupFile,
    handlePrint,
  } = useExportActions({
    tasks,
    activePreset,
    customPresets,
    theme,
    showExportPreview,
    startOffsetWeeks,
    setTasks,
    setActivePreset,
    setCustomPresets,
    setTheme: handleSetTheme,
    setShowExportPreview,
    setStartOffsetWeeks,
    setConfirmModal,
    setExportSuccessOpen,
    showNotification,
  });

  const exportPreview = useExportPreview(tasks);

  useEffect(() => {
    const deepLink = getDeepLinkBootstrap();
    if (deepLink) {
      trackEvent('preset_deep_link', { preset: deepLink.presetParam, fresh: deepLink.fresh });
    }
  }, []);

  const scrollToPresets = () => {
    setExportSuccessOpen(false);
    document.getElementById('preset-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openInterest = (source) => {
    setInterestSource(source);
    setInterestOpen(true);
  };

  return (
    <div className="app-canvas min-h-screen py-6 md:py-12 transition-colors duration-500 relative text-theme-text font-sans">
      <MonetizationPreviewBanner />

      <div className="pointer-events-none fixed inset-0 opacity-[0.025] mix-blend-overlay z-50 no-print bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noiseFilter%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/></svg>')]"></div>

      {notification && (
        <div className="toast-fixed fixed bg-theme-text text-theme-bg px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium z-50 animate-toast-in no-print border border-theme-border/20 max-w-[calc(100vw-2rem)]">
          <Sparkles className="w-4 h-4 text-theme-accent animate-pulse" />
          {notification}
        </div>
      )}

      <ScheduleModals
        confirmModal={confirmModal}
        onCloseConfirm={() => setConfirmModal(null)}
        presetModalOpen={presetModalOpen}
        presetNameInput={presetNameInput}
        presetNameError={presetNameError}
        onPresetNameChange={handlePresetNameChange}
        onClosePresetModal={() => setPresetModalOpen(false)}
        onSubmitSavePreset={submitSavePreset}
        exportSuccessOpen={exportSuccessOpen}
        onCloseExportSuccess={() => setExportSuccessOpen(false)}
        onExportSuccessPrint={() => { setExportSuccessOpen(false); handlePrint(); }}
        onScrollToPresets={scrollToPresets}
        activePreset={activePreset}
        onOpenInterest={() => openInterest('export')}
      />

      {interestOpen && (
        <InterestModal
          onClose={() => setInterestOpen(false)}
          activePreset={activePreset}
          source={interestSource}
        />
      )}

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportBackupFile}
        aria-hidden="true"
        tabIndex={-1}
      />

      {currentPage === 'partner' ? (
        <main className="mx-auto main-card max-w-5xl p-5 sm:p-8 md:p-12 rounded-2xl">
          <PartnerBuilder />
        </main>
      ) : (
        <main
          data-active-preset={activePreset}
          className={`mx-auto transition-all duration-500 print-area ${printPreview ? 'print-preview-mode print-paper-3d' : 'main-card max-w-5xl p-5 sm:p-8 md:p-12 rounded-2xl'}`}
        >
          <BrandBanner showOnPrint={includePrintBranding} />
          <AppHeader theme={theme} setTheme={handleSetTheme} />

        <section className="no-print mb-8">
          <PresetSelector
            tasks={tasks}
            activePreset={activePreset}
            customPresets={customPresets}
            onSelectPreset={handlePresetSelect}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
            presetCardLabel={presetCardLabel}
            showExportPreview={showExportPreview}
            onToggleExportPreview={() => setShowExportPreview(!showExportPreview)}
            printPreview={printPreview}
            onTogglePrintPreview={() => setPrintPreview(!printPreview)}
            onReset={handleReset}
            onShareCopied={showNotification}
            includePrintBranding={includePrintBranding}
            onTogglePrintBranding={setIncludePrintBranding}
            includePrintNotes={includePrintNotes}
            onTogglePrintNotes={setIncludePrintNotes}
          />
        </section>

        <div className={`grid grid-cols-1 ${showExportPreview ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
          <section className={showExportPreview ? 'lg:col-span-2' : 'lg:col-span-1'}>
            {!printPreview && (
              <NaturalLanguageInput
                nlInput={nlInput}
                onNlInputChange={setNlInput}
                parsedNl={parsedNl}
                onAddNlTask={handleAddNlTask}
              />
            )}

            {tasks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-theme-border/60 rounded-xl bg-theme-card/30">
                <p className="text-theme-text-muted font-serif italic mb-3">Your schedule is currently empty.</p>
                <button
                  onClick={handleAddTask}
                  className="no-print bg-theme-card border border-theme-border hover:border-theme-accent text-theme-text px-4 py-2 rounded text-sm flex items-center gap-1.5 mx-auto cursor-pointer focus:outline-none transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add your first task
                </button>
              </div>
            ) : (
              <TaskTable
                tasks={tasks}
                setTasks={setTasks}
                printPreview={printPreview}
                onUpdateTaskName={handleUpdateTaskName}
                onUpdateTaskInterval={handleUpdateTaskInterval}
                onUpdateTaskUnit={handleUpdateTaskUnit}
                onDeleteTask={handleDeleteTask}
                onMoveTask={moveTask}
                onToggleTaskChecked={handleToggleTaskChecked}
              />
            )}

            {!printPreview && (
              <button
                id="btn-add-task"
                onClick={handleAddTask}
                className="no-print w-full py-3.5 border border-dashed rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium mb-4 mt-4 cursor-pointer border-theme-border hover:border-theme-accent bg-theme-bg/10 hover:bg-theme-bg/25 text-theme-text-muted hover:text-theme-text focus:outline-none"
              >
                <Plus className="w-4 h-4" />
                Add Custom Task
              </button>
            )}
          </section>

          {showExportPreview && (
            <ExportPreviewAside exportPreview={exportPreview} />
          )}
        </div>

        <CalendarPreview
          tasks={tasks}
          printPreview={printPreview}
          includePrintNotes={includePrintNotes}
        />

        <ExportActions
          printPreview={printPreview}
          onExportBackup={handleExportBackup}
          onImportBackupClick={handleImportBackupClick}
          onPrint={handlePrint}
          onExportICS={handleExportICS}
          startOffsetSlot={
            !printPreview && (
              <StartOffsetSlider
                startOffsetWeeks={startOffsetWeeks}
                onStartOffsetChange={setStartOffsetWeeks}
              />
            )
          }
        />

        <PrintsFooterCta activePreset={activePreset} />
        <SiteFooter onOpenInterest={() => openInterest('footer')} />
      </main>
      )}
    </div>
  );
}

export default App;
