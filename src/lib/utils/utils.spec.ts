/**
 * Unit tests for utility functions
 *
 * Test coverage:
 * - formatAsISO: date formatting with edge cases
 */
import { describe, expect, it } from 'vitest';
import { formatAsISO } from './utils';

describe('formatAsISO', () => {
	it('should format a standard date correctly', () => {
		const date = new Date('2024-03-15T10:30:00Z');

		const result = formatAsISO(date);

		expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
		expect(result).toContain('03');
		expect(result).toContain('2024');
	});

	it('should pad single-digit months with zero', () => {
		const date = new Date('2024-01-15T10:30:00Z');

		const result = formatAsISO(date);

		expect(result).toContain('01');
	});

	it('should pad single-digit days with zero', () => {
		const date = new Date('2024-03-05T10:30:00Z');

		const result = formatAsISO(date);

		expect(result).toContain('05');
	});

	it('should handle the first day of the year', () => {
		const date = new Date(2024, 0, 1);

		const result = formatAsISO(date);

		expect(result).toBe('01-01-2024');
	});

	it('should handle the last day of the year', () => {
		const date = new Date('2024-12-31T23:59:59Z');

		const result = formatAsISO(date);

		expect(result).toContain('12-31-2024');
	});

	it('should handle leap year date', () => {
		const date = new Date('2024-02-29T10:30:00Z');

		const result = formatAsISO(date);

		expect(result).toContain('02-29-2024');
	});

	it('should format date in MM-DD-YYYY format', () => {
		const date = new Date('2023-07-04T10:30:00Z');

		const result = formatAsISO(date);

		const parts = result.split('-');
		expect(parts).toHaveLength(3);
		expect(parts[0]).toHaveLength(2); // month
		expect(parts[1]).toHaveLength(2); // day
		expect(parts[2]).toHaveLength(4); // year
	});

	it('should handle dates from different years', () => {
		const dates = [
			new Date('2020-01-01T00:00:00Z'),
			new Date('2021-06-15T00:00:00Z'),
			new Date('2025-12-31T00:00:00Z')
		];

		dates.forEach((date) => {
			const result = formatAsISO(date);
			expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
		});
	});

	it('should handle current date', () => {
		const now = new Date();

		const result = formatAsISO(now);

		expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
		expect(result).toContain(now.getFullYear().toString());
	});
});
