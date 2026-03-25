"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";

type Todo = {
  id: number;
  text: string;
  done: boolean;
};

type Filter = "all" | "active" | "completed";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [mounted, setMounted] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  // Load from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) setTodos(JSON.parse(saved));
    setMounted(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (mounted) localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos, mounted]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId !== null) editRef.current?.focus();
  }, [editingId]);

  const nextId = () => (todos.length ? Math.max(...todos.map((t) => t.id)) + 1 : 1);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: nextId(), text, done: false }]);
    setInput("");
  };

  const toggleDone = (id: number) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id: number) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const commitEdit = () => {
    if (editingId === null) return;
    const text = editText.trim();
    if (!text) {
      deleteTodo(editingId);
    } else {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text } : t))
      );
    }
    setEditingId(null);
  };

  const cancelEdit = (originalText: string) => {
    setEditText(originalText);
    setEditingId(null);
  };

  const clearCompleted = () =>
    setTodos((prev) => prev.filter((t) => !t.done));

  const visible = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "completed") return t.done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const completedCount = todos.filter((t) => t.done).length;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-start justify-center pt-16 pb-10 px-4">
      <div className="w-full max-w-[560px]">
        {/* Title */}
        <h1 className="text-center text-5xl font-light tracking-[0.3em] text-purple-400 uppercase mb-9">
          TODO
        </h1>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 bg-[#16213e] text-gray-200 placeholder-gray-600 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="新しいタスクを入力..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") addTodo();
            }}
          />
          <button
            onClick={addTodo}
            className="bg-purple-400 hover:bg-purple-500 active:scale-95 text-[#1a1a2e] font-bold text-2xl rounded-xl px-5 transition-all leading-none"
          >
            +
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-5">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                filter === f
                  ? "bg-purple-400 border-purple-400 text-[#1a1a2e] font-semibold"
                  : "border-gray-700 text-gray-500 hover:text-purple-400 hover:border-purple-400"
              }`}
            >
              {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
            </button>
          ))}
        </div>

        {/* List */}
        <ul className="flex flex-col gap-2 min-h-[40px]">
          {visible.length === 0 && (
            <li className="text-center text-gray-700 text-sm py-8">
              タスクがありません
            </li>
          )}
          {visible.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center gap-3 px-4 py-3.5 bg-[#16213e] border border-[#1e2a4a] rounded-xl group transition-all ${
                todo.done ? "opacity-60" : ""
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleDone(todo.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  todo.done
                    ? "bg-purple-400 border-purple-400"
                    : "border-gray-600 hover:border-purple-400"
                }`}
                aria-label="完了切り替え"
              >
                {todo.done && (
                  <svg
                    className="w-3 h-3 text-[#1a1a2e]"
                    fill="none"
                    viewBox="0 0 12 12"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <polyline points="1.5,6 4.5,9.5 10.5,2.5" />
                  </svg>
                )}
              </button>

              {/* Text / Edit */}
              {editingId === todo.id ? (
                <input
                  ref={editRef}
                  className="flex-1 bg-transparent text-gray-200 text-sm outline-none border-b border-purple-400 min-w-0"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") cancelEdit(todo.text);
                  }}
                />
              ) : (
                <span
                  className={`flex-1 text-sm cursor-text min-w-0 break-words ${
                    todo.done ? "line-through text-gray-600" : "text-gray-200"
                  }`}
                  onDoubleClick={() => startEdit(todo)}
                >
                  {todo.text}
                </span>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="flex-shrink-0 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-base px-1"
                aria-label="削除"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex justify-between items-center mt-5 text-xs text-gray-600 px-1">
          <span>{activeCount} 件未完了</span>
          <button
            onClick={clearCompleted}
            disabled={completedCount === 0}
            className="hover:text-red-400 disabled:opacity-30 disabled:cursor-default transition-colors"
          >
            完了済みを削除
          </button>
        </div>
      </div>
    </div>
  );
}
