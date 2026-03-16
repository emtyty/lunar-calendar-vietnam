import { useState } from 'react';
import { Calendar, X, Plus, Pencil, Trash2, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LunarEvent } from '../../types';
import { generateAndDownloadICS, ExportSummary } from '../../services/icsService';
import { PresetId, PRESET_DEFINITIONS } from '../../constants/presets';

interface Props {
  events: LunarEvent[];
  enabledPresets: Set<PresetId>;
  expandedPresets: LunarEvent[];
  onAddEvent:    (draft: Omit<LunarEvent, 'id' | 'createdAt'>) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (id: string, patch: Partial<Omit<LunarEvent, 'id' | 'createdAt'>>) => void;
  onTogglePreset: (id: PresetId) => void;
  onClose: () => void;
}

const EMPTY_FORM = { title: '', lunarDay: 1, lunarMonth: 1, isLeapMonth: false };

export function LunarEventModal({
  events,
  enabledPresets,
  expandedPresets,
  onAddEvent,
  onDeleteEvent,
  onUpdateEvent,
  onTogglePreset,
  onClose,
}: Props) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [yearCount, setYearCount] = useState(5);
  const [exportResult, setExportResult] = useState<ExportSummary | null>(null);

  const startYear = new Date().getFullYear();
  const endYear   = startYear + yearCount - 1;

  const allExportEvents = [...expandedPresets, ...events];
  const totalItems      = yearCount * allExportEvents.length;

  // ---------------------------------------------------------------------------
  // Form handlers
  // ---------------------------------------------------------------------------

  function handleEdit(event: LunarEvent) {
    setEditingId(event.id);
    setForm({
      title:       event.title,
      lunarDay:    event.lunarDay,
      lunarMonth:  event.lunarMonth,
      isLeapMonth: event.isLeapMonth,
    });
    setShowForm(true);
    setExportResult(null);
  }

  function handleSave() {
    const title = form.title.trim();
    if (!title) return;

    if (editingId) {
      onUpdateEvent(editingId, { ...form, title });
      setEditingId(null);
    } else {
      onAddEvent({ ...form, title });
    }

    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleCancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    onDeleteEvent(id);
    if (editingId === id) handleCancel();
    setExportResult(null);
  }

  function handleTogglePreset(id: PresetId) {
    onTogglePreset(id);
    setExportResult(null);
  }

  // ---------------------------------------------------------------------------
  // Export handler
  // ---------------------------------------------------------------------------

  function handleExport() {
    const result = generateAndDownloadICS(allExportEvents, startYear, yearCount);
    setExportResult(result);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[90vh]">

        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <Calendar className="text-accent" size={24} />
            <div>
              <h2 className="text-xl font-bold text-ink">Sự Kiện Âm Lịch</h2>
              <p className="text-[11px] text-olive/70">Xuất lịch âm sang Google Calendar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-all">
            <X size={20} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* ── Section 1: Preset events ── */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase font-bold text-olive/60 tracking-wider">
              Sự kiện lặp lại có sẵn
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_DEFINITIONS.map(preset => {
                const active = enabledPresets.has(preset.id);
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleTogglePreset(preset.id)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                      active
                        ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                        : 'border-border bg-slate-50/50 hover:border-accent/40',
                    )}
                  >
                    <span className="text-2xl shrink-0 leading-none mt-0.5">{preset.emoji}</span>
                    <div className="min-w-0">
                      <div className={cn('text-sm font-bold truncate', active ? 'text-accent' : 'text-ink')}>
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-olive/60 mt-0.5">{preset.description}</div>
                      <div className={cn(
                        'mt-1 text-[10px] font-semibold',
                        active ? 'text-accent' : 'text-olive/40',
                      )}>
                        {active ? `✓ Đã bật · ${preset.events.length} sự kiện/năm` : `${preset.events.length} sự kiện/năm`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Section 2: Custom event list ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-olive/60 tracking-wider">
                Sự kiện riêng ({events.length})
              </span>
              {!showForm && (
                <button
                  onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
                  className="flex items-center gap-1 text-[11px] font-bold text-accent hover:text-accent/80 transition-colors"
                >
                  <Plus size={14} /> Thêm mới
                </button>
              )}
            </div>

            {events.length === 0 && !showForm ? (
              <div className="p-6 text-center text-olive/50 italic text-sm border border-dashed border-border rounded-xl">
                Chưa có sự kiện riêng. Nhấn "Thêm mới" để thêm giỗ, sinh nhật...
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {events.map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-all',
                      editingId === event.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/40 bg-slate-50/50',
                    )}
                  >
                    <div>
                      <div className="font-bold text-sm text-ink">{event.title}</div>
                      <div className="text-[11px] text-olive/70 mt-0.5">
                        Âm {event.lunarDay}/{event.lunarMonth}
                        {event.isLeapMonth && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[10px] font-bold">
                            Nhuận
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-olive hover:text-accent transition-all"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-olive hover:text-rose-600 transition-all"
                        title="Xoá"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section 3: Add / Edit form ── */}
          {showForm && (
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-accent/30 bg-accent/5">
              <div className="text-[11px] uppercase font-bold text-accent/80 tracking-wider">
                {editingId ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-olive/70 uppercase">Tên sự kiện</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="vd: Giỗ nội, Sinh nhật..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none bg-white"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-olive/70 uppercase">Ngày âm lịch</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-xs text-olive/60 shrink-0">Ngày</span>
                    <select
                      value={form.lunarDay}
                      onChange={e => setForm(f => ({ ...f, lunarDay: +e.target.value }))}
                      className="flex-1 px-2 py-1.5 text-sm border border-border rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none bg-white cursor-pointer"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-xs text-olive/60 shrink-0">Tháng</span>
                    <select
                      value={form.lunarMonth}
                      onChange={e => setForm(f => ({ ...f, lunarMonth: +e.target.value }))}
                      className="flex-1 px-2 py-1.5 text-sm border border-border rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none bg-white cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-1 w-fit">
                  <input
                    type="checkbox"
                    checked={form.isLeapMonth}
                    onChange={e => setForm(f => ({ ...f, isLeapMonth: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span className="text-xs text-olive/80 font-medium">Tháng nhuận</span>
                  <span className="text-[10px] text-olive/50">(chỉ chọn nếu đúng là tháng nhuận)</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1.5 text-sm font-semibold text-olive hover:bg-slate-100 rounded-lg transition-all border border-border"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim()}
                  className="px-4 py-1.5 text-sm font-bold bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Lưu
                </button>
              </div>
            </div>
          )}

          {/* ── Section 4: Export settings ── */}
          {allExportEvents.length > 0 && (
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-slate-50/50">
              <div className="text-[11px] uppercase font-bold text-olive/60 tracking-wider">
                Cài đặt xuất lịch
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-ink">Số năm muốn xuất</label>
                  <span className="text-lg font-bold text-accent w-8 text-right">{yearCount}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={yearCount}
                  onChange={e => { setYearCount(+e.target.value); setExportResult(null); }}
                  className="w-full accent-[var(--color-accent)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-olive/50 font-medium">
                  <span>1 năm</span>
                  <span>30 năm</span>
                </div>
                <div className="mt-1 text-center text-xs text-olive/70 bg-white border border-border rounded-lg py-2 px-3">
                  Năm <span className="font-bold text-accent">{startYear}</span>
                  {' '}→{' '}
                  <span className="font-bold text-accent">{endYear}</span>
                  {' '}· <span className="font-bold text-accent">{totalItems} mục</span>
                  {' '}({allExportEvents.length} sự kiện × {yearCount} năm)
                </div>
              </div>

              {exportResult && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <CheckCircle2 size={16} />
                    Đã xuất {exportResult.totalEvents} sự kiện thành công!
                  </div>
                  {exportResult.skippedCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
                        <AlertTriangle size={14} />
                        Bỏ qua {exportResult.skippedCount} mục (không thể chuyển đổi):
                      </div>
                      <ul className="flex flex-col gap-1">
                        {exportResult.skippedReasons.map((s, i) => (
                          <li key={i} className="text-[11px] text-amber-700">
                            &bull; <span className="font-bold">{s.title}</span> năm {s.solarYear}
                            {s.reason === 'leap_month_not_found'
                              ? ' — năm này không có tháng nhuận tương ứng'
                              : ' — lỗi chuyển đổi ngày'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-[11px] text-olive/60 text-center">
                    Mở Google Calendar → Cài đặt → Nhập lịch → tải file .ics vừa tải về
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="p-4 sm:p-6 border-t border-border bg-slate-50 flex items-center justify-between gap-3">
          <p className="text-[10px] text-olive/50 hidden sm:block">
            File .ics tương thích với Google Calendar, Apple Calendar, Outlook
          </p>
          <button
            onClick={handleExport}
            disabled={allExportEvents.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 ml-auto"
          >
            <Download size={16} />
            Tải file .ics
          </button>
        </footer>

      </div>
    </div>
  );
}
