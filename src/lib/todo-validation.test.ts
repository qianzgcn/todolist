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
  const d1 = readDueDate("2026-08-09");
  assert.equal(d1?.getFullYear(), 2026);
  assert.equal(d1?.getMonth(), 7);
  assert.equal(d1?.getDate(), 9);
  assert.equal(d1?.getHours(), 23);
  assert.equal(d1?.getMinutes(), 59);

  const d2 = readDueDate("2026-08-09 14:30");
  assert.equal(d2?.getHours(), 14);
  assert.equal(d2?.getMinutes(), 30);

  assert.throws(() => readDueDate("2026-02-30"));
  assert.throws(() => readDueDate("09/08/2026"));
});
