import { ColorMode } from './palette';

const lightShadows = [
  'none',
  '0px 1px 3px rgba(26, 31, 10, 0.06)',
  '0px 4px 12px rgba(26, 31, 10, 0.08)',
  '0px 8px 24px rgba(26, 31, 10, 0.1)',
  '0px 0px 0px 1px rgba(176, 189, 49, 0.12), 0px 8px 28px rgba(26, 31, 10, 0.08)',
  '0px 12px 40px rgba(26, 31, 10, 0.12)',
];

const darkShadows = [
  'none',
  '0px 1px 3px rgba(0, 0, 0, 0.35)',
  '0px 4px 16px rgba(0, 0, 0, 0.4)',
  '0px 8px 28px rgba(0, 0, 0, 0.45)',
  '0px 0px 0px 1px rgba(176, 189, 49, 0.12), 0px 12px 40px rgba(0, 0, 0, 0.45)',
  '0px 16px 48px rgba(0, 0, 0, 0.5)',
];

export const getShadows = (mode: ColorMode): string[] =>
  mode === 'dark' ? darkShadows : lightShadows;

/** @deprecated use getShadows — kept for any legacy imports */
const shadows = darkShadows;

export default shadows;
