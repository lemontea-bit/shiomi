import type { Field, FieldMeta } from '../types';

export const FIELD_META: Record<Field, FieldMeta> = {
  sea: {
    label: '海釣り',
    chartTitle: '潮位（推定）',
    factor3Label: '潮汐',
    flowChip: '潮',
    areaLabel: '周辺海域 半径 5km',
    extraLabel: 'WAVE',
    extraUnit: 'm',
    waterLabel: 'SEA T',
    waterBaseline: 24.8,
    idealWaterMin: 20,
    idealWaterMax: 26,
    phrases: [
      'まづめと潮の動きが重なる時間帯です。',
      '悪くはないものの、潮止まりに近く手数が必要です。',
      '風と潮の条件が噛み合わず、活性は低めの予測。',
    ],
  },
  lake: {
    label: '湖',
    chartTitle: '水位・風波（推定）',
    factor3Label: '水位',
    flowChip: '水位',
    areaLabel: '湖内 3エリア',
    extraLabel: '風波',
    extraUnit: 'm',
    waterLabel: '水温',
    waterBaseline: 22.4,
    idealWaterMin: 18,
    idealWaterMax: 24,
    phrases: [
      'まづめと風の吹き始めが重なる時間帯です。',
      '悪くはないものの、風が弱くレンジを刻む必要があります。',
      '風と水温の条件が噛み合わず、活性は低めの予測。',
    ],
  },
  river: {
    label: '川',
    chartTitle: '水位・流量（推定）',
    factor3Label: '流量',
    flowChip: '流れ',
    areaLabel: '中流域 8km 区間',
    extraLabel: '流量',
    extraUnit: 'm³/s',
    waterLabel: '水温',
    waterBaseline: 19.6,
    idealWaterMin: 14,
    idealWaterMax: 21,
    phrases: [
      'まづめと流れの効き方が噛み合う時間帯です。',
      '悪くはないものの、流れが緩くポイントを絞る必要があります。',
      '風と流量の条件が噛み合わず、活性は低めの予測。',
    ],
  },
};

export const FIELD_FLOW: Record<Field, { a: string; b: string }> = {
  sea: { a: '下げ', b: '上げ' },
  lake: { a: '安定', b: '安定' },
  river: { a: '平水', b: '平水' },
};

export const TAB_SHAPES: Record<string, [string, string, string, string]> = {
  home: ['13px', '13px', '4px', '0deg'],
  hours: ['15px', '15px', '50%', '0deg'],
  week: ['16px', '5px', '2px', '0deg'],
  fish: ['13px', '13px', '3px', '45deg'],
};
