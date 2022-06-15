CREATE TABLE frcm_app.farmar_demographic(
	farmer_id varchar(100)  PRIMARY KEY NOT NULL,
	first_name varchar(100) NOT NULL,
	middle_name varchar(100),
	last_name varchar(100),
	date_of_birth date,
	gender varchar(100) NOT NULL,
	religion varchar(100),
	caste varchar(100),
	education varchar(1000),
	occupation varchar(1000),
	fpold varchar(1000), -- not clear
	pan_proof_id varchar(100),
	asset_info_id varchar(100),
	family_id varchar(100),
	profile_photo_id varchar(100)	
);


CREATE TABLE frcm_app.pan_proof(
	pan_proof_id varchar(100)  PRIMARY KEY NOT NULL,
	pan_card_image varchar(1000),
	pan_card_number varchar(100) UNIQUE NOT NULL,
	pan_card_kyc_report varchar(1000)
);


CREATE TABLE frcm_app.property_info(
	property_id varchar(100)  PRIMARY KEY NOT NULL,
	asset_info_id varchar(1000) UNIQUE NOT NULL,
	property_type_id varchar(100) NOT NULL,
	picture varchar(1000),
	ownership_type varchar(100),
	particular varchar(100),
	cumulative_value varchar(100)
);

CREATE TABLE frcm_app.property_type(
	property_id varchar(100)  PRIMARY KEY NOT NULL,
	asset_info_id varchar(1000) UNIQUE NOT NULL,
	property_type_id varchar(100) NOT NULL,
	picture varchar(1000),
	ownership_type varchar(100),
	particular varchar(100),
	cumulative_value varchar(100)
);

CREATE TABLE frcm_app.address_proof(
	address_proof_id varchar(100)  PRIMARY KEY NOT NULL,
	address_type varchar(1000) UNIQUE NOT NULL,
	front_image varchar(100) NOT NULL,
	back_image varchar(1000),
	ekyc_status varchar(100),
	ekyc_data varchar(100),
	farmer_id varchar(100) NOT NULL
);


CREATE TABLE frcm_app.family_member(
	person_id varchar(100)  PRIMARY KEY NOT NULL,
	person_name varchar(500) NOT NULL,
	relation varchar(100) NOT NULL,
	education varchar(500),
	occupation varchar(500),
	dependency varchar(100),
	farmer_id varchar(100) NOT NULL
);

CREATE TABLE frcm_app.information_declaration(
	declaration_id varchar(100)  PRIMARY KEY NOT NULL,
	signature_path varchar(500) NOT NULL,
	farmer_id varchar(100) NOT NULL
);

CREATE TABLE frcm_app.crop_info(
	crop_id varchar(100)  PRIMARY KEY NOT NULL,
	crop_name varchar(500) NOT NULL
);

CREATE TABLE frcm_app.output_users(
	output_user_id varchar(100)  PRIMARY KEY NOT NULL,
	crop_id varchar(500) NOT NULL,
	crop_session_id varchar(100),
	seed_replacement_percentage varchar(20),
	self_consumption_percentage varchar(20),
	selling_at_market_place_percentage varchar(20)
	
);

CREATE TABLE frcm_app.crop_cycle_season(
	crop_season_id varchar(100)  PRIMARY KEY NOT NULL,
	season_name varchar(500) NOT NULL,
	season_year varchar(10) NOT NULL
);


CREATE TABLE frcm_app.field_clusters(
	field_cluster_id varchar(100)  PRIMARY KEY NOT NULL,
	cluster_name varchar(500) NOT NULL,
	cluster_boundary varchar(500) NOT NULL,
	cluster_area varchar(100) NOT NULL,
	cluster_address varchar(1000) NOT NULL,
	land_survey_number varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL
	
);


CREATE TABLE frcm_app.field_info(
	field_id varchar(100)  PRIMARY KEY NOT NULL,
	field_cluster_id varchar(500) NOT NULL,
	field_boundary varchar(500) NOT NULL,
	field_area varchar(100) NOT NULL,
	field_address varchar(1000) NOT NULL,
	bore_depth varchar(100) NOT NULL,
	pump_depth varchar(100) NOT NULL,
	expected_produce varchar(100) NOT NULL,
	perceived_soil_quality varchar(100) NOT NULL,
	comment_on_soil_quality varchar(1000) NOT NULL,
	perceived_water_quality varchar(100) NOT NULL,
	comment_on_water_quality varchar(1000) NOT NULL,
	perceived_yield_quality varchar(100) NOT NULL,
	comment_on_yield_quality varchar(1000) NOT NULL
);


CREATE TABLE frcm_app.soil_info(
	soil_test_id varchar(100)  PRIMARY KEY NOT NULL,
	field_id varchar(500) NOT NULL,
	date_of_report varchar(500) NOT NULL,
	report_pdf varchar(100) NOT NULL,
	soil_type varchar(1000) NOT NULL,
	location_info varchar(100) NOT NULL,
	par1 varchar(100) NOT NULL,
	par2 varchar(100) NOT NULL,
	par3 varchar(100) NOT NULL,
	par4 varchar(1000) NOT NULL,
	created_datetime timestamp NOT NULL
);



CREATE TABLE frcm_app.irrigation_source(
	irrigation_source_id varchar(100)  PRIMARY KEY NOT NULL,
	field_id varchar(500) NOT NULL,
	source_type_name varchar(500) NOT NULL,
	source_descrption varchar(100) NOT NULL,
	location_info varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL
);


CREATE TABLE frcm_app.water_source(
	water_source_id varchar(100)  PRIMARY KEY NOT NULL,
	field_id varchar(500) NOT NULL,
	source_type_name varchar(500) NOT NULL,
	source_descrption varchar(100) NOT NULL,
	location_info varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL
);


CREATE TABLE frcm_app.water_info(
	water_test_id varchar(100)  PRIMARY KEY NOT NULL,
	water_source_id varchar(500) NOT NULL,
	report varchar(500) NOT NULL,
	source_descrption varchar(100) NOT NULL,
	par1 varchar(100) NOT NULL,
	par2 varchar(100) NOT NULL,
	par3 varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL
);


CREATE TABLE frcm_app.bank_details(
	bank_details_id varchar(100)  PRIMARY KEY NOT NULL,
	bank_name varchar(500) NOT NULL,
	account_number varchar(500) NOT NULL,
	ifsc_code varchar(100) NOT NULL,
	customer_id varchar(100) NOT NULL,
	branch_name varchar(100) NOT NULL,
	farmer_id varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL
);


CREATE TABLE frcm_app.loan_product(
	loan_product_id varchar(100)  PRIMARY KEY NOT NULL,
	product_type varchar(500) NOT NULL,
	product_name varchar(500) NOT NULL,
	product_description varchar(100) NOT NULL,
	rate_of_interest varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL
);


CREATE TABLE frcm_app.loan_requirement(
	loan_requirement_id varchar(100)  PRIMARY KEY NOT NULL,
	field_id varchar(500) NOT NULL,
	loan_product_id varchar(500) NOT NULL,
	planned_cultivation_area varchar(100) NOT NULL,
	loan_amount_wanted varchar(100) NOT NULL,
	crop varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL
);


CREATE TABLE frcm_app.crop_sold_at(
	crop_selling_location_id varchar(100)  PRIMARY KEY NOT NULL,
	type_of_location varchar(500) NOT NULL,
	location_info varchar(500) NOT NULL,
	created_datetime timestamp NOT NULL
);



CREATE TABLE frcm_app.cultivation_expenses(
	cultivation_expense_id varchar(100)  PRIMARY KEY NOT NULL,
	crop_season_id varchar(500) NOT NULL,
	total_expense_id varchar(500) NOT NULL
);


CREATE TABLE frcm_app.cultivation_expense_items(
	item_id varchar(100)  PRIMARY KEY NOT NULL,
	item_name varchar(500) NOT NULL,
	expense_value varchar(500) NOT NULL,
	cultivation_expense_id varchar(500) NOT NULL
);

CREATE TABLE frcm_app.crop_selling_info(
	crop_selling_info_id varchar(100)  PRIMARY KEY NOT NULL,
	crop_season_id varchar(500) NOT NULL,
	crop_id varchar(500) NOT NULL,
	crop_selling_location_id varchar(500) NOT NULL,
	quantity_sold varchar(500) NOT NULL,
	selling_price varchar(500) NOT NULL,
	selling_date varchar(500) NOT NULL
);


CREATE TABLE frcm_app.total_expenses(
	total_expense_id varchar(100)  PRIMARY KEY NOT NULL,
	farmer_id varchar(500) NOT NULL
);



CREATE TABLE frcm_app.monthly_expenses(
	item_id varchar(100)  PRIMARY KEY NOT NULL,
	item_name varchar(500) NOT NULL,
	expense_value varchar(500) NOT NULL,
	total_expense_id varchar(500) NOT NULL
);


CREATE TABLE frcm_app.kcc_info(
	kcc_info_id varchar(100)  PRIMARY KEY NOT NULL,
	bank_id varchar(500) NOT NULL,
	credit_amount varchar(500) NOT NULL,
	date_of_disbursement varchar(500) NOT NULL,
	repayment_amount varchar(500) NOT NULL,
	repayment_date varchar(500) NOT NULL,
	size_of_land varchar(500) NOT NULL
);


CREATE TABLE frcm_app.other_liability(
	liability_id varchar(100)  PRIMARY KEY NOT NULL,
	bank_id varchar(500) NOT NULL,
	credit_amount varchar(500) NOT NULL,
	date_of_disbursement varchar(500) NOT NULL,
	repayment_amount varchar(500) NOT NULL,
	repayment_date varchar(500) NOT NULL
);


CREATE TABLE frcm_app.bank_info(
	bank_id varchar(100)  PRIMARY KEY NOT NULL,
	bank_name varchar(500) NOT NULL,
	bank_description varchar(500) NOT NULL
);


CREATE TABLE frcm_app.pmfby_info(
	pmfby_id varchar(100)  PRIMARY KEY NOT NULL,
	amount_paid varchar(500) NOT NULL,
	date_of_repayment varchar(500) NOT NULL
);


CREATE TABLE frcm_app.other_insurance_info(
	insurance_id varchar(100)  PRIMARY KEY NOT NULL,
	insurance_type_id varchar(500) NOT NULL,
	month_year_last_taken varchar(500) NOT NULL,
	premium_paid varchar(500) NOT NULL,
	settlement_amount_status varchar(500) NOT NULL,
	sanctification_with_disbursement varchar(500) NOT NULL
);


CREATE TABLE frcm_app.insurance_type(
	insurance_type_id varchar(100)  PRIMARY KEY NOT NULL,
	insurance_typ_name varchar(500) NOT NULL
);


CREATE TABLE frcm_app.self_employ_data(
	it_status_type_id varchar(100)  PRIMARY KEY NOT NULL,
	number_of_business_in_year varchar(500) NOT NULL,
	tan varchar(500) NOT NULL,
	monthly_income varchar(500) NOT NULL,
	date_of_incorporation varchar(500) NOT NULL,
	latest_anual_turnover varchar(500) NOT NULL,
	financial_year varchar(500) NOT NULL
);



CREATE TABLE frcm_app.salaried_employ_data(
	type_of_company varchar(100)  PRIMARY KEY NOT NULL,
	number_of_year_in_current_job varchar(500) NOT NULL,
	previous_company_name varchar(500) NOT NULL,
	gross_monthly_income varchar(500) NOT NULL,
	designation varchar(500) NOT NULL,
	department varchar(500) NOT NULL
);

CREATE TABLE frcm_app.company_info(
	company_id varchar(100)  PRIMARY KEY NOT NULL,
	company_name varchar(500) NOT NULL,
	detail_one varchar(500) NOT NULL,
	detail_two varchar(500) NOT NULL,
	description varchar(500) NOT NULL
);



CREATE TABLE frcm_app.company_loan_product(
	loan_product_id varchar(100)  PRIMARY KEY NOT NULL,
	company_id varchar(500) NOT NULL,
	product_type varchar(500) NOT NULL,
	product_name varchar(500) NOT NULL,
	description varchar(500) NOT NULL,
	rateof_interest varchar(500) NOT NULL
);


CREATE TABLE frcm_app.survey_info(
	survey_id varchar(100)  PRIMARY KEY NOT NULL,
	title varchar(500) NOT NULL,
	description varchar(500) NOT NULL
);

CREATE TABLE frcm_app.responder_info(
	responder_id varchar(100)  PRIMARY KEY NOT NULL,
	farmer_id varchar(500) NOT NULL,
	survey_id varchar(500) NOT NULL
);

CREATE TABLE frcm_app.question_info(
	question_id varchar(100)  PRIMARY KEY NOT NULL,
	question_type_id varchar(500) NOT NULL,
	question_text varchar(500) NOT NULL,
	survey_id varchar(500) NOT NULL
);

CREATE TABLE frcm_app.answer_info(
	answer_id varchar(100)  PRIMARY KEY NOT NULL,
	answer_text varchar(500) NOT NULL,
	question_id varchar(500) NOT NULL
);

CREATE TABLE frcm_app.question_type_info(
	question_type_id varchar(100)  PRIMARY KEY NOT NULL,
	answer_type varchar(500) NOT NULL,
	description varchar(500) NOT NULL
);

CREATE TABLE frcm_app.response_data(
	response_id varchar(100)  PRIMARY KEY NOT NULL,
	question_id varchar(500) NOT NULL,
	answer_id varchar(500) NOT NULL,
	rank_order varchar(500) NOT NULL,
	response_comment varchar(500) NOT NULL,
	responder_id varchar(500) NOT NULL,
	created_datetime timestamp
);



-- OTHER PART

CREATE TABLE frcm_app.user_data(
	user_id varchar(100)  PRIMARY KEY NOT NULL,
	branch_id varchar(500) NOT NULL,
	user_role_id varchar(500) NOT NULL,
	hashed_password varchar(500) NOT NULL,
	first_name varchar(500) NOT NULL,
	pincode varchar(500) NOT NULL,
	user_address varchar(500) NOT NULL,
	email_id varchar(500) NOT NULL,
	created_datetime timestamp
);



CREATE TABLE frcm_app.user_role_info(
	user_role_id varchar(100)  PRIMARY KEY NOT NULL,
	user_role_name varchar(500) NOT NULL,
	user_permission_type varchar(500) NOT NULL,
	created_datetime timestamp
);



CREATE TABLE frcm_app.branch_info(
	branch_id varchar(100)  PRIMARY KEY NOT NULL,
	branch_name varchar(500) NOT NULL,
	village_id varchar(500) NOT NULL,
	district_id varchar(500) NOT NULL,
	state_id varchar(500) NOT NULL,
	country_id varchar(500) NOT NULL,
	created_datetime timestamp
);


CREATE TABLE frcm_app.session_data(
	session_id varchar(100)  PRIMARY KEY NOT NULL,
	start_datetime timestamp,
	starte_location varchar(500) NOT NULL,
	location_track varchar(500) NOT NULL,
	field_location_distance varchar(500) NOT NULL,
	created_datetime timestamp
);


CREATE TABLE frcm_app.fpo_data(
	fpo_id varchar(100)  PRIMARY KEY NOT NULL,
	fpo_name varchar(500) NOT NULL,
	fpo_address varchar(500) NOT NULL,
	fpo_reg_number varchar(500) NOT NULL,
	contact_person_name varchar(500) NOT NULL,
	contact_person_number varchar(500) NOT NULL,
	contact_person_email varchar(500) NOT NULL,
	asset_type varchar(500) NOT NULL,
	asset_name varchar(500) NOT NULL,
	created_datetime timestamp
);


-- INFO--to store meta data
-- DATA -- to store dynamic data- form data


