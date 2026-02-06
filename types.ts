
export interface AamvaData {
  vehicleClass: string;
  restrictionCode: string;
  endorsementsCode: string;
  expirationDate: string; // MMDDYYYY
  lastName: string;
  familyNameTruncation: string;
  firstName: string;
  firstNameTruncation: string;
  middleName: string;
  middleNameTruncation: string;
  issuedDate: string; // MMDDYYYY
  birthDate: string; // MMDDYYYY
  sex: string; // 1=Male, 2=Female
  eyeColor: string;
  height: string;
  street_1: string;
  city: string;
  jurisdictionCode: string; // e.g. TX
  postalCode: string;
  licenseNumber: string;
  documentDiscriminator: string;
  issuingCountry: string;
  hairColor: string;
  inventoryControlNumber: string;
  race: string;
  complianceType: string;
  cardRevisionDate: string;
  weightInPounds: string;
  organDonor: string; // Y or N
}

export const DEFAULT_AAMVA_DATA: AamvaData = {
  vehicleClass: 'C',
  restrictionCode: 'NONE',
  endorsementsCode: 'NONE',
  expirationDate: '03152029',
  lastName: 'POWERS',
  familyNameTruncation: 'N',
  firstName: 'MICHAEL',
  firstNameTruncation: 'N',
  middleName: 'ROY',
  middleNameTruncation: 'N',
  issuedDate: '10302023',
  birthDate: '03151983',
  sex: 'male',
  eyeColor: 'BRO',
  height: '082 in',
  street_1: '2259 ADA LN',
  city: 'ROUND ROCK',
  jurisdictionCode: 'Texas',
  postalCode: '786640000',
  licenseNumber: '03625157',
  documentDiscriminator: '46105746063515018056',
  issuingCountry: 'USA',
  hairColor: 'BRO',
  inventoryControlNumber: '10007098064',
  race: 'W',
  complianceType: 'F',
  cardRevisionDate: '07162021',
  weightInPounds: '167',
  organDonor: 'Y'
};

export type BarcodeType = 'PDF417' | 'CODE128' | 'CODE39' | 'EAN13';

export interface ScanResult {
  format: string;
  raw: string;
  parsed?: Partial<AamvaData>;
}
