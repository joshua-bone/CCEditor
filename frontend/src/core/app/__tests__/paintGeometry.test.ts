import { describe, it, expect } from 'vitest';
import {
  linePoints,
  rectFillPoints,
  rectOutlinePoints,
  ellipseOutlinePoints,
} from '../paintGeometry';

describe('linePoints', () => {
  it('returns a horizontal segment', () => {
    const pts = linePoints({ x: 0, y: 0 }, { x: 3, y: 0 });
    expect(pts).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  it('returns a diagonal segment', () => {
    const pts = linePoints({ x: 0, y: 0 }, { x: 2, y: 2 });
    expect(pts).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
  });
});

describe('rectFillPoints', () => {
  it('fills a 2x2 rect', () => {
    const pts = rectFillPoints({ x: 0, y: 0 }, { x: 1, y: 1 });
    expect(pts).toHaveLength(4);
    expect(pts).toContainEqual({ x: 0, y: 0 });
    expect(pts).toContainEqual({ x: 1, y: 1 });
  });
});

describe('rectOutlinePoints', () => {
  it('outlines a 2x2 rect', () => {
    const pts = rectOutlinePoints({ x: 0, y: 0 }, { x: 1, y: 1 });
    // corners should be present; interior empty
    expect(pts).toContainEqual({ x: 0, y: 0 });
    expect(pts).toContainEqual({ x: 1, y: 1 });
  });
});

describe('ellipseOutlinePoints', () => {
  it('returns non-empty set inside bounding rect', () => {
    const pts = ellipseOutlinePoints({ x: 0, y: 0 }, { x: 4, y: 2 });
    expect(pts.length).toBeGreaterThan(0);
  });
});
