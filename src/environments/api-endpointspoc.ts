export const baseUrl = 'https://api.dev.progrow.adaptiwise.com/v1/farmeronboarding';
export const leadUrl = `https://api.poc.progrow.adaptiwise.com/v1/leadmanagement/metadata/`;

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
  sendToMifin: '/send_to_mifin',
  checkMobile: '/check_mobile',
  checkPAN: '/check_pan',
  getAudit: '/get_audit',
  postAreaOfInterest: '/post_area_of_interest',
  getFilterMeta: '/uiformconstants',

  ekyc: {
    getKycData: '/kyc_check',
    getAadhaarEkycVerification: '/aadhaar_ekyc',
    getAadhaarDetails: '/aadhaar_ekyc2',
  },
};
