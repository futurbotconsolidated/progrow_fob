CREATE TABLE frcm_app.question_section_meta(
auto_id serial unique NOT NULL,
	section_id varchar(100)  PRIMARY KEY NOT NULL,
	section_name varchar(1000) UNIQUE NOT null,
	description varchar(1000),
	is_required_yn boolean
);


CREATE TABLE frcm_app.question_type_meta(
auto_id serial unique not NULL,
	question_type_id varchar(100) NOT NULL,
	section_id varchar(100) NOT NULL,
	question_type_name varchar(500) UNIQUE NOT NULL,
	description varchar(1000),
	is_required_yn boolean,
	PRIMARY KEY(question_type_id),
	UNIQUE(section_id,question_type_name),
	FOREIGN KEY (section_id) REFERENCES frcm_app.question_section_meta(section_id)
);

CREATE TABLE frcm_app.question_meta(
	auto_id serial unique not NULL,
	question_id varchar(100) NOT NULL,
	question_type_id varchar(100) NOT NULL,
	question_name varchar(1000) NOT NULL,
	description varchar(1000),
	is_required_yn boolean,
	PRIMARY KEY(question_id),
	FOREIGN KEY (question_type_id) REFERENCES frcm_app.question_type_meta(question_type_id),
	UNIQUE(question_type_id,question_name)
);

CREATE TABLE frcm_app.question_answer_meta(
	auto_id serial unique not NULL,
	answer_id varchar(100) NOT NULL,
	question_id varchar(100) NOT NULL,
	answer_name varchar(1000) NOT NULL,
	answer_input_type varchar(100),
	description varchar(1000),
	is_required_yn boolean,
	PRIMARY KEY(answer_id),
	FOREIGN KEY (question_id) REFERENCES frcm_app.question_meta(question_id),
	UNIQUE(question_id,answer_name)
);


CREATE TABLE frcm_app.farmer_basic_data (
	farmer_id varchar(100) NOT NULL,
	first_name varchar(500) NOT NULL,
	middle_name varchar(500) NULL,
	last_name varchar(500) NULL,
	date_of_birth date NULL,
	gender varchar(50) NOT NULL,
	religion varchar(100) NULL,
	caste varchar(100) NULL,
	education varchar(500) NULL,
	occupation varchar(500) NULL,
	profile_photo_id varchar(1000) NULL,
	auto_id serial4 NOT NULL,
	is_required_yn bool NULL,
	description varchar(2000) NULL,
	CONSTRAINT farmer_basic_data_auto_id_key UNIQUE (auto_id),
	CONSTRAINT farmer_basic_data_pkey PRIMARY KEY (farmer_id)
);


CREATE TABLE frcm_app.pan_proof_data (
	auto_id serial unique not NULL,
	pan_proof_id varchar(100) NOT NULL,
	pan_card_image varchar(1000) NULL,
	pan_card_number varchar(100) NOT NULL,
	pan_card_kyc_report varchar(1000) NULL,
	is_required_yn boolean,
	UNIQUE (pan_card_number),
	PRIMARY KEY (pan_proof_id)
);



CREATE TABLE frcm_app.property_type_meta (
	auto_id serial unique not NULL,
	property_type_id varchar(100) NOT NULL,
	property_type_name varchar(100) NOT NULL,
	description varchar(1000) NULL,
	is_required_yn boolean,
	PRIMARY KEY (property_type_id),
	 UNIQUE (property_type_name)
);
