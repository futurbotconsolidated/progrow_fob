export const baseUrl = 'https://fobapi.agrisaathi.com';

export const endPoints = {
  getAllFarmers: '/get_all_farmers',
  registerFarmer: '/register_farmer',
  updateFarmer: '/update_farmer',
  getFarmer: '/get_farmer',
  documentUpload: '/document_upload',
  getDocument: '/farmer_presigned_s3_url',
  downloadCsv: '/download_csv',
  pinCodeData: '/get_pincode_data',
  masterData: '/master_data',  
  
  ekyc: {
    getKycData: '/kyc_check',
    getAadhaarEkycVerification: '/aadhaar_ekyc',
    getAadhaarDetails: '/aadhaar_ekyc2',
  },
};
