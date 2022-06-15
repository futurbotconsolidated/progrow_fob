
CREATE TABLE frcm_app.question_response_data(
	response_id varchar(100)  NOT NULL,
	question_id varchar(500) NOT NULL,
	answer_id varchar(500) NOT NULL,
	rank_order varchar(10) NOT NULL,
	response_comment varchar(500),
	farmer_id varchar(100) NOT NULL,
	created_datetime timestamp,
	PRIMARY KEY(response_id),
	FOREIGN KEY (question_id) REFERENCES frcm_app.question_info(question_id),
	FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id),
	UNIQUE(question_id,farmer_id)
);


-- ========================================================================








-- FARMER
CREATE TABLE frcm_app.crop_cycle_season_info(
	crop_season_id varchar(100) NOT NULL,
	season_name varchar(500) NOT NULL,
	season_year varchar(10) NOT NULL,
	PRIMARY KEY(crop_season_id)
);


CREATE TABLE frcm_app.crop_info(
	crop_id varchar(100) NOT NULL,
	crop_name varchar(500) NOT NULL,
	PRIMARY KEY(crop_id)
);



CREATE TABLE frcm_app.field_clusters_data(
	field_cluster_id varchar(100) NOT NULL,
	cluster_name varchar(500) NOT NULL,
	cluster_boundary varchar(500) NOT NULL,
	cluster_area varchar(100) NOT NULL,
	cluster_address varchar(1000) NOT NULL,
	land_survey_number varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL,
	PRIMARY KEY(field_cluster_id)
);



CREATE TABLE frcm_app.field_data(
	field_id varchar(100) NOT NULL,
	field_cluster_id varchar(100) NOT NULL,
	field_boundary varchar(100) NOT NULL,
	field_area varchar(100) NOT NULL,
	field_address varchar(1000) NOT NULL,
	bore_depth varchar(100),
	pump_depth varchar(100),
	expected_produce varchar(100),
	perceived_soil_quality varchar(100),
	comment_on_soil_quality varchar(100),
	perceived_water_quality varchar(100),
	comment_on_water_quality varchar(1000),
	perceived_yield_quality varchar(100),
	comment_on_yield_quality varchar(1000),
	PRIMARY KEY(field_id),
	FOREIGN KEY (field_cluster_id) REFERENCES frcm_app.field_clusters_data(field_cluster_id)
);


CREATE TABLE frcm_app.water_source_data(
	water_source_id varchar(100) NOT NULL,
	field_id varchar(500) NOT NULL,
	source_type_name varchar(500) NOT NULL,
	source_descrption varchar(1000),
	location_info varchar(1000),
	created_datetime timestamp NOT NULL,
	PRIMARY KEY(water_source_id),
	FOREIGN KEY (field_id) REFERENCES frcm_app.field_data(field_id)
);





CREATE TABLE frcm_app.water_test_data(
	water_test_id varchar(100) NOT NULL,
	water_source_id varchar(100) NOT NULL,
	report varchar(1000),
	source_descrption varchar(1000),
	par1 varchar(1000),
	par2 varchar(1000),
	par3 varchar(1000),
	created_datetime timestamp NOT NULL,
	PRIMARY KEY(water_test_id),
	FOREIGN KEY (water_source_id) REFERENCES frcm_app.water_source_data(water_source_id)
);



CREATE TABLE frcm_app.irrigation_source_data(
	irrigation_source_id varchar(100)  PRIMARY KEY NOT NULL,
	field_id varchar(100) NOT NULL,
	source_type_name varchar(500) NOT NULL,
	source_descrption varchar(1000),
	location_info varchar(1000),
	created_datetime timestamp NOT NULL,
	PRIMARY KEY(irrigation_source_id),
	FOREIGN KEY (field_id) REFERENCES frcm_app.field_data(field_id)
);


CREATE TABLE frcm_app.soil_test_data(
	soil_test_id varchar(100) NOT NULL,
	field_id varchar(100) NOT NULL,
	date_of_report date,
	report_pdf varchar(1000),
	soil_type varchar(100),
	location_info varchar(1000),
	par1 varchar(1000),
	par2 varchar(1000),
	par3 varchar(1000),
	par4 varchar(1000),
	created_datetime timestamp NOT NULL,
	PRIMARY KEY(soil_test_id),
	FOREIGN KEY (field_id) REFERENCES frcm_app.field_data(field_id)
);



CREATE TABLE frcm_app.output_users_data(
	output_user_id varchar(100) NOT NULL,
	crop_id varchar(500) NOT NULL,
	crop_season_id varchar(100),
	seed_replacement_percentage varchar(20),
	self_consumption_percentage varchar(20),
	selling_at_market_place_percentage varchar(20),
	PRIMARY KEY(output_user_id),
	FOREIGN KEY (crop_id) REFERENCES frcm_app.crop_info(crop_id),
	FOREIGN KEY (crop_season_id) REFERENCES frcm_app.crop_cycle_season_info(crop_season_id)
);




CREATE TABLE frcm_app.property_type_info(
	property_type_id varchar(100) NOT NULL,
	property_type_name varchar(100) UNIQUE NOT NULL,
	PRIMARY KEY(property_type_id)
);




CREATE TABLE frcm_app.property_data(
	property_id varchar(100) NOT NULL,
	asset_info_id varchar(1000) NOT NULL,
	property_type_id varchar(100) NOT NULL,
	picture varchar(1000),
	ownership_type varchar(100),
	particular varchar(100),
	cumulative_value varchar(100),
	PRIMARY KEY(property_id),
	FOREIGN KEY (property_type_id) REFERENCES frcm_app.property_type_info(property_type_id)
);


CREATE TABLE frcm_app.loan_product_info(
	loan_product_id varchar(100) NOT NULL,
	product_type varchar(500) NOT NULL,
	product_name varchar(500) NOT NULL,
	product_description varchar(1000),
	rate_of_interest varchar(100),
	PRIMARY KEY(loan_product_id)
);

CREATE TABLE frcm_app.loan_requirement_data(
	loan_requirement_id varchar(100) NOT NULL,
	field_id varchar(500) NOT NULL,
	loan_product_id varchar(500) NOT NULL,
	planned_cultivation_area varchar(100) NOT NULL,
	loan_amount_wanted varchar(100) NOT NULL,
	crop varchar(100) NOT NULL,
	PRIMARY KEY(loan_requirement_id),
	FOREIGN KEY (loan_product_id) REFERENCES frcm_app.loan_product_info(loan_product_id)
);



CREATE TABLE frcm_app.crop_sold_location_data(
	crop_selling_location_id varchar(100) NOT NULL,
	type_of_location varchar(500) NOT NULL,
	location_info varchar(500) NOT NULL,
	PRIMARY KEY(crop_selling_location_id)
);


CREATE TABLE frcm_app.bank_info(
	bank_id varchar(100) NOT NULL,
	bank_name varchar(500) NOT NULL,
	bank_description varchar(1000),
	PRIMARY KEY(bank_id)
);


CREATE TABLE frcm_app.crop_selling_data(
	crop_selling_info_id varchar(100) NOT NULL,
	crop_season_id varchar(100) NOT NULL,
	crop_id varchar(100) NOT NULL,
	crop_selling_location_id varchar(100) NOT NULL,
	quantity_sold varchar(500) NOT NULL,
	selling_price varchar(500) NOT NULL,
	selling_date date NOT NULL,
	PRIMARY KEY(crop_selling_info_id),
	FOREIGN KEY (crop_season_id) REFERENCES frcm_app.crop_cycle_season_info(crop_season_id),
	FOREIGN KEY (crop_id) REFERENCES frcm_app.crop_info(crop_id),
	FOREIGN KEY (crop_selling_location_id) REFERENCES frcm_app.crop_sold_location_data(crop_selling_location_id)
);


CREATE TABLE frcm_app.kcc_info(
	kcc_info_id varchar(100) NOT NULL,
	bank_id varchar(100) NOT NULL,
	credit_amount varchar(20) NOT NULL,
	date_of_disbursement date NOT NULL,
	repayment_amount varchar(20),
	repayment_date date,
	size_of_land varchar(100) NOT NULL,
	PRIMARY KEY(kcc_info_id),
	FOREIGN KEY (bank_id) REFERENCES frcm_app.bank_info(bank_id)
);



CREATE TABLE frcm_app.other_liability_info(
	liability_id varchar(100) NOT NULL,
	bank_id varchar(100) NOT NULL,
	credit_amount varchar(20) NOT NULL,
	date_of_disbursement date NOT NULL,
	repayment_amount varchar(20),
	repayment_date date,
	PRIMARY KEY(liability_id),
	FOREIGN KEY (bank_id) REFERENCES frcm_app.bank_info(bank_id)
);


CREATE TABLE frcm_app.pmfby_info(
	pmfby_id varchar(100) NOT NULL,
	amount_paid varchar(20) NOT NULL,
	date_of_repayment date NOT NULL,
	PRIMARY KEY(pmfby_id)
);


CREATE TABLE frcm_app.insurance_type_info(
	insurance_type_id varchar(100) NOT NULL,
	insurance_typ_name varchar(500) UNIQUE NOT NULL,
	PRIMARY KEY(insurance_type_id)
);


CREATE TABLE frcm_app.other_insurance_info(
	insurance_id varchar(100) NOT NULL,
	insurance_type_id varchar(100) NOT NULL,
	month_year_last_taken varchar(10) NOT NULL,
	premium_paid varchar(200) NOT NULL,
	settlement_amount_status varchar(100) NOT NULL,
	sanctification_with_disbursement varchar(100) NOT NULL,
	PRIMARY KEY(insurance_id),
	FOREIGN KEY (insurance_type_id) REFERENCES frcm_app.insurance_type_info(insurance_type_id)
);



CREATE TABLE frcm_app.self_employ_data(
	it_status_type_id varchar(100) NOT NULL,
	number_of_business_in_year varchar(10) NOT NULL,
	tan varchar(100) NOT NULL,
	monthly_income varchar(220) NOT NULL,
	date_of_incorporation date NOT NULL,
	latest_anual_turnover varchar(20) NOT NULL,
	financial_year varchar(10) NOT NULL,
	PRIMARY KEY(it_status_type_id)
);



CREATE TABLE frcm_app.salaried_employ_data(
	type_of_company varchar(100) NOT NULL,
	number_of_year_in_current_job varchar(10) NOT NULL,
	previous_company_name varchar(500) NOT NULL,
	gross_monthly_income varchar(20) NOT NULL,
	designation varchar(500) NOT NULL,
	department varchar(500) NOT NULL
);






CREATE TABLE frcm_app.fpo_data(
	fpo_id varchar(100) NOT NULL,
	fpo_name varchar(500) NOT NULL,
	fpo_address varchar(500) NOT NULL,
	fpo_reg_number varchar(100) NOT NULL,
	contact_person_name varchar(500) NOT NULL,
	contact_person_number varchar(50) NOT NULL,
	contact_person_email varchar(500) NOT NULL,
	asset_type varchar(500) NOT NULL,
	asset_name varchar(500) NOT NULL,
	created_datetime timestamp,
	PRIMARY KEY(fpo_id)
);




CREATE TABLE frcm_app.farmer_family(
	person_id varchar(100) NOT NULL,
	person_name varchar(500) NOT NULL,
	relation_id varchar(100) NOT NULL,
	education varchar(500),
	occupation varchar(500),
	dependency varchar(100),
	farmer_id varchar(100) NOT NULL,
	PRIMARY KEY(person_id),
	FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);


CREATE TABLE frcm_app.farmer_address(
	address_id varchar(100) NOT NULL,
	address_line_one varchar(500) NOT NULL,
	address_line_two varchar(500),
	tehsil varchar(100),
	district varchar(100) NOT NULL,
	pincode varchar(10) NOT NULL,
	state varchar(100) NOT NULL,
	landmark varchar(500),
	phone_number varchar(20) NOT NULL,
	mobile_one varchar(20),
	mobile_two varchar(20),
	email_id varchar(100),
	number_of_years_in_present_address varchar(100),
	number_of_years_in_present_city varchar(100),
	created_datetime timestamp NOT NULL,
	farmer_id varchar(100) NOT NULL,
	PRIMARY KEY(address_id),
	FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);


CREATE TABLE frcm_app.farmer_address_proof(
	farmer_address_proof_id varchar(100) NOT NULL,
	address_type varchar(1000) UNIQUE NOT NULL,
	front_image varchar(1000),
	back_image varchar(1000),
	ekyc_status varchar(100),
	ekyc_data varchar(100),
	farmer_id varchar(100) NOT NULL,
	PRIMARY KEY(farmer_address_proof_id),
	FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);



CREATE TABLE frcm_app.cultivation_expense(
	cultivation_expense_id varchar(100) NOT NULL,
	farmer_id varchar(100) NOT NULL,
	crop_season_id varchar(100) NOT NULL,
	PRIMARY KEY(cultivation_expense_id),
	FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id),
	FOREIGN KEY (crop_season_id) REFERENCES frcm_app.crop_cycle_season_info(crop_season_id),
	UNIQUE(farmer_id, crop_season_id)
);

CREATE TABLE frcm_app.cultivation_expense_item(
	item_id varchar(100) NOT NULL,
	item_name varchar(500) NOT NULL,
	expense_value varchar(20) NOT NULL,
	cultivation_expense_id varchar(100) NOT NULL,
	PRIMARY KEY(item_id),
	FOREIGN KEY (cultivation_expense_id) REFERENCES frcm_app.cultivation_expense(cultivation_expense_id),
	UNIQUE(item_name)
);





CREATE TABLE frcm_app.information_declaration(
	declaration_id varchar(100) NOT NULL,
	signature_path varchar(500) NOT NULL,
	farmer_id varchar(100) NOT NULL,
	PRIMARY KEY(declaration_id),
	FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id),
	UNIQUE(farmer_id)
);




CREATE TABLE frcm_app.farmer_bank_account(
	bank_account_id varchar(100) NOT NULL,
	bank_id varchar(500) NOT NULL,
	account_number varchar(100) NOT NULL,
	ifsc_code varchar(50) NOT NULL,
	customer_id varchar(50) NOT NULL,
	branch_name varchar(100) NOT NULL,
	farmer_id varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL,
	PRIMARY KEY(bank_account_id),
	FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id),
	FOREIGN KEY (bank_id) REFERENCES frcm_app.bank_info(bank_id),
	UNIQUE(account_number)
);












-- =======================================================================================================
-- =======================================-- DBeaver DDLs -================================================
-- =======================================================================================================

-- frcm_app.bank_info definition

-- Drop table

-- DROP TABLE frcm_app.bank_info;

CREATE TABLE frcm_app.bank_info (
	bank_id varchar(100) NOT NULL,
	bank_name varchar(500) NOT NULL,
	bank_description varchar(1000) NULL,
	CONSTRAINT bank_info_pkey PRIMARY KEY (bank_id)
);


-- frcm_app.crop_cycle_season_info definition

-- Drop table

-- DROP TABLE frcm_app.crop_cycle_season_info;

CREATE TABLE frcm_app.crop_cycle_season_info (
	crop_season_id varchar(100) NOT NULL,
	season_name varchar(500) NOT NULL,
	season_year varchar(10) NOT NULL,
	CONSTRAINT crop_cycle_season_info_pkey PRIMARY KEY (crop_season_id)
);


-- frcm_app.crop_info definition

-- Drop table

-- DROP TABLE frcm_app.crop_info;

CREATE TABLE frcm_app.crop_info (
	crop_id varchar(100) NOT NULL,
	crop_name varchar(500) NOT NULL,
	CONSTRAINT crop_info_pkey PRIMARY KEY (crop_id)
);


-- frcm_app.crop_sold_at_info definition

-- Drop table

-- DROP TABLE frcm_app.crop_sold_at_info;

CREATE TABLE frcm_app.crop_sold_at_info (
	bank_id varchar(100) NOT NULL,
	bank_name varchar(500) NOT NULL,
	bank_description varchar(1000) NULL,
	CONSTRAINT crop_sold_at_info_pkey PRIMARY KEY (bank_id)
);


-- frcm_app.crop_sold_location_data definition

-- Drop table

-- DROP TABLE frcm_app.crop_sold_location_data;

CREATE TABLE frcm_app.crop_sold_location_data (
	crop_selling_location_id varchar(100) NOT NULL,
	type_of_location varchar(500) NOT NULL,
	location_info varchar(500) NOT NULL,
	CONSTRAINT crop_sold_location_data_pkey PRIMARY KEY (crop_selling_location_id)
);


-- frcm_app.field_clusters_data definition

-- Drop table

-- DROP TABLE frcm_app.field_clusters_data;

CREATE TABLE frcm_app.field_clusters_data (
	field_cluster_id varchar(100) NOT NULL,
	cluster_name varchar(500) NOT NULL,
	cluster_boundary varchar(500) NOT NULL,
	cluster_area varchar(100) NOT NULL,
	cluster_address varchar(1000) NOT NULL,
	land_survey_number varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL,
	CONSTRAINT field_clusters_data_pkey PRIMARY KEY (field_cluster_id)
);


-- frcm_app.fpo_data definition

-- Drop table

-- DROP TABLE frcm_app.fpo_data;

CREATE TABLE frcm_app.fpo_data (
	fpo_id varchar(100) NOT NULL,
	fpo_name varchar(500) NOT NULL,
	fpo_address varchar(500) NOT NULL,
	fpo_reg_number varchar(100) NOT NULL,
	contact_person_name varchar(500) NOT NULL,
	contact_person_number varchar(50) NOT NULL,
	contact_person_email varchar(500) NOT NULL,
	asset_type varchar(500) NOT NULL,
	asset_name varchar(500) NOT NULL,
	created_datetime timestamp NULL,
	CONSTRAINT fpo_data_pkey PRIMARY KEY (fpo_id)
);


-- frcm_app.insurance_type_info definition

-- Drop table

-- DROP TABLE frcm_app.insurance_type_info;

CREATE TABLE frcm_app.insurance_type_info (
	insurance_type_id varchar(100) NOT NULL,
	insurance_typ_name varchar(500) NOT NULL,
	CONSTRAINT insurance_type_info_insurance_typ_name_key UNIQUE (insurance_typ_name),
	CONSTRAINT insurance_type_info_pkey PRIMARY KEY (insurance_type_id)
);


-- frcm_app.loan_product_info definition

-- Drop table

-- DROP TABLE frcm_app.loan_product_info;

CREATE TABLE frcm_app.loan_product_info (
	loan_product_id varchar(100) NOT NULL,
	product_type varchar(500) NOT NULL,
	product_name varchar(500) NOT NULL,
	product_description varchar(1000) NULL,
	rate_of_interest varchar(100) NULL,
	CONSTRAINT loan_product_info_pkey PRIMARY KEY (loan_product_id)
);



-- frcm_app.pmfby_info definition

-- Drop table

-- DROP TABLE frcm_app.pmfby_info;

CREATE TABLE frcm_app.pmfby_info (
	pmfby_id varchar(100) NOT NULL,
	amount_paid varchar(20) NOT NULL,
	date_of_repayment date NOT NULL,
	CONSTRAINT pmfby_info_pkey PRIMARY KEY (pmfby_id)
);

-- DROP TABLE frcm_app.question_type_info;

CREATE TABLE frcm_app.question_type_info (
	question_type_id varchar(100) NOT NULL,
	question_type varchar(100) NOT NULL,
	description varchar(500) NULL,
	CONSTRAINT question_type_info_pkey PRIMARY KEY (question_type_id),
	CONSTRAINT question_type_info_question_type_key UNIQUE (question_type)
);


-- frcm_app.salaried_employ_data definition

-- Drop table

-- DROP TABLE frcm_app.salaried_employ_data;

CREATE TABLE frcm_app.salaried_employ_data (
	type_of_company varchar(100) NOT NULL,
	number_of_year_in_current_job varchar(10) NOT NULL,
	previous_company_name varchar(500) NOT NULL,
	gross_monthly_income varchar(20) NOT NULL,
	designation varchar(500) NOT NULL,
	department varchar(500) NOT NULL
);


-- frcm_app.self_employ_data definition

-- Drop table

-- DROP TABLE frcm_app.self_employ_data;

CREATE TABLE frcm_app.self_employ_data (
	it_status_type_id varchar(100) NOT NULL,
	number_of_business_in_year varchar(10) NOT NULL,
	tan varchar(100) NOT NULL,
	monthly_income varchar(220) NOT NULL,
	date_of_incorporation date NOT NULL,
	latest_anual_turnover varchar(20) NOT NULL,
	financial_year varchar(10) NOT NULL,
	CONSTRAINT self_employ_data_pkey PRIMARY KEY (it_status_type_id)
);


-- frcm_app.crop_selling_data definition

-- Drop table

-- DROP TABLE frcm_app.crop_selling_data;

CREATE TABLE frcm_app.crop_selling_data (
	crop_selling_info_id varchar(100) NOT NULL,
	crop_season_id varchar(100) NOT NULL,
	crop_id varchar(100) NOT NULL,
	crop_selling_location_id varchar(100) NOT NULL,
	quantity_sold varchar(500) NOT NULL,
	selling_price varchar(500) NOT NULL,
	selling_date date NOT NULL,
	CONSTRAINT crop_selling_data_pkey PRIMARY KEY (crop_selling_info_id),
	CONSTRAINT crop_selling_data_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES frcm_app.crop_info(crop_id),
	CONSTRAINT crop_selling_data_crop_season_id_fkey FOREIGN KEY (crop_season_id) REFERENCES frcm_app.crop_cycle_season_info(crop_season_id),
	CONSTRAINT crop_selling_data_crop_selling_location_id_fkey FOREIGN KEY (crop_selling_location_id) REFERENCES frcm_app.crop_sold_location_data(crop_selling_location_id)
);


-- frcm_app.farmer_basic_info definition

-- Drop table

-- DROP TABLE frcm_app.farmer_basic_info;

CREATE TABLE frcm_app.farmer_basic_info (
	farmer_id varchar(100) NOT NULL,
	first_name varchar(100) NOT NULL,
	middle_name varchar(100) NULL,
	last_name varchar(100) NULL,
	date_of_birth date NULL,
	gender varchar(50) NOT NULL,
	religion varchar(100) NULL,
	caste varchar(100) NULL,
	education varchar(500) NULL,
	occupation varchar(100) NULL,
	fpold varchar(100) NULL,
	pan_proof_id varchar(100) NULL,
	asset_info_id varchar(100) NULL,
	profile_photo_id varchar(100) NULL,
	CONSTRAINT farmer_basic_info_pkey PRIMARY KEY (farmer_id),
	CONSTRAINT farmer_basic_info_pan_proof_id_fkey FOREIGN KEY (pan_proof_id) REFERENCES frcm_app.pan_proof_data(pan_proof_id)
);


-- frcm_app.farmer_family definition

-- Drop table

-- DROP TABLE frcm_app.farmer_family;

CREATE TABLE frcm_app.farmer_family (
	person_id varchar(100) NOT NULL,
	person_name varchar(500) NOT NULL,
	relation varchar(100) NOT NULL,
	education varchar(500) NULL,
	occupation varchar(500) NULL,
	dependency varchar(100) NULL,
	farmer_id varchar(100) NOT NULL,
	CONSTRAINT farmer_family_pkey PRIMARY KEY (person_id),
	CONSTRAINT farmer_family_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);


-- frcm_app.field_data definition

-- Drop table

-- DROP TABLE frcm_app.field_data;

CREATE TABLE frcm_app.field_data (
	field_id varchar(100) NOT NULL,
	field_cluster_id varchar(100) NOT NULL,
	field_boundary varchar(100) NOT NULL,
	field_area varchar(100) NOT NULL,
	field_address varchar(1000) NOT NULL,
	bore_depth varchar(100) NULL,
	pump_depth varchar(100) NULL,
	expected_produce varchar(100) NULL,
	perceived_soil_quality varchar(100) NULL,
	comment_on_soil_quality varchar(100) NULL,
	perceived_water_quality varchar(100) NULL,
	comment_on_water_quality varchar(1000) NULL,
	perceived_yield_quality varchar(100) NULL,
	comment_on_yield_quality varchar(1000) NULL,
	CONSTRAINT field_data_pkey PRIMARY KEY (field_id),
	CONSTRAINT field_data_field_cluster_id_fkey FOREIGN KEY (field_cluster_id) REFERENCES frcm_app.field_clusters_data(field_cluster_id)
);


-- frcm_app.information_declaration definition

-- Drop table

-- DROP TABLE frcm_app.information_declaration;

CREATE TABLE frcm_app.information_declaration (
	declaration_id varchar(100) NOT NULL,
	signature_path varchar(500) NOT NULL,
	farmer_id varchar(100) NOT NULL,
	CONSTRAINT information_declaration_pkey PRIMARY KEY (declaration_id),
	CONSTRAINT information_declaration_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);


-- frcm_app.irrigation_source_data definition

-- Drop table

-- DROP TABLE frcm_app.irrigation_source_data;

CREATE TABLE frcm_app.irrigation_source_data (
	irrigation_source_id varchar(100) NOT NULL,
	field_id varchar(100) NOT NULL,
	source_type_name varchar(500) NOT NULL,
	source_descrption varchar(1000) NULL,
	location_info varchar(1000) NULL,
	created_datetime timestamp NOT NULL,
	CONSTRAINT irrigation_source_data_pkey PRIMARY KEY (irrigation_source_id),
	CONSTRAINT irrigation_source_data_field_id_fkey FOREIGN KEY (field_id) REFERENCES frcm_app.field_data(field_id)
);


-- frcm_app.kcc_info definition

-- Drop table

-- DROP TABLE frcm_app.kcc_info;

CREATE TABLE frcm_app.kcc_info (
	kcc_info_id varchar(100) NOT NULL,
	bank_id varchar(100) NOT NULL,
	credit_amount varchar(20) NOT NULL,
	date_of_disbursement date NOT NULL,
	repayment_amount varchar(20) NULL,
	repayment_date date NULL,
	size_of_land varchar(100) NOT NULL,
	CONSTRAINT kcc_info_pkey PRIMARY KEY (kcc_info_id),
	CONSTRAINT kcc_info_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES frcm_app.bank_info(bank_id)
);


-- frcm_app.loan_requirement_data definition

-- Drop table

-- DROP TABLE frcm_app.loan_requirement_data;

CREATE TABLE frcm_app.loan_requirement_data (
	loan_requirement_id varchar(100) NOT NULL,
	field_id varchar(500) NOT NULL,
	loan_product_id varchar(500) NOT NULL,
	planned_cultivation_area varchar(100) NOT NULL,
	loan_amount_wanted varchar(100) NOT NULL,
	crop varchar(100) NOT NULL,
	CONSTRAINT loan_requirement_data_pkey PRIMARY KEY (loan_requirement_id),
	CONSTRAINT loan_requirement_data_loan_product_id_fkey FOREIGN KEY (loan_product_id) REFERENCES frcm_app.loan_product_info(loan_product_id)
);


-- frcm_app.other_insurance_info definition

-- Drop table

-- DROP TABLE frcm_app.other_insurance_info;

CREATE TABLE frcm_app.other_insurance_info (
	insurance_id varchar(100) NOT NULL,
	insurance_type_id varchar(100) NOT NULL,
	month_year_last_taken varchar(10) NOT NULL,
	premium_paid varchar(200) NOT NULL,
	settlement_amount_status varchar(100) NOT NULL,
	sanctification_with_disbursement varchar(100) NOT NULL,
	CONSTRAINT other_insurance_info_pkey PRIMARY KEY (insurance_id),
	CONSTRAINT other_insurance_info_insurance_type_id_fkey FOREIGN KEY (insurance_type_id) REFERENCES frcm_app.insurance_type_info(insurance_type_id)
);


-- frcm_app.other_liability_info definition

-- Drop table

-- DROP TABLE frcm_app.other_liability_info;

CREATE TABLE frcm_app.other_liability_info (
	liability_id varchar(100) NOT NULL,
	bank_id varchar(100) NOT NULL,
	credit_amount varchar(20) NOT NULL,
	date_of_disbursement date NOT NULL,
	repayment_amount varchar(20) NULL,
	repayment_date date NULL,
	CONSTRAINT other_liability_info_pkey PRIMARY KEY (liability_id),
	CONSTRAINT other_liability_info_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES frcm_app.bank_info(bank_id)
);


-- frcm_app.output_users_data definition

-- Drop table

-- DROP TABLE frcm_app.output_users_data;

CREATE TABLE frcm_app.output_users_data (
	output_user_id varchar(100) NOT NULL,
	crop_id varchar(500) NOT NULL,
	crop_season_id varchar(100) NULL,
	seed_replacement_percentage varchar(20) NULL,
	self_consumption_percentage varchar(20) NULL,
	selling_at_market_place_percentage varchar(20) NULL,
	CONSTRAINT output_users_data_pkey PRIMARY KEY (output_user_id),
	CONSTRAINT output_users_data_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES frcm_app.crop_info(crop_id),
	CONSTRAINT output_users_data_crop_season_id_fkey FOREIGN KEY (crop_season_id) REFERENCES frcm_app.crop_cycle_season_info(crop_season_id)
);


-- frcm_app.property_data definition

-- Drop table

-- DROP TABLE frcm_app.property_data;

CREATE TABLE frcm_app.property_data (
	property_id varchar(100) NOT NULL,
	asset_info_id varchar(1000) NOT NULL,
	property_type_id varchar(100) NOT NULL,
	picture varchar(1000) NULL,
	ownership_type varchar(100) NULL,
	particular varchar(100) NULL,
	cumulative_value varchar(100) NULL,
	CONSTRAINT property_data_pkey PRIMARY KEY (property_id),
	CONSTRAINT property_data_property_type_id_fkey FOREIGN KEY (property_type_id) REFERENCES frcm_app.property_type_info(property_type_id)
);


-- frcm_app.question_info definition

-- Drop table

-- DROP TABLE frcm_app.question_info;

CREATE TABLE frcm_app.question_info (
	question_id varchar(100) NOT NULL,
	question_type_id varchar(500) NOT NULL,
	question_text varchar(500) NOT NULL,
	answer_list jsonb NULL,
	CONSTRAINT question_info_pkey PRIMARY KEY (question_id),
	CONSTRAINT question_info_question_type_id_question_text_key UNIQUE (question_type_id, question_text),
	CONSTRAINT question_info_question_type_id_fkey FOREIGN KEY (question_type_id) REFERENCES frcm_app.question_type_info(question_type_id)
);


-- frcm_app.question_response_data definition

-- Drop table

-- DROP TABLE frcm_app.question_response_data;

CREATE TABLE frcm_app.question_response_data (
	response_id varchar(100) NOT NULL,
	question_id varchar(500) NOT NULL,
	answer_id varchar(500) NOT NULL,
	rank_order varchar(10) NOT NULL,
	response_comment varchar(500) NULL,
	farmer_id varchar(100) NOT NULL,
	created_datetime timestamp NULL,
	CONSTRAINT question_response_data_pkey PRIMARY KEY (response_id),
	CONSTRAINT question_response_data_question_id_farmer_id_key UNIQUE (question_id, farmer_id),
	CONSTRAINT question_response_data_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id),
	CONSTRAINT question_response_data_question_id_fkey FOREIGN KEY (question_id) REFERENCES frcm_app.question_info(question_id)
);


-- frcm_app.soil_test_data definition

-- Drop table

-- DROP TABLE frcm_app.soil_test_data;

CREATE TABLE frcm_app.soil_test_data (
	soil_test_id varchar(100) NOT NULL,
	field_id varchar(100) NOT NULL,
	date_of_report date NULL,
	report_pdf varchar(1000) NULL,
	soil_type varchar(100) NULL,
	location_info varchar(1000) NULL,
	par1 varchar(1000) NULL,
	par2 varchar(1000) NULL,
	par3 varchar(1000) NULL,
	par4 varchar(1000) NULL,
	created_datetime timestamp NOT NULL,
	CONSTRAINT soil_test_data_pkey PRIMARY KEY (soil_test_id),
	CONSTRAINT soil_test_data_field_id_fkey FOREIGN KEY (field_id) REFERENCES frcm_app.field_data(field_id)
);


-- frcm_app.water_source_data definition

-- Drop table

-- DROP TABLE frcm_app.water_source_data;

CREATE TABLE frcm_app.water_source_data (
	water_source_id varchar(100) NOT NULL,
	field_id varchar(500) NOT NULL,
	source_type_name varchar(500) NOT NULL,
	source_descrption varchar(1000) NULL,
	location_info varchar(1000) NULL,
	created_datetime timestamp NOT NULL,
	CONSTRAINT water_source_data_pkey PRIMARY KEY (water_source_id),
	CONSTRAINT water_source_data_field_id_fkey FOREIGN KEY (field_id) REFERENCES frcm_app.field_data(field_id)
);


-- frcm_app.water_test_data definition

-- Drop table

-- DROP TABLE frcm_app.water_test_data;

CREATE TABLE frcm_app.water_test_data (
	water_test_id varchar(100) NOT NULL,
	water_source_id varchar(100) NOT NULL,
	report varchar(1000) NULL,
	source_descrption varchar(1000) NULL,
	par1 varchar(1000) NULL,
	par2 varchar(1000) NULL,
	par3 varchar(1000) NULL,
	created_datetime timestamp NOT NULL,
	CONSTRAINT water_test_data_pkey PRIMARY KEY (water_test_id),
	CONSTRAINT water_test_data_water_source_id_fkey FOREIGN KEY (water_source_id) REFERENCES frcm_app.water_source_data(water_source_id)
);


-- frcm_app.cultivation_expense definition

-- Drop table

-- DROP TABLE frcm_app.cultivation_expense;

CREATE TABLE frcm_app.cultivation_expense (
	cultivation_expense_id varchar(100) NOT NULL,
	farmer_id varchar(100) NOT NULL,
	crop_season_id varchar(100) NOT NULL,
	CONSTRAINT cultivation_expense_farmer_id_crop_season_id_key UNIQUE (farmer_id, crop_season_id),
	CONSTRAINT cultivation_expense_pkey PRIMARY KEY (cultivation_expense_id),
	CONSTRAINT cultivation_expense_crop_season_id_fkey FOREIGN KEY (crop_season_id) REFERENCES frcm_app.crop_cycle_season_info(crop_season_id),
	CONSTRAINT cultivation_expense_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);


-- frcm_app.cultivation_expense_item definition

-- Drop table

-- DROP TABLE frcm_app.cultivation_expense_item;

CREATE TABLE frcm_app.cultivation_expense_item (
	item_id varchar(100) NOT NULL,
	item_name varchar(500) NOT NULL,
	expense_value varchar(20) NOT NULL,
	cultivation_expense_id varchar(100) NOT NULL,
	CONSTRAINT cultivation_expense_item_item_name_key UNIQUE (item_name),
	CONSTRAINT cultivation_expense_item_pkey PRIMARY KEY (item_id),
	CONSTRAINT cultivation_expense_item_cultivation_expense_id_fkey FOREIGN KEY (cultivation_expense_id) REFERENCES frcm_app.cultivation_expense(cultivation_expense_id)
);


-- frcm_app.farmer_address definition

-- Drop table

-- DROP TABLE frcm_app.farmer_address;

CREATE TABLE frcm_app.farmer_address (
	address_id varchar(100) NOT NULL,
	address_line_one varchar(500) NOT NULL,
	address_line_two varchar(500) NULL,
	tehsil varchar(100) NULL,
	district varchar(100) NOT NULL,
	pincode varchar(10) NOT NULL,
	state varchar(100) NOT NULL,
	landmark varchar(500) NULL,
	phone_number varchar(20) NOT NULL,
	mobile_one varchar(20) NULL,
	mobile_two varchar(20) NULL,
	email_id varchar(100) NULL,
	number_of_years_in_present_address varchar(100) NULL,
	number_of_years_in_present_city varchar(100) NULL,
	created_datetime timestamp NOT NULL,
	farmer_id varchar(100) NOT NULL,
	CONSTRAINT farmer_address_pkey PRIMARY KEY (address_id),
	CONSTRAINT farmer_address_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);


-- frcm_app.farmer_address_proof definition

-- Drop table

-- DROP TABLE frcm_app.farmer_address_proof;

CREATE TABLE frcm_app.farmer_address_proof (
	farmer_address_proof_id varchar(100) NOT NULL,
	address_type varchar(1000) NOT NULL,
	front_image varchar(1000) NULL,
	back_image varchar(1000) NULL,
	ekyc_status varchar(100) NULL,
	ekyc_data varchar(100) NULL,
	farmer_id varchar(100) NOT NULL,
	CONSTRAINT farmer_address_proof_address_type_key UNIQUE (address_type),
	CONSTRAINT farmer_address_proof_pkey PRIMARY KEY (farmer_address_proof_id),
	CONSTRAINT farmer_address_proof_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);


-- frcm_app.farmer_bank_account definition

-- Drop table

-- DROP TABLE frcm_app.farmer_bank_account;

CREATE TABLE frcm_app.farmer_bank_account (
	bank_account_id varchar(100) NOT NULL,
	bank_id varchar(500) NOT NULL,
	account_number varchar(100) NOT NULL,
	ifsc_code varchar(50) NOT NULL,
	customer_id varchar(50) NOT NULL,
	branch_name varchar(100) NOT NULL,
	farmer_id varchar(100) NOT NULL,
	created_datetime timestamp NOT NULL,
	CONSTRAINT farmer_bank_account_account_number_key UNIQUE (account_number),
	CONSTRAINT farmer_bank_account_pkey PRIMARY KEY (bank_account_id),
	CONSTRAINT farmer_bank_account_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES frcm_app.bank_info(bank_id),
	CONSTRAINT farmer_bank_account_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES frcm_app.farmer_basic_info(farmer_id)
);