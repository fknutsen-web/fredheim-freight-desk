// Maps a website Commercial Assessment payload to the Client Intake fields of the
// Pelorus Commercial Opportunity Assessment Engine (Excel). Labels match the Engine's
// "Lists" tab verbatim so every value passes data-validation on paste. No secrets here.
const ENG = { desk: 'Commercial Freight Desk', program: 'Freight Program Management', advisory: 'Strategic Supply Chain Advisory' };
const CARGO = { bulk: 'Bulk', breakbulk: 'Breakbulk', project: 'Project Cargo', general: 'General Cargo' };
const MODES = { ocean: 'Ocean Freight', barge: 'Barge', rail: 'Rail', road: 'Road', terminal: 'Terminal', storage: 'Storage' };
const VOL = { 'lt25k': 'Less than 25,000 MT', '25-100k': '25,000 - 100,000 MT', '100-500k': '100,000 - 500,000 MT', '500k-1m': '500,000 - 1 million MT', '1-5m': '1 - 5 million MT', '5m+': '5 million+ MT' };
const GEO = { domestic: 'Domestic', 'north-america': 'North America', international: 'International', worldwide: 'Worldwide' };
const SVC = { procurement: 'Freight Procurement', chartering: 'Vessel Chartering', coa: 'COA Development & Management', market: 'Market Intelligence', benchmark: 'Freight Benchmarking', tender: 'Tender Management', 'terminal-neg': 'Terminal Negotiations', 'storage-strat': 'Storage Strategy', 'rail-coord': 'Rail Coordination', 'barge-coord': 'Barge Coordination', 'project-plan': 'Project Cargo Planning', optimization: 'Supply Chain Optimization', representation: 'Commercial Representation', reporting: 'Performance Reporting' };
const mapList = (arr, m) => (Array.isArray(arr) ? arr : []).map((k) => m[k] || k).join(', ');

// Returns the eight "from website" Client Intake fields, in Engine row order (B9:B16),
// plus a paste-ready block (newline-separated) that drops straight into Client Intake!B9.
export function toEngineIntake(config = {}, assessment = {}) {
  const recLabel = assessment.recommendationLabel || ENG[assessment.recommendation] || ENG[config.engagement] || '';
  const fields = {
    recommendedEngagement: recLabel,
    engagementOfInterest: ENG[config.engagement] || recLabel || '',
    cargoTypes: mapList(config.cargo, CARGO),
    transportationModes: mapList(config.modes, MODES),
    annualVolumeBand: VOL[config.volume] || config.volume || '',
    commercialServices: mapList(config.services, SVC),
    geographicScope: GEO[config.geo] || config.geo || '',
    commercialComplexity: assessment.complexity || '',
  };
  const pasteBlock = [
    fields.recommendedEngagement, fields.engagementOfInterest, fields.cargoTypes,
    fields.transportationModes, fields.annualVolumeBand, fields.commercialServices,
    fields.geographicScope, fields.commercialComplexity,
  ].join('\n');
  return { targetCell: 'Client Intake!B9', fields, pasteBlock };
}
