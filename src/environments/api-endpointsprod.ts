// OLD : export const baseUrl = 'https://fobapi.agrisaathi.com';
export const baseUrl = 'https://api1.agrisaathi.com/v1/farmeronboarding';

export const endPoints = {
  getAllFarmers: '/get_all_farmers',
  registerFarmer: '/register_farmer',
  updateFarmer: '/update_farmer',
  getFarmer: '/get_farmer',
  documentUpload: '/document_upload',
  getDocument: '/farmer_presigned_s3_url',
  downloadCsv: '/download_csv',

  ekyc: {
    getKycData: '/kyc_check',
    getAadhaarEkycVerification: '/aadhaar_ekyc',
    getAadhaarDetails: '/aadhaar_ekyc2',
  },
};
