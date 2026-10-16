export const media = (path) => {
  if (!path) return '';

  if (/^https?:\/\//i.test(path)) return path;
  console.log(`${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`);
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
};
export const localized = (item, field, lang) => item?.[`${field}_${lang}`] || item?.[`${field}_en`] || '';
export const sortCards = cards => [...cards].sort((a,b) => (a.scenario_number ?? a.id) - (b.scenario_number ?? b.id));
export const getCategory = (cards, category) => sortCards(cards.filter(card => card.category === category));
export const answerValue = answer => String(answer?.value || answer?.title_en || '').trim().toLowerCase();
export const isYes = answer => ['yes','true'].includes(answerValue(answer));
export const roleIsParent = answer => ['parent_or_guardian','parent','guardian'].includes(answerValue(answer));
export const isGraded = answer => typeof answer?.correct === 'boolean';
export const ui = (group,key,lang,fallback='') => importConfig[group]?.[`${key}_${lang}`] || fallback;
import importConfig from './data/appData.json';
