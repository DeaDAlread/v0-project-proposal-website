'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, Check, Command, RotateCcw, RotateCw, Trash2, Type } from 'lucide-react'

const sampleText = 'Stacks make it possible to undo a change.\n\nEach edit saves the previous version, so you can always step back.'
const MAX_HISTORY = 30

export function TextEditorDemo() {
  const [text, setText] = useState('')
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const words = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text])

  function updateText(nextText: string) {
    if (nextText === text) return
    setUndoStack((stack) => [...stack.slice(-(MAX_HISTORY - 1)), text])
    setRedoStack([])
    setText(nextText)
  }

  function undo() {
    if (!undoStack.length) return
    setRedoStack((stack) => [...stack, text])
    setText(undoStack[undoStack.length - 1])
    setUndoStack((stack) => stack.slice(0, -1))
  }

  function redo() {
    if (!redoStack.length) return
    setUndoStack((stack) => [...stack, text])
    setText(redoStack[redoStack.length - 1])
    setRedoStack((stack) => stack.slice(0, -1))
  }

  function clearText() {
    if (text) updateText('')
  }

  function loadSample() {
    updateText(sampleText)
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#1d2925]">
      <header className="border-b border-[#e7ebe6] bg-[#fbfcfa]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Stack Studio home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#193c32] text-white"><Type size={18} /></span>
            <span className="text-[15px] font-semibold tracking-tight">Stack Studio</span>
          </a>
          <div className="flex items-center gap-2 rounded-full border border-[#e5e9e4] bg-white px-3 py-1.5 text-xs font-medium text-[#64736c]">
            <span className="size-1.5 rounded-full bg-[#63a887]" /> Interactive demo <span className="hidden sm:inline">· runs in your browser</span>
          </div>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
        <section className="mb-8 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e9f2ec] px-3 py-1.5 text-xs font-semibold text-[#376650]">
            <span className="font-mono">01</span><span className="size-1 rounded-full bg-[#75a98a]" /> Data structures, made tangible
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.045em] text-[#1c2b25] sm:text-5xl">Undo is a stack of <span className="text-[#518267]">yesterdays.</span></h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#68756e] sm:text-[17px]">Every edit saves the previous version. Step backward with Undo, then forward with Redo — a simple, hands-on look at the LIFO stack behind your favorite editor.</p>
        </section>

        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]" aria-label="Interactive text editor and stack visualization">
          <div className="overflow-hidden rounded-2xl border border-[#e3e8e2] bg-white shadow-[0_12px_40px_-24px_rgba(31,53,43,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ec] px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full bg-[#6ca884]" /> Untitled document</div>
                <p className="mt-1 pl-4 text-xs text-[#8a968f]">Plain text · autosaved in this session</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={undo} disabled={!undoStack.length} aria-label="Undo last edit" title="Undo" className="inline-flex size-9 items-center justify-center rounded-lg border border-[#e8ece7] text-[#526159] transition hover:bg-[#f2f6f2] disabled:cursor-not-allowed disabled:opacity-35"><RotateCcw size={16} /></button>
                <button type="button" onClick={redo} disabled={!redoStack.length} aria-label="Redo last edit" title="Redo" className="inline-flex size-9 items-center justify-center rounded-lg border border-[#e8ece7] text-[#526159] transition hover:bg-[#f2f6f2] disabled:cursor-not-allowed disabled:opacity-35"><RotateCw size={16} /></button>
                <span className="mx-1 h-5 w-px bg-[#e8ece7]" />
                <button type="button" onClick={() => updateText(text.slice(0, -1))} disabled={!text} className="rounded-lg px-3 py-2 text-xs font-medium text-[#64736c] transition hover:bg-[#f2f6f2] disabled:cursor-not-allowed disabled:opacity-35">Delete character</button>
                <button type="button" onClick={clearText} disabled={!text} aria-label="Clear text" title="Clear text" className="inline-flex size-9 items-center justify-center rounded-lg text-[#87938c] transition hover:bg-[#fcf0ee] hover:text-[#a4564e] disabled:cursor-not-allowed disabled:opacity-35"><Trash2 size={15} /></button>
              </div>
            </div>
            <label htmlFor="editor" className="sr-only">Text editor</label>
            <textarea id="editor" value={text} onChange={(event) => updateText(event.target.value)} placeholder="Start typing here… Every change creates a snapshot on the Undo stack." spellCheck className="min-h-[340px] w-full resize-y bg-white px-6 py-6 text-[15px] leading-7 text-[#2c3932] outline-none placeholder:text-[#a1aaa4] sm:px-8 sm:py-8" />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0ec] bg-[#fcfdfb] px-5 py-3 text-xs text-[#849088] sm:px-6">
              <span>{words} {words === 1 ? 'word' : 'words'} <span className="mx-1.5 text-[#c3cbc5]">/</span> {text.length} characters</span>
              <button type="button" onClick={loadSample} className="font-medium text-[#4e7c63] hover:text-[#315941]">Load example text <ArrowRight size={13} className="ml-1 inline" /></button>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[#e3e8e2] bg-white p-5 shadow-[0_12px_40px_-24px_rgba(31,53,43,0.2)]">
              <div className="mb-4 flex items-center justify-between">
                <div><h2 className="text-sm font-semibold">Undo stack</h2><p className="mt-1 text-xs text-[#859189]">Previous states · LIFO</p></div>
                <span className="rounded-md bg-[#edf4ef] px-2 py-1 font-mono text-xs font-medium text-[#4e7c63]">{undoStack.length}</span>
              </div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#98a39c]"><ArrowDown size={13} /> Next to pop</div>
              <div className="flex min-h-[140px] flex-col-reverse gap-2 rounded-xl bg-[#f6f8f5] p-3" aria-live="polite" aria-label={`${undoStack.length} states in undo stack`}>
                {undoStack.length ? undoStack.slice(-4).map((state, index, visible) => {
                  const isTop = index === visible.length - 1
                  const number = undoStack.length - visible.length + index + 1
                  return <div key={`${number}-${state}`} className={`rounded-lg border px-3 py-2.5 ${isTop ? 'border-[#c9ddcf] bg-white shadow-sm' : 'border-[#edf0ec] bg-[#fbfcfa]'}`}><div className="mb-1 flex items-center justify-between"><span className="font-mono text-[10px] text-[#89958d]">#{number}</span>{isTop && <span className="text-[9px] font-semibold uppercase tracking-wider text-[#5c896d]">Top</span>}</div><p className="truncate text-xs text-[#647168]">{state || 'Empty document'}</p></div>
                }) : <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[#dce4dc] text-xs text-[#9aa59d]">No saved states yet</div>}
              </div>
              {undoStack.length > 4 && <p className="mt-2 text-center text-[10px] text-[#98a39c]">Showing the 4 most recent of {undoStack.length}</p>}
            </div>

            <div className="rounded-2xl border border-[#e3e8e2] bg-white p-5 shadow-[0_12px_40px_-24px_rgba(31,53,43,0.2)]">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Redo stack</h2><p className="mt-1 text-xs text-[#859189]">Undone states · LIFO</p></div><span className="rounded-md bg-[#f0f1f5] px-2 py-1 font-mono text-xs font-medium text-[#697080]">{redoStack.length}</span></div>
              <div className="flex min-h-[92px] flex-col-reverse gap-2 rounded-xl bg-[#f7f7f9] p-3" aria-live="polite" aria-label={`${redoStack.length} states in redo stack`}>
                {redoStack.length ? redoStack.slice(-3).map((state, index, visible) => <div key={`${index}-${state}`} className="rounded-lg border border-[#e9eaf0] bg-white px-3 py-2.5"><p className="truncate text-xs text-[#717887]">{state || 'Empty document'}</p></div>) : <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[#e1e3e9] text-xs text-[#9ba0aa]">Undo something to fill this stack</div>}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-3 rounded-2xl border border-[#e6ebe5] bg-[#f0f4ef] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
          <div><h2 className="text-sm font-semibold">Why a stack?</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-[#68766e]">A stack follows <strong className="font-semibold text-[#3b5144]">Last In, First Out</strong>: the most recent edit is the first one undone. Try typing, then tap Undo and Redo to watch each state move between stacks.</p></div>
          <div className="flex items-center gap-2 text-xs text-[#758279]"><span className="inline-flex items-center gap-1 rounded-md border border-[#dfe6de] bg-white px-2 py-1"><Command size={12} /> Z</span><ArrowLeft size={13} /><span>Undo</span><Check size={13} className="ml-1 text-[#6e9879]" /></div>
        </section>
        <footer className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-[#e7ebe6] pt-5 text-xs text-[#929c95] sm:flex-row sm:items-center"><span>Stack Studio <span className="mx-1.5">·</span> A tiny text editor, a big idea.</span><span>All changes stay in this browser session.</span></footer>
      </div>
    </main>
  )
}
