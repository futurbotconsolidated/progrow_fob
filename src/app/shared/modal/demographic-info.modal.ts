export interface DemographicInfo {
  profileImg: string;
  identityProof: IdentityProof;
  addressProof: AddressProof;
  farmerDetails: FarmerDetails;
  address: Address;
  otherDetails: OtherDetails;
  familyMembers: FamilyMembers[];
  propertyOwnership: PropertyOwnership[];
  phoneType: string;
  phoneUsedBy: string;
  cultivationAdvice: CultivationAdvice[];
  adviceMedium: AdviceMedium;
  sourceOfIncome: SourceOfIncome;
  agricultureChildrenInterested: AgricultureChildrenInterested;
  innovativeFarmingWays: InnovativeFarmingWays;
}

export interface IdentityProof {
  panNumber: string;
  panImg: string;
}

export interface AddressProof {
  selectedIdProof: string;
  selectedIdProofFrontImg: string;
  selectedIdProofBackImg: string;
}

export interface FarmerDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: Date;
}

export interface Address {
  addressLine1: string;
  addressLine2: string;
  pinCode: string;
  mobileNumber: string;
}

export interface OtherDetails {
  educationalQualification: string;
  occupation: string;
  fpoName: string;
}

export interface FamilyMembers {
  memberName: string;
  relation: string;
  education: string;
  occupation: string;
  dependency: string;
}

export interface PropertyOwnership {
  propertyType: string;
  propertyImg: string;
  ownershipType: string;
  particular: string;
  cumulativeValue: string;
}

export interface AdviceMedium {
  sms: number;
  whatsApp: number;
  telephoneCall: number;
  physicalVisits: number;
  others: string;
}

export interface SourceOfIncome {
  shop: number;
  govt_service: number;
  pvtServiceOrSelfEmployed: number;
  rentingHeavyFarmMachineryOrEquipment: number;
  dairyIncome: number;
  others: string;
}

export interface AgricultureChildrenInterested {
  veryMuch: number;
  interested: number;
  mayBe: number;
  notInterested: number;
}

export interface InnovativeFarmingWays {
  drip: number;
  mulch: number;
  solarPump: number;
  waterSolubleFertilizers: number;
  iotOrDrone: number;
  weatherUpdates: number;
  sops: number;
}

export interface CultivationAdvice {
  neighbouringFarmerOrFamily: number;
  companyDoctor: number;
  tv_Program: number;
  kvk: number;
  youtube: number;
  facebook: number;
  others: string;
}
