
import { AamvaData } from '../types';

/**
 * AAMVA Map based on the requested keys
 */
const AAMVA_MAP: Record<string, keyof AamvaData> = {
  'DCA': 'vehicleClass',
  'DCB': 'restrictionCode',
  'DCD': 'endorsementsCode',
  'DBA': 'expirationDate',
  'DCS': 'lastName',
  'DDE': 'familyNameTruncation',
  'DAC': 'firstName',
  'DDF': 'firstNameTruncation',
  'DAD': 'middleName',
  'DDG': 'middleNameTruncation',
  'DBD': 'issuedDate',
  'DBB': 'birthDate',
  'DBC': 'sex',
  'DAY': 'eyeColor',
  'DAU': 'height',
  'DAG': 'street_1',
  'DAI': 'city',
  'DAJ': 'jurisdictionCode',
  'DAK': 'postalCode',
  'DAQ': 'licenseNumber',
  'DCF': 'documentDiscriminator',
  'DCG': 'issuingCountry',
  'DAZ': 'hairColor',
  'DCK': 'inventoryControlNumber',
  'DCL': 'race',
  'DDA': 'complianceType',
  'DDB': 'cardRevisionDate',
  'DAW': 'weightInPounds',
  'DSH': 'organDonor'
};

const REV_MAP: Record<keyof AamvaData, string> = Object.fromEntries(
  Object.entries(AAMVA_MAP).map(([k, v]) => [v, k])
) as any;

export function parseAamva(raw: string): Partial<AamvaData> {
  const result: Partial<AamvaData> = {};
  
  // Basic split by newlines as often AAMVA segments are line-delimited or chunked
  const lines = raw.replace(/\r/g, '').split('\n');
  
  lines.forEach(line => {
    for (const [key, field] of Object.entries(AAMVA_MAP)) {
      if (line.includes(key)) {
        const value = line.split(key)[1]?.trim();
        if (value) (result as any)[field] = value;
      }
    }
  });

  return result;
}

export function buildAamvaString(data: AamvaData): string {
  // AAMVA Structure
  const header = '@\nANSI 636015090002DL00410268ZT03090007';
  
  const dlSegment = [
    `DL${REV_MAP.vehicleClass}${data.vehicleClass}`,
    `${REV_MAP.restrictionCode}${data.restrictionCode}`,
    `${REV_MAP.endorsementsCode}${data.endorsementsCode}`,
    `${REV_MAP.expirationDate}${data.expirationDate}`,
    `${REV_MAP.lastName}${data.lastName}`,
    `DDE${data.familyNameTruncation}`,
    `${REV_MAP.firstName}${data.firstName}`,
    `DDF${data.firstNameTruncation}`,
    `${REV_MAP.middleName}${data.middleName}`,
    `DDG${data.middleNameTruncation}`,
    `${REV_MAP.issuedDate}${data.issuedDate}`,
    `${REV_MAP.birthDate}${data.birthDate}`,
    `${REV_MAP.sex}${data.sex === 'male' ? '1' : data.sex === 'female' ? '2' : data.sex}`,
    `${REV_MAP.eyeColor}${data.eyeColor}`,
    `${REV_MAP.height}${data.height}`,
    `${REV_MAP.street_1}${data.street_1}`,
    `${REV_MAP.city}${data.city}`,
    `${REV_MAP.jurisdictionCode}${data.jurisdictionCode.substring(0,2).toUpperCase()}`,
    `${REV_MAP.postalCode}${data.postalCode}`,
    `${REV_MAP.licenseNumber}${data.licenseNumber}`,
    `${REV_MAP.documentDiscriminator}${data.documentDiscriminator}`,
    `${REV_MAP.issuingCountry}${data.issuingCountry}`,
    `${REV_MAP.hairColor}${data.hairColor}`,
    `${REV_MAP.inventoryControlNumber}${data.inventoryControlNumber}`,
    `${REV_MAP.race}${data.race}`,
    `${REV_MAP.complianceType}${data.complianceType}`,
    `${REV_MAP.cardRevisionDate}${data.cardRevisionDate}`,
    `${REV_MAP.weightInPounds}${data.weightInPounds}`,
    `${REV_MAP.organDonor}${data.organDonor}`,
  ].join('\n');

  return `${header}\n${dlSegment}`;
}
