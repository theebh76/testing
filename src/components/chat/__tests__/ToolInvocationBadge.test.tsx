import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, string>,
  done = false
): ToolInvocation {
  return done
    ? { toolCallId: "1", toolName, args, state: "result", result: "ok" }
    : { toolCallId: "1", toolName, args, state: "call" };
}

test("str_replace_editor create shows 'Creating <filename>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" })} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows 'Editing <filename>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/Card.jsx" })} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("str_replace_editor insert shows 'Editing <filename>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/Card.jsx" })} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("str_replace_editor view shows 'Reading <filename>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/index.tsx" })} />);
  expect(screen.getByText("Reading index.tsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows 'Undoing edit in <filename>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })} />);
  expect(screen.getByText("Undoing edit in App.jsx")).toBeDefined();
});

test("file_manager rename shows 'Renaming <filename>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/OldName.jsx" })} />);
  expect(screen.getByText("Renaming OldName.jsx")).toBeDefined();
});

test("file_manager delete shows 'Deleting <filename>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/App.jsx" })} />);
  expect(screen.getByText("Deleting App.jsx")).toBeDefined();
});

test("unknown tool shows raw tool name", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("some_unknown_tool", {})} />);
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("in-progress state shows spinner", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, false)} />
  );
  expect(container.querySelector(".animate-spin")).toBeTruthy();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("completed state shows green dot", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, true)} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
