
CREATE TABLE form_value_master(
	auto_id serial  unique not null,
	value_type varchar(100) not null,
	value_id int4 primary key NOT NULL,
	value_name varchar(100) NOT NULL,
	value_description varchar(1000),
	display_order_id int4 not null,
	is_required boolean,
	unique(value_type,value_name)
);



insert into form_value_master (value_type,value_id,value_name,display_order_id,is_required) values
('Religion',1,'Hindu',1,true),
('Religion',2,'Muslim',2,true),
('Caste',3,'SC',1,true),
('Caste',4,'ST',2,true),
('PropertyType',5,'Type-1',1,true),
('PropertyType',12,'Type-2',2,true),
('Relation',14,'Mother',1,true),
('Relation',15,'Sister',2,true),
('Education',19,'Commerce',1,true),
('Education',20,'Engineering',2,true),
('Occupation',22,'Farmer',1,true),
('Occupation',23,'Lawer',2,true),
('OwnershipType',24,'Type-1',1,true),
('OwnershipType',25,'Type-2',2,true),
('Perticular',26,'Type-1',1,true),
('Perticular',27,'Type-2',2,true),
('IrrigationSystem',28,'Type-1',1,true),
('IrrigationSystem',29,'Type-2',2,true),
('WaterSource',30,'Type-1',1,true),
('WaterSource',31,'Type-2',2,true),
('CropSeason',32,'Rabi-2021',1,true),
('CropSeason',33,'Kharif-2021',2,true),
('Crop',34,'Crop-1',1,true),
('Crop',35,'Crop-2',2,true),
('Salutation',36,'Mr.',1,true),
('Salutation',37,'Mrs.',2,true),
('Dependency',38,'Dependency-1',1,true),
('Dependency',39,'Dependency-2',2,true),
('CropLoadProduct',40,'CropLoadProduct-1',1,true),
('CropLoadProduct',41,'CropLoadProduct-2',2,true),
('Gender',42,'Male',1,true),
('Gender',43,'Female',2,true);



CREATE TABLE question_section(
auto_id serial unique NOT NULL,
	section_id varchar(100)  PRIMARY KEY NOT NULL,
	section_name varchar(1000) UNIQUE NOT null,
	description varchar(1000),
	is_required_yn boolean
);



CREATE TABLE question_type(
	question_type_id varchar(100) NOT NULL,
	question_type_name varchar(200) NOT NULL,
	description varchar(500),
	is_required_yn boolean,
	PRIMARY KEY(question_type_id),
	UNIQUE(question_type_name)

);




CREATE TABLE question_master(
	auto_id serial unique not NULL,
	question_id varchar(100) NOT NULL,
	question_name varchar(1000) NOT NULL,
	section_id varchar(100) NOT NULL,
	question_type_id varchar(100) NOT NULL,
	answer_list jsonb,
	description varchar(1000),
	is_required_yn boolean,
	PRIMARY KEY(question_id),
	FOREIGN KEY (question_type_id) REFERENCES question_type(question_type_id),
	FOREIGN KEY (section_id) REFERENCES question_section(section_id),
	UNIQUE(question_type_id,question_name)
);


CREATE TABLE farmer_basic_data (
	auto_id serial4 unique NOT NULL,
	farmer_id varchar(100) NOT NULL,
	salutation_name varchar(20) NULL,
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
	identity_proof_details jsonb,
	address_proof_details jsonb,
	other_identity_details jsonb,
	education_details jsonb,
	address_details jsonb,
	property_status varchar(1000) NULL,
	permanent_address varchar(1000) NULL,
	communication_address varchar(1000) NULL,
	family_details varchar(1000) NULL,
	property_ownership varchar(1000) NULL,
	is_required_yn bool NULL,
	PRIMARY KEY (farmer_id)
);






CREATE TABLE field_data(
	auto_id serial4 unique NOT NULL,
	farmer_id varchar(100),
	field_id varchar(100) NOT NULL,
	field_boundary varchar(100) NOT NULL,
	field_area_ha varchar(100) NOT NULL,
	field_address varchar(1000) NOT NULL,
	planned_season_detail jsonb,
	historical_season_detail jsonb,
	field_ownership_detail jsonb,
	enumerate_planned_season jsonb,
	undertaking_cultivation jsonb,
	is_required_yn bool NULL,
	PRIMARY KEY(field_id),
	FOREIGN KEY(farmer_id) references farmer_basic_data(farmer_id)
);


CREATE TABLE co_applicant_data(
	auto_id serial4 unique NOT NULL,
	farmer_id varchar(100),
	co_applicant_id varchar(100) primary key,
	salutation_name varchar(20) NULL,
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
	identity_proof_details jsonb,
	address_proof_details jsonb,
	other_identity_details jsonb,
	education_details jsonb,
	address_details jsonb,
	property_status varchar(1000) NULL,
	permanent_address varchar(1000) NULL,
	communication_address varchar(1000) NULL,
	family_details varchar(1000) NULL,
	property_ownership varchar(1000) NULL,
	is_required_yn bool NULL,
	FOREIGN KEY(farmer_id) references farmer_basic_data(farmer_id)
);

CREATE TABLE technology_adoption(
	auto_id serial4 unique NOT NULL,
	farmer_id varchar(100),
	question_response jsonb,
	is_required_yn bool NULL,
	FOREIGN KEY(farmer_id) references farmer_basic_data(farmer_id)
)

CREATE TABLE produce_aggregator(
	auto_id serial4 unique NOT NULL,
	farmer_id varchar(100),
	question_response jsonb,
	is_required_yn bool NULL,
	FOREIGN KEY(farmer_id) references farmer_basic_data(farmer_id)
)


CREATE TABLE crop_marketplan(
	auto_id serial4 unique NOT NULL,
	farmer_id varchar(100),
	question_response jsonb,
	is_required_yn bool NULL,
	FOREIGN KEY(farmer_id) references farmer_basic_data(farmer_id)
)

CREATE TABLE financial_planning(
	auto_id serial4 unique NOT NULL,
	farmer_id varchar(100),
	crop_loan_requirement jsonb,
	insurance_details jsonb,
	bank_details jsonb,
	question_response jsonb,
	is_required_yn bool NULL,
	FOREIGN KEY(farmer_id) references farmer_basic_data(farmer_id)
)


