import assert from "node:assert/strict";
import test from "node:test";
import {
  readDueDate,
  readPriority,
  readRequiredText,
} from "./todo-validation";

test("文本字段会清理空格并拒绝空值", () => {
  assert.equal(readRequiredText("  完成报告  ", "任务标题", 200), "完成报告");
  assert.throws(() => readRequiredText("   ", "任务标题", 200));
});

test("优先级只接受三个允许值", () => {
  assert.equal(readPriority("HIGH"), "HIGH");
  assert.throws(() => readPriority("URGENT"));
});

test("截止日期严格校验日期格式和有效性", () => {
  assert.equal(
    readDueDate("2026-08-09")?.toISOString(),
    "2026-08-09T00:00:00.000Z",
  );
  assert.throws(() => readDueDate("2026-02-30"));
  assert.throws(() => readDueDate("09/08/2026"));
});
